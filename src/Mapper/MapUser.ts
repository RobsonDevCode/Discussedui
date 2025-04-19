import { User } from "../models/Accounts/User"

export const mapUser = (data: any): User => {
    return {
        id: data.id,
        user_name: data.user_name, 
        email: data.email
    }
}