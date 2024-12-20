import axios from "axios";
import { Topic } from "../models/Topic.ts";
import apiClient from "./apiClient.ts";

  export const fetchTopic = async(): Promise<Topic> => {
    try{
    const response = await apiClient.get(`/Topic/generate`, {
      headers:{
         'Content-Type': 'application/json'
      }
    });
    return response.data;
    }catch(error){
       if(axios.isAxiosError(error)){
        if(error.response){
          throw new Error(error.response.data.message || "Failed to fetch topic");
        }else if(error.request){
          throw new Error('No response received from server');
        } else{
          throw new Error('Error setting up the request');
        }
       }

       throw new Error('Error setting up the request');
    }
  }