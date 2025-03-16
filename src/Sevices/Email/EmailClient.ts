import axios, { AxiosResponse } from "axios";
import { Email } from "../../models/Email/Email";
import { useNavigate } from 'react-router-dom';
import { ConfirmationCodePayload } from '../../models/Login/ConfirmationCode'

const emailClient = axios.create({
    baseURL: import.meta.env.VITE_EMAIL_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    }
});


export const useEmailClient = () => {
    const navigate = useNavigate();

    const sendConfirmationEmail = async (email: Email): Promise<AxiosResponse | undefined> => {
        try {

            return await emailClient.post(`/email/send/confirmation`, email, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const apiError = error.response?.data?.error.detail;
                navigate('/error'); // Navigate to error page on failure
            }
        }
    };

    const sendRecoveryEmail = async (email: Email): Promise<AxiosResponse | undefined> => {
        return await emailClient.post('/email/recovery', email, {
            headers: {
                'Content-Length': 'application/json'
            }
        });

    }

    const isValidConfirmationCode = async (confirmationCodePayload: ConfirmationCodePayload): Promise<AxiosResponse | undefined> => {
        return await emailClient.post('/user/confirm-email', confirmationCodePayload, {
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