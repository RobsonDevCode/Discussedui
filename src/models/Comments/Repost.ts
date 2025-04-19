import {Comment} from "./Comment"

export interface Repost{
    id: string, 
    comment_id: string, 
    user_id: string, 
    repost_user_name: string, 
    comment_user_name: string, 
    comment: Comment, 
    likes: number, 
    liked: boolean, 
    created_at: Date,
    updated_at: Date
}