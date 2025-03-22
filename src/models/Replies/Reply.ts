import { RelpyInteractions } from "./ReplyInteractions";

export interface Reply{
    id: string, 
    comment_id: string, 
    user_id: string, 
    username: string, 
    content: string, 
    interactions: RelpyInteractions,
    created_at: Date, 
    updated_at: Date
}