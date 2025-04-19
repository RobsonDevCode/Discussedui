export interface Like{
   user_id: string, 
   comment_id: string | null
   liked: boolean,
   repost_id: string | null
}