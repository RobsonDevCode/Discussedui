import { RelpyInteractions } from "./ReplyInteractions";

export interface Reply{
    id: string, 
    comment_id: string, 
    created_at: Date, 
    updated_at: Date,
    user_id: string, 
    user_name: string, 
    content: string, 
    interactions: RelpyInteractions
}