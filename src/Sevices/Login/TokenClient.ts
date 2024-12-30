import { ApiResponse } from '../../models/ApiResponse/ApiResponse';
import { UserEmailResponse } from '../../models/ApiResponse/UserEmailResponse';
import { EncryptionCredentials } from '../../models/EncryptionCredentials'
import apiClient from '../apiClient';
import axios, {  AxiosResponse } from 'axios';

export const useTokenClient = () => {
    const postCredentials = async (key: string, iv: string, keyId: string) => {
        try {
            const encryptCreds: EncryptionCredentials = {
                id: keyId,
                key: key,
                iv: iv
            };

            await apiClient.post('/token/storekey', encryptCreds, {
                headers: {
                    'Content-Type': 'application/json'
                },
            });

        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    const apiError = error.response.data?.error.detail;
                    if (apiError != null) {
                        console.error(`Status code:${error.response.status}.Error: ${apiError}`);
                        return;
                    }
                    throw new Error(apiError || "Falied posting register request");
                } else if (error.request == null) {
                    throw new Error(`no response from: ${error.request}`);
                } else {
                    throw new Error('Error setting up post request');
                }
            }
        }

    }
    const validatePasswordtoken = async (token: string) :  Promise<AxiosResponse<ApiResponse<UserEmailResponse>>> => {
        return await apiClient.post<ApiResponse<UserEmailResponse>>('/token/password-validation', token, { 
            headers: {
                "Content-Type": 'application/json'
            }
        });
    }

    return {
        postCredentials,
        validatePasswordtoken
    }
}