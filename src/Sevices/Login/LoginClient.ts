import { AxiosResponse } from "axios";
import { Register as RegisterDto } from "../../models/Login/Register";
import apiClient from "../apiClient";
import { useEncryptor } from "../../Processing/Encryption"
import { Login } from "../../models/Login/Login";

export const useLoginClient = () => {
    const encryptor = useEncryptor();

    const postNewUserRequest = async (user: RegisterDto): Promise<[response: AxiosResponse, encryptedEmail: string, keyId: string]> => {
        const [encryptedPassword, encryptedEmail, keyId] = await encryptor.encryptCredentails(user.email_address, user.password)

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
    
    const postLoginRequest = async (login: Login) : Promise<AxiosResponse> => { 
        const [encryptedPassword, encryptedUsernameOrEmail, keyId] = await encryptor.encryptCredentails(login.username_or_email, login.password)
        
        login.username_or_email = encryptedUsernameOrEmail;
        login.password = encryptedPassword
        login.key_id = keyId; 

        const response = await apiClient.post('/user/login', login, {
             headers: {
                 'Content-Type' : 'application/json'
             }
        });

        return response;
    }

    return { postNewUserRequest, 
        postLoginRequest
     }
};