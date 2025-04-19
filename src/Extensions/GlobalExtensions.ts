import { AxiosError } from "axios";
import { useTokenClient } from "../Sevices/Login/TokenClient";

export interface Result {
  jwt: string | null;
  authRetry: number;
}

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  // For additional properties, using unknown is safer than any
  [key: string]: string | number | boolean | null | undefined;
}

export function isProblemDetails(
  error: AxiosError | Error | unknown
): error is AxiosError<ProblemDetails> {
  return (
    error instanceof AxiosError &&
    error.response?.data?.title !== undefined &&
    error.response?.data?.status !== undefined
  );
}

export const useGlobalExtensions = () => {
  const tokenCli = useTokenClient();

  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString(undefined, options);
  };

  const handle401 = async (
    error: unknown,
    user_id: string,
    authRetry: number,
    maxRetries: number
  ): Promise<Result | null> => {
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      authRetry < maxRetries
    ) {
      // Create a result with the incremented retry counter
      const result: Result = {
        jwt: await tokenCli.getJwt(user_id, "id"),
        authRetry: authRetry + 1, // Increment the counter here, not before
      };
      
      return result;
    }
    
    return null;
  };
  function logApiError(error: unknown) {
    if (isProblemDetails(error)) {
      const problemDetails = error.response?.data;
      console.error(
        problemDetails?.detail ||
          problemDetails?.title ||
          "An error occurred on our side, we're sorry for the inconvenience."
      );
    } else if (error instanceof AxiosError) {
      if (error.response) {
        console.error(
          error.response.data?.detail ||
            "An error occurred on our side, we're sorry for the inconvenience."
        );
      } else if (error.request) {
        console.error(
          "Unable to connect to the server. Please check your internet connection."
        );
      } else {
        console.error("An unexpected error occurred. Please try again.");
      }
    } else if (error instanceof Error) {
      console.error(
        error.message || "An unexpected error occurred. Please try again."
      );
    } else {
      console.error("An unexpected error occurred. Please try again.");
    }
  }
  return {
    formatDate,
    handle401,
    logApiError,
  };
};
