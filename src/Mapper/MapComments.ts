import { Comment } from "../models/Comments/Comment";
import { CommentWithReplies } from "../models/Comments/CommentWithReplies";
import { Reply } from "../models/Replies/Reply";

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


export const mapCommentsWithReplies = (data: any): CommentWithReplies => {
  const repliesArray = Array.from(data.replies);
  const replies = mapReplies(repliesArray);
  const comments =mapComment(data.comment);
  return {
        comment:comments,
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