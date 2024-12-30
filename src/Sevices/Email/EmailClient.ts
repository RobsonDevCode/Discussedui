import axios, { AxiosResponse } from "axios";
import { Email } from "../../models/Email/Email";
import apiClient from "../apiClient";
import { useNavigate } from 'react-router-dom';
import { ConfirmationCodePayload } from '../../models/Login/ConfirmationCode'
import { useEncryptor } from "../../Processing/Encryption";
export const useEmailClient = () => {
    const navigate = useNavigate();
    const encryptor = useEncryptor()
    const sendConfirmationEmail = async (email: Email): Promise<AxiosResponse | undefined> => {
        try {
            return await apiClient.post(`/email/send/confirmation`, email, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data?.error.detail;
                console.log(apiError);
                navigate('/error'); // Navigate to error page on failure
            }
        }
    };

    const sendRecoveryEmail = async (email: string): Promise<AxiosResponse | undefined> => {
        const [encryptedEmail, keyId] = await encryptor.encryptEmail(email);
        const emailPayload: Email = {
            to_send: encryptedEmail,
            key_id: keyId
        };
        
        return await apiClient.post('/email/send/recovery', emailPayload, {
            headers: {
                'Content-Length': 'application/json'
            }
        });

    }

    const isValidConfirmationCode = async (confirmationCodePayload: ConfirmationCodePayload): Promise<AxiosResponse | undefined> => {
        return await apiClient.post('/user/email/confirmation', confirmationCodePayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return {
        sendConfirmation: sendConfirmationEmail,
        sendRecoveryEmail: sendRecoveryEmail,
        postConfirmationCode: isValidConfirmationCode
    };
};