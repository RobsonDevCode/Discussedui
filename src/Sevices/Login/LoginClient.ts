import { AxiosResponse } from "axios";
import { Register as RegisterDto } from "../../models/Login/Register";
import apiClient from "../apiClient";
import { Encryptor } from "../../Processing/Encryption"
export class LoginClient{
    async postNewUserRequest(user: RegisterDto): Promise<[response: AxiosResponse, encryptedEmail: string, keyId: string]>{
        const [encryptedPassword, encryptedEmail ,keyId] = await Encryptor.encryptCredentails(user.email_address,user.password)

        user.password = encryptedPassword;
        user.key_id = keyId; 
        user.email_address = encryptedEmail;

        const response = await apiClient.post(`/user/register`, user, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        return [response, encryptedEmail, keyId];
        }

    } 