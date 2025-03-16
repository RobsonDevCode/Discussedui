import { UserInteractions } from "./UserInteractions";

export interface Comment {
    id: string, 
    topic_id: string, 
    user_id: string, 
    user_name: string, 
    reference: number,
    content: string, 
    user_interactions: UserInteractions,
    created_at: Date, 
    updated_at: Date
}