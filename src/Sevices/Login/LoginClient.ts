import { AxiosResponse } from "axios";
import { Register as RegisterDto } from "../../models/Login/Register";
import userClient from "../UserClient";
import { Login } from "../../models/Login/Login";
import { RecoverUserPayload } from "../../models/Accounts/ResetPassword";

export const useLoginClient = () => {

    const postNewUserRequest = async (user: RegisterDto): Promise<AxiosResponse> => {

        const response = await userClient.post(`/user/register`, user, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        return response;
    }

    const postLoginRequest = async (login: Login): Promise<AxiosResponse> => {
        const response = await userClient.post('/user/login', login, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response;
    }

    const postResetPasswordRequest = async (email: string, newPassword: string): Promise<AxiosResponse> => {
        const payload: RecoverUserPayload = {
            email: email ?? "", //api will return a bad request if null
            new_password: newPassword
        };

        return await userClient.post('/user/reset-password', payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
    return {
        postNewUserRequest,
        postLoginRequest,
        postResetPasswordRequest
    }
};