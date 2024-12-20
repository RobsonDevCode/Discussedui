import { AxiosResponse } from "axios";
import { Email } from "../../models/Email/Email";
import apiClient from "../apiClient";

export class EmailClient{ 
    async sendConfirmation(email: Email): Promise<AxiosResponse>{ 
        return await apiClient.post(`/email/send/confirmation`, email, { 
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}