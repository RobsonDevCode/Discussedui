import axios, { Axios, AxiosError, AxiosResponse } from "axios"
import { v4 as uuidv4 } from 'uuid';
import { Comment } from "../../models/Comments/Comment"
import { ProblemDetails } from "../userClient";
import { useTokenClient } from "../Login/TokenClient";
import { Like } from "../../models/Comments/Like";
import { PostComment } from "../../models/Comments/PostComment";
import { mapComment, mapComments, mapReply, mapReplies, mapCommentsWithReplies } from '../../Mapper/MapComments';

interface Result<T> {
    Data: T;
    Message: string;
}

const commentClient = axios.create({
    baseURL: import.meta.env.VITE_COMMENT_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    }
})

const tokenCli = useTokenClient();
let authRetry = 0;
const MAX_RETRIES = 1;

// Axios error type guard
export function isProblemDetails(
    error: AxiosError | Error | unknown
): error is AxiosError<ProblemDetails> {
    return (
        error instanceof AxiosError &&
        error.response?.data?.title !== undefined &&
        error.response?.data?.status !== undefined
    );
}
export const UseCommentClient = () => {
    const getComments = async (userId: string | null, offset: number | null): Promise<Comment[]> => {
        try {
            let response;
            if (userId === null || userId === undefined) {
                var query = `/comment/feed`;
                if (offset !== null) {
                    query = `/comment/feed?offset=${offset}`;
                }
                response = await commentClient.get(query);
                return mapComments(response.data);
            } else {
                var jwt = await tokenCli.getJwt(userId, "id");
                commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

                var query = `/comment/feed/${userId}`;
                if (offset !== null) {
                    query = query + `?offset=${offset}`;
                }

                response = await commentClient.get(query);
                return mapComments(response.data);
            }
        } catch (error: unknown) {
            logApiError(error);
            throw error;
        }

    }

    const getCommentWithReplies = async (commentId: string, userId: string, jwt: string | null) => {
        try {
            if (jwt === null || jwt === undefined) {
                jwt = await tokenCli.getJwt(userId, "id");
            }
            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            const response = await commentClient.get(`/comment/${commentId}`);
            console.log(response.data)
            return mapCommentsWithReplies(response.data);
        } catch (error: unknown) {
            if (error instanceof AxiosError &&
                error.response?.status === 401 &&
                authRetry < MAX_RETRIES) {
                console.log("here");

                authRetry++;

                const freshJwt = await tokenCli.getJwt(userId, "id");

                return await getCommentWithReplies(commentId, userId, freshJwt);
            }

            logApiError(error);

            authRetry = 0;

            throw error;
        }
    }

    const validate = async (userId: string, jwt: string | null): Promise<boolean> => {
        try {
            if (jwt === null || jwt === undefined) {
                jwt = await tokenCli.getJwt(userId, "id");
            }

            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            const response = await commentClient.get(`comment/validate/${userId}`);

            const canComment = response.data.canComment;
            return canComment;
        } catch (error: unknown) {
            logApiError(error);
            throw error;
        }
    }

    const getFollowingComments = async (userId: string, offset: number | null): Promise<Comment[]> => {
        try {
            const jwt = await tokenCli.getJwt(userId, "id");
            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

            const response = await commentClient.get(`comment/${userId}/following`);
            return mapComments(response.data);
        }
        catch (error: unknown) {
            logApiError(error);

            return [];
        }
    }

    const getTopComments = async (userId: string | null, offset: number | null): Promise<Comment[]> => {

        var query = "/comment/top";
        let hasParams = false;
        // Add userId if present
        if (userId) {
            query += `?userId=${userId}`;
            hasParams = true;
        }
        if (offset !== undefined && offset !== null) {
            query += hasParams ? `&offset=${offset}` : `?offset=${offset}`;
        }
        const response = await commentClient.get(query);
        return mapComments(response.data);
    }

    const likeComment = async (like: Like): Promise<AxiosResponse> => {
        try {
            const jwt = await tokenCli.getJwt(like.user_id, "id");
            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            return await commentClient.patch(`/comment/${like.comment_id}/like`,
                {
                    user_id: like.user_id,
                    comment_id: like.comment_id
                }
            );
        } catch (error: unknown) {
            logApiError(error);
            throw error;
        }
    }

    const dislikeComment = async (like: Like): Promise<AxiosResponse> => {
        try {
            const jwt = await tokenCli.getJwt(like.user_id, "id");
            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            return await commentClient.patch(`/comment/${like.comment_id}/unlike`,
                {
                    user_id: like.user_id,
                    comment_id: like.comment_id
                }
            );
        } catch (error: unknown) {
            logApiError(error);
            throw error;
        }
    }

    const postComment = async (comment: PostComment, jwt: string | null): Promise<Comment> => {
        try {
            // If no JWT is provided, get one
            if (jwt === null || jwt === undefined) {
                jwt = await tokenCli.getJwt(comment.user_id, "id");
            }

            //replace new line with "/n" for valid json
            comment.content = comment.content.replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");
            commentClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            const response = await commentClient.post('/comment', comment);
            // Reset retry counter on success
            authRetry = 0;

            return mapComment(response.data);
        }
        catch (error: unknown) {
            // Handle 401 - possible expired token
            if (error instanceof AxiosError &&
                error.response?.status === 401 &&
                authRetry < MAX_RETRIES) {
                console.log("here");

                // Increment retry counter
                authRetry++;

                // Get a fresh JWT token
                const freshJwt = await tokenCli.getJwt(comment.user_id, "id");

                // Retry with the fresh token
                return await postComment(comment, freshJwt);
            }

            // Log the error
            logApiError(error);

            // Reset retry counter after error handling is complete
            authRetry = 0;

            throw error;
        }
    };


    function logApiError(error: unknown) {
        if (isProblemDetails(error)) {
            const problemDetails = error.response?.data;
            console.error(problemDetails?.detail || problemDetails?.title || "An error occurred on our side, we're sorry for the inconvenience.");
        } else if (error instanceof AxiosError) {
            if (error.response) {
                console.error(error.response.data?.detail || "An error occurred on our side, we're sorry for the inconvenience.");
            } else if (error.request) {
                console.error("Unable to connect to the server. Please check your internet connection.");
            } else {
                console.error("An unexpected error occurred. Please try again.");
            }
        } else if (error instanceof Error) {
            console.error(error.message || "An unexpected error occurred. Please try again.");
        } else {
            console.error("An unexpected error occurred. Please try again.");
        }
    }


    return {
        getComments,
        getFollowingComments,
        getTopComments,
        getCommentWithReplies,
        likeComment,
        dislikeComment,
        postComment,
        validate
    }

}

export function logApiError(error: unknown) {
    if (isProblemDetails(error)) {
        const problemDetails = error.response?.data;
        console.error(problemDetails?.detail || problemDetails?.title || "An error occurred on our side, we're sorry for the inconvenience.");
    } else if (error instanceof AxiosError) {
        if (error.response) {
            console.error(error.response.data?.detail || "An error occurred on our side, we're sorry for the inconvenience.");
        } else if (error.request) {
            console.error("Unable to connect to the server. Please check your internet connection.");
        } else {
            console.error("An unexpected error occurred. Please try again.");
        }
    } else if (error instanceof Error) {
        console.error(error.message || "An unexpected error occurred. Please try again.");
    } else {
        console.error("An unexpected error occurred. Please try again.");
    }
}