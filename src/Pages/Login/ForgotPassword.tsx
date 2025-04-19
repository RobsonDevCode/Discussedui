import { useState } from "react";
import { useEmailClient } from "../../Sevices/Email/EmailClient";
import { Spinner } from "react-bootstrap";
import  { AxiosError } from "axios";
import { XCircleFill } from "react-bootstrap-icons";
import { Email } from "../../models/Email/Email";
import { isProblemDetails } from "../../Extensions/GlobalExtensions";
const ForgotPassword: React.FC = () => {
    const emailCli = useEmailClient();
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [email, setEmail] = useState('');
    const [isPromptVisable, setPromptVisable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        try {
          const emailPayload: Email = {
            email_to_send: email,
           };
            await emailCli.sendRecoveryEmail(emailPayload);
            setPromptVisable(true);
        } catch (error: unknown) {
                    setIsLoading(false);
                    setIsErrorVisible(true);
                  
                    if (isProblemDetails(error)) {
                      // Handle structured API errors (ProblemDetails)
                      const problemDetails = error.response?.data;
                      setErrorMessage(problemDetails?.detail || problemDetails?.title || "An error occurred on our side, we're sorry for the inconvenience.");
                    } else if (error instanceof AxiosError) {
                      // Handle other types of Axios errors
                      if (error.response) {
                        // Server responded with a status code outside of 2xx
                        setErrorMessage(error.response.data?.detail || "An error occurred on our side, we're sorry for the inconvenience.");
                      } else if (error.request) {
                        // Request was made but no response received
                        setErrorMessage("Unable to connect to the server. Please check your internet connection.");
                      } else {
                        // Error setting up the request
                        setErrorMessage("An unexpected error occurred. Please try again.");
                      }
                    } else if (error instanceof Error) {
                      // Handle regular JavaScript errors
                      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
                    } else {
                      // Handle unknown error types
                      setErrorMessage("An unexpected error occurred. Please try again.");
                    }
                  } finally {
                    setIsLoading(false);
                  }
    }

    return (
        <div className="flex w-full h-screen">
            <div className="flex-1 flex items-center justify-center text-gray-50 font-mono">
                <form onSubmit={handleSubmit} className="border-white border-2 bg-black p-4 rounded-xl">
                      {isErrorVisible && (<div className="bg-red-200 border border-red-400 text-red-700 px-4 p-2 rounded relative" role="alert" >
                                               <div className="d-flex align-items-centre">
                                                   <XCircleFill size={24} color="red" />
                                                   <p className="ml-2">{errorMessage}</p>
                                               </div>
                                           </div>
                                           )}

                    {!isPromptVisable && (<div>
                        <h1 className="text-2xl font-semibold text-center">Enter email linked to your account!</h1>
                        <p>Please enter the email you signed up with.</p>
                        <div className="mt-8">
                            <input
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full border-2 border-gray-50 rounded-xl p-2 mt-1 bg-transparent"
                                type="email">
                            </input>
                        </div>
                        {isLoading ? (
                            <div className="mt-4 flex flex-col justify-content-center align-items-center">
                                <Spinner animation="border" />
                            </div>
                        ) : (<div className="mt-4 flex flex-col justify-content-center align-items-center">
                            <button className="w-1/2 active:scale-[0.98] active:duration-95 hover:scale-[1.01] hover:bg-white hover:text-gray-900 ease-in-out text-md p-2 rounded-xl font-mono outline">Submit</button>
                        </div>)}
                    </div>)}
                    {isPromptVisable && (
                        <div>
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-semibold">Email Sent!</h1>
                                <p>If an account exists for this email, you'll receive password reset instructions shortly.</p>
                                <p>Please check your inbox or spam folder.</p>
                            </div>
                        </div>)}

                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;