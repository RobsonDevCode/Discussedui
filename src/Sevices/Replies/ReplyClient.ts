import axios, { AxiosError } from "axios";
import { PostReply } from "../../models/Replies/PostReply"
import { logApiError } from "../Comments/CommentsClient";
import { isProblemDetails } from "../userClient";
import { useTokenClient } from "../Login/TokenClient";

const replyClient = axios.create({
    baseURL: import.meta.env.VITE_COMMENT_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json'
    }
})

const tokenCli = useTokenClient();
let authRetry = 0;
const MAX_RETRIES = 1;

export const UseReplyClient = () => {
    const postReply = async (reply: PostReply, jwt: string | null) => {
        try {
            if (jwt === null || jwt === undefined) {
                jwt = await tokenCli.getJwt(reply.user_id, "id");
            }

            reply.content = reply.content.replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r");

            replyClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;

            await replyClient.post('reply', reply);

            authRetry = 0;
        } catch (error: unknown) {
            // Handle 401 - possible expired token
            if (error instanceof AxiosError &&
                error.response?.status === 401 &&
                authRetry < MAX_RETRIES) {

                // Increment retry counter
                authRetry++;

                // Get a fresh JWT token
                const freshJwt = await tokenCli.getJwt(reply.user_id, "id");

                // Retry with the fresh token
                return await postReply(reply, freshJwt);
            }

            // Log the error
            logApiError(error);

            // Reset retry counter after error handling is complete
            authRetry = 0;

            throw error;
        }
    };

    const validate = async (userId: string, jwt: string | null): Promise<boolean> => {
        try {
            if(jwt === null || jwt === undefined){
                jwt = await tokenCli.getJwt(userId, "id");
            }

            replyClient.defaults.headers.common['Authorization'] = `Bearer ${jwt}`;
            const response = await replyClient.get(`reply/validate/${userId}`);

            const canReply = !response.data.posted_today;
            return canReply;
        }catch(error: unknown){
            logApiError(error);
            throw error;
        }
    }
    return {
        postReply,
        validate
    };
}
