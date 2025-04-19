import axios, { AxiosError } from 'axios';
import { useTokenClient } from './Login/TokenClient';
import { User } from '../models/Accounts/User';
import { mapUser } from '../Mapper/MapUser';
import { useGlobalExtensions } from '../Extensions/GlobalExtensions';


const userClient = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authRetry = 0; 
const MAX_RETRIES = 1; 

export const UseUserClient = () => { 
  const extensions = useGlobalExtensions();
  const tokenCli = useTokenClient();

  const getUserById = async (userId: string, jwt: string | null): Promise<User | null> => {
    try{
      if (userId === null) return null;
      if(jwt === null || jwt === undefined){
        jwt = await tokenCli.getJwt(userId, "id");
      }

      var query = `user/${userId}`;
      userClient.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
      const response = await userClient.get(query);

      return mapUser(response.data);
    }catch(error: unknown){
        var result = await extensions.handle401(
               error,
               userId,
               authRetry,
               MAX_RETRIES
             );
             if(result?.authRetry === MAX_RETRIES)
             {
                throw error;
             }
             
             if(result === null)
             {
               return null;
             }
       
             if (result?.jwt !== null) {
               // Retry with the fresh token
               return await getUserById(userId, result.jwt);
             }
       
             // Log the error
             extensions.logApiError(error);
       
             // Reset retry counter after error handling is complete
             authRetry = 0;
       
             throw error;
    }
  }

  return {
    getUserById
  }
}


export default userClient;