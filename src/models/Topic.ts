export interface Topic{
    id: string;
    name: string;
    dt_created: Date;
    category: string;
    is_active: boolean;
    likes: bigint;
}