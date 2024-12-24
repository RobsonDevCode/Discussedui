import { EncryptionCredentials } from '../../models/EncryptionCredentials'
import apiClient from '../apiClient';
import axios from 'axios';

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
                    const apiError = error.response.data?.error.message;
                    if (apiError != null) {
                        console.error(`Status code:${error.response.status}.Error: ${apiError}`);
                        return;
                    }
                    throw new Error(error.response.data.message || "Falied posting register request");
                } else if (error.request == null) {
                    throw new Error(`no response from: ${error.request}`);
                } else {
                    throw new Error('Error setting up post request');
                }
            }
        }

    }

    return { postCredentials }
}