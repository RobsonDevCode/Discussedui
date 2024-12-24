import axios, { AxiosResponse } from "axios";
import { Email } from "../../models/Email/Email";
import apiClient from "../apiClient";
import { useNavigate } from 'react-router-dom';
import { ConfirmationCodePayload } from '../../models/Login/ConfirmationCode'
export const useEmailClient = () => {
    const navigate = useNavigate();
    const sendConfirmationEmail = async (email: Email): Promise<AxiosResponse | undefined> => {
        try {
            return await apiClient.post(`/email/send/confirmation`, email, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error(error.response?.data.error.message);
                navigate('/error'); // Navigate to error page on failure
            }
        }
    };

    const isValidConfirmationCode = async (confirmationCodePayload: ConfirmationCodePayload): Promise<AxiosResponse | undefined> => {
        return await apiClient.post('/user/email/confirmation', confirmationCodePayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return {
        sendConfirmation: sendConfirmationEmail,
        postConfirmationCode: isValidConfirmationCode
    };
};