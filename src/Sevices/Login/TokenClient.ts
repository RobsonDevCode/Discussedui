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

    const getJwt = async (credential: string, param: string) : Promise<string | null> => {
        let response;
        switch(param){
            case "id":
                response = await userClient.get(`token/jwt?id=${credential}`)
                return response.data;

            case "username":
                response = await userClient.get(`token/jwt?username=${credential}`)
                return response.data;

            default: 
                console.error("Invalid paramter given");
        }

        return null;
    }


    return {
        validatePasswordtoken,
        getJwt
    }
}