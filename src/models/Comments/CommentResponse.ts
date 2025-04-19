import { Repost } from "./Repost";
import {Comment} from "./Comment"
export interface CommentResponse {
    comment: Comment | null,
    repost: Repost | null
}