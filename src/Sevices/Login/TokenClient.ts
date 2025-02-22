import { ApiResponse } from '../../models/ApiResponse/ApiResponse';
import { UserEmailResponse } from '../../models/ApiResponse/UserEmailResponse';
import { PasswordToken } from '../../models/Login/PasswordToken';
import userClient from '../userClient';
import {  AxiosResponse } from 'axios';

export const useTokenClient = () => {
 
    const validatePasswordtoken = async (token: string) :  Promise<AxiosResponse<ApiResponse<UserEmailResponse>>> => {

        const tokenPayload : PasswordToken = {
            token: token
        };
        
        return await userClient.post<ApiResponse<UserEmailResponse>>('/token/password-validation', tokenPayload, { 
            headers: {
                "Content-Type": 'application/json'
            }
        });
    }

    return {
        validatePasswordtoken
    }
}