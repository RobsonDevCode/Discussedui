import { Comment } from "../models/Comments/Comment";
import { CommentResponse } from "../models/Comments/CommentResponse";
import { CommentWithReplies } from "../models/Comments/CommentWithReplies";
import { Repost } from "../models/Comments/Repost";
import { Reply } from "../models/Replies/Reply";



export const mapCommentResponses = (data: any[]): CommentResponse[] => {
  const mapped = data.map(item => ({
    comment: mapCommentSafely(item?.comment),
    repost: mapRepost(item?.repost)
  }));

  return mapped;
};

export const mapComments = (data: any[]): Comment[] => {
  // Remove duplicates based on ID
  const uniqueComments = Array.from(
      new Map(data.map(item => [item.id, item])).values()
  );
  // Convert date strings to Date objects
  const mapped = uniqueComments.map(comment => ({
      ...comment,
      created_at: new Date(comment.created_at),
      updated_at: new Date(comment.updated_at),
      user_interactions: {
          ...comment.user_interactions,
          last_interaction: new Date(comment.user_interactions.last_interaction)
      }
  }));

  return mapped;
};

export const mapCommentSafely = (data: any): Comment | null => {
  if (!data) return null; // Check if data is null or undefined
  
  return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      user_interactions: {
          ...(data.user_interactions || {}),
          last_interaction: data.user_interactions?.last_interaction
              ? new Date(data.user_interactions.last_interaction)
              : new Date()
      }
  };
};

export const mapComment = (data: any): Comment => {
  return {
      ...data,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
      user_interactions: {
          ...(data.user_interactions || {}),
          last_interaction: data.user_interactions?.last_interaction
              ? new Date(data.user_interactions.last_interaction)
              : new Date()
      }
  };
};


export const mapRepost = (data: any): Repost | null => {
  if (!data) return null; // Check if data is null or undefined
  
  return {
    ...data,
    created_at: new Date(data.created_at),
    updated_at: new Date(data.updated_at),
    comment: mapCommentSafely(data.comment)
  };
};

export const mapCommentsWithReplies = (data: any): CommentWithReplies => {
  const repliesArray = Array.from(data.replies);
  const replies = mapReplies(repliesArray);
  const comments = mapComment(data.comment); //we assume this can't be null
  return {
        comment: comments,
        replies: replies
    }
}

/**
 * Maps a reply from API response to ReplyDetail type
 */
export const mapReply = (replyData: any): Reply => {
  return {
    ...replyData,
    created_at: new Date(replyData.created_at),
    updated_at: new Date(replyData.updated_at),
    interactions: {
      ...(replyData.user_interactions || {}),
      last_interaction: replyData.user_interactions?.last_interaction
        ? new Date(replyData.user_interactions.last_interaction)
        : new Date()
    }
  };
};

export const mapReplies = (data: any[]): Reply[] => {
  // If you need to deduplicate:
  const uniqueReplies = Array.from(
    new Map(data.map(item => [item.id, item])).values()
  );
  
  // Now map each reply through mapReply function
  return uniqueReplies.map(reply => mapReply(reply));
};