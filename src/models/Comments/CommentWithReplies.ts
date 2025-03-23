import { Reply } from "../Replies/Reply";
import { Comment } from "./Comment";

export interface CommentWithReplies {
    comment: Comment,
    replies: Reply[] | null
}