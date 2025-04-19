export interface UserInteractions {
    user_id: string, 
    user_liked: boolean,
    user_reposted: boolean,
    likes: number, 
    reply_count: number, 
    reposts: number, 
    last_interaction: Date
}