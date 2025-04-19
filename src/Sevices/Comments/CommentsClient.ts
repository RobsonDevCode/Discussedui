import axios, {
  Axios,
  AxiosError,
  AxiosResponse,
  AxiosRequestConfig,
} from "axios";
import { v4 as uuidv4 } from "uuid";
import { Comment } from "../../models/Comments/Comment";
import { useTokenClient } from "../Login/TokenClient";
import { Like } from "../../models/Comments/Like";
import { PostComment } from "../../models/Comments/PostComment";
import {
  mapCommentSafely,
  mapComments,
  mapCommentsWithReplies,
  mapCommentResponses,
  mapRepost,
} from "../../Mapper/MapComments";
import { CommentResponse } from "../../models/Comments/CommentResponse";
import { PostRepost } from "../../models/Comments/PostRepost";
import { Repost } from "../../models/Comments/Repost";
import { useGlobalExtensions } from "../../Extensions/GlobalExtensions";

// Create a map to track retry attempts for each request
const retryAttemptsMap = new Map<string, number>();
const MAX_RETRIES = 1;

// Base API client setup
const commentClient = axios.create({
  baseURL: import.meta.env.VITE_COMMENT_BASE_URL,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const UseCommentClient = () => {
  const tokenCli = useTokenClient();
  const extensions = useGlobalExtensions();

  // This is a wrapper for API calls that handles 401 errors with retries
  const executeWithRetry = async <T>(
    requestFn: (jwt: string | null) => Promise<T>,
    userId: string,
    existingJwt: string | null = null
  ): Promise<T> => {
    // Generate a unique ID for this request to track retries
    const requestId = uuidv4();

    // Initialize retry counter for this request
    if (!retryAttemptsMap.has(requestId)) {
      retryAttemptsMap.set(requestId, 0);
    }

    try {
      // Get JWT if not provided
      let jwt = existingJwt;
      if (!jwt) {
        jwt = await tokenCli.getJwt(userId, "id");
      }

      // Execute the request function
      return await requestFn(jwt);
    } catch (error) {
      // Check if error is a 401 unauthorized
      if (error instanceof AxiosError && error.response?.status === 401) {
        // Get current retry count
        const retryCount = retryAttemptsMap.get(requestId) || 0;

        // Check if we can retry
        if (retryCount < MAX_RETRIES) {
          // Increment retry counter
          retryAttemptsMap.set(requestId, retryCount + 1);

          // Get fresh token
          try {
            const newJwt = await tokenCli.getJwt(userId, "id"); // force refresh

            // Add a small delay before retrying (helps prevent rapid hammering of API)
            await new Promise((resolve) => setTimeout(resolve, 300));

            // Retry the request with new token
            return await executeWithRetry(requestFn, userId, newJwt);
          } catch (tokenError) {
            // If getting a new token fails, clean up and rethrow
            retryAttemptsMap.delete(requestId);
            throw tokenError;
          }
        }
      }

      // If we get here, either it's not a 401 error or we've exceeded retries
      // Clean up the map to prevent memory leaks
      retryAttemptsMap.delete(requestId);

      // Log the error
      extensions.logApiError(error);

      // Rethrow
      throw error;
    } finally {
      // Ensure we clean up the map even if the request succeeds
      retryAttemptsMap.delete(requestId);
    }
  };

  /**
   * Get comments feed
   */
  const getComments = async (
    userId: string | null,
    offset: number | null,
    jwt: string | null = null
  ): Promise<CommentResponse[]> => {
    // For non-authenticated requests
    if (userId === null || userId === undefined) {
      try {
        let query = `/comment/feed`;
        if (offset !== null) {
          query = `/comment/feed?offset=${offset}`;
        }
        const response = await commentClient.get(query);
        return mapCommentResponses(response.data);
      } catch (error) {
        extensions.logApiError(error);
        return [];
      }
    }

    // For authenticated requests, use the retry wrapper
    return executeWithRetry(
      async (token) => {
        commentClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;

        let query = `/comment/feed-${userId}`;
        if (offset !== null) {
          query = query + `?offset=${offset}`;
        }

        const response = await commentClient.get(query);
        return mapCommentResponses(response.data);
      },
      userId,
      jwt
    );
  };

  /**
   * Get top comments
   */
  const getTopComments = async (
    userId: string | null,
    offset: number | null
  ): Promise<CommentResponse[]> => {
    let query = "/comment/top";
    let hasParams = false;
    // Add userId if present
    if (userId) {
      query += `?userId=${userId}`;
      hasParams = true;
    }
    if (offset !== undefined && offset !== null) {
      query += hasParams ? `&offset=${offset}` : `?offset=${offset}`;
    }

    try {
      const response = await commentClient.get(query);
      return mapCommentResponses(response.data);
    } catch (error) {
      extensions.logApiError(error);
      return [];
    }
  };

  /**
   * Get a comment with its replies
   */
  const getCommentWithReplies = async (commentId: string, userId: string) => {
    const response = await commentClient.get(`/comment/${commentId}`);
    return mapCommentsWithReplies(response.data);
  };

  /**
   * Check if user can comment
   */
  const validate = async (
    userId: string,
    jwt: string | null = null
  ): Promise<boolean> => {
    try {
      return await executeWithRetry(
        async (token) => {
          commentClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          const response = await commentClient.get(
            `comment/validate/${userId}`
          );
          return response.data.canComment;
        },
        userId,
        jwt
      );
    } catch (error) {
      extensions.logApiError(error);
      return false;
    }
  };

  /**
   * Get comments from accounts the user follows
   */
  const getFollowingComments = async (
    userId: string,
    offset: number | null
  ): Promise<Comment[]> => {
    try {
      return await executeWithRetry(async (token) => {
        commentClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await commentClient.get(`comment/${userId}/following`);
        return mapComments(response.data);
      }, userId);
    } catch (error) {
      extensions.logApiError(error);
      return [];
    }
  };

  /**
   * Like a comment
   */
  const sendLikeInteraction = async (like: Like): Promise<AxiosResponse> => {
    return executeWithRetry(async (token) => {
      commentClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return await commentClient.patch(`/comment/like-interaction`, {
        liked: like.liked,
        user_id: like.user_id,
        comment_id: like.comment_id,
        repost_id: like.repost_id,
      });
    }, like.user_id);
  };

  /**
   * Unlike a comment
   */
  const dislikeComment = async (like: Like): Promise<AxiosResponse> => {
    return executeWithRetry(async (token) => {
      commentClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      return await commentClient.patch(`/comment/${like.comment_id}/unlike`, {
        user_id: like.user_id,
        comment_id: like.comment_id,
      });
    }, like.user_id);
  };

  /**
   * Repost a comment
   */
  const postRepost = async (
    repostRequest: PostRepost,
    jwt: string | null = null
  ): Promise<Repost | null> => {
    try {
      return await executeWithRetry(
        async (token) => {
          commentClient.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
          const response = await commentClient.post(
            `/comment/${repostRequest.comment_id}-repost`,
            repostRequest
          );
          return mapRepost(response.data);
        },
        repostRequest.user_id,
        jwt
      );
    } catch (error) {
      extensions.logApiError(error);
      return null;
    }
  };

  /**
   * Post a new comment
   */
  const postComment = async (
    comment: PostComment,
    jwt: string | null = null
  ): Promise<Comment | null> => {
    // Format content for proper JSON
    const formattedComment = {
      ...comment,
      content: comment.content.replace(/\n/g, "\\n").replace(/\r/g, "\\r"),
    };

    return executeWithRetry(
      async (token) => {
        commentClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${token}`;
        const response = await commentClient.post("/comment", formattedComment);
        return mapCommentSafely(response.data);
      },
      comment.user_id,
      jwt
    );
  };

  return {
    getComments,
    getFollowingComments,
    getTopComments,
    getCommentWithReplies,
    sendLikeInteraction,
    dislikeComment,
    postComment,
    postRepost,
    validate,
  };
};
