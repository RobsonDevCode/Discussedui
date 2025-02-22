import axios, { AxiosError } from 'axios';

// Types for ProblemDetails
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // For additional properties, using unknown is safer than any
  [key: string]: string | number | boolean | null | undefined;
}

// Axios error type guard
export function isProblemDetails(
  error: AxiosError | Error | unknown
): error is AxiosError<ProblemDetails> {
  return (
    error instanceof AxiosError &&
    error.response?.data?.title !== undefined &&
    error.response?.data?.status !== undefined
  );
}

const userClient = axios.create({
  baseURL: import.meta.env.VITE_USER_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});



export default userClient;