import { useEffect, useState } from "react";
import { useLoginClient } from "../../Sevices/Login/LoginClient";
import { useTokenClient } from "../../Sevices/Login/TokenClient";
import { isProblemDetails } from "../../Sevices/apiClient";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Divider from "../../Components/Shared/Divider";
import ResetPasswordWithValidation from "../../Components/Login/ResetPasswordValidation";
import { Spinner } from "react-bootstrap";
import ErrorAlert from "../../Components/Shared/ErrorAlert";
import { RecoverUserPayload } from "../../models/Accounts/ResetPassword";
import { AxiosError } from "axios";



const ResetPassword: React.FC = () => {
    const loginCli = useLoginClient();
    const tokenCli = useTokenClient();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRequestIsLoading, setRequestIsLoading] = useState(false);
    const [isPageLoading, setPageIsLoading] = useState(true);
    const [newPassword, setNewPassword] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
    const [errorMessage, setErrorMessage] = useState('');
    const [isPromptVisable, setPromptVisable] = useState(false);
    const [searchParams] = useSearchParams();
    const [email, setEmail] = useState<string | null>(null);

    const isValidUser = async (): Promise<{ isValid: boolean, validUserEmail: string | null }> => {
        try {
            const token = searchParams.get("token");
            if (token === null) {
                return { isValid: false, validUserEmail: null };
            }
            const response = await tokenCli.validatePasswordtoken(token);
            setPageIsLoading(false);
            if (response.status !== 200) {
                console.log("route to request expired screen!");
                return { isValid: false, validUserEmail: null };
            }
            if (response.data === null) {
                return { isValid: false, validUserEmail: null };
            }
            return { isValid: true, validUserEmail: response.data.data.email };
        } catch {
            setRequestIsLoading(false);
            return { isValid: false, validUserEmail: null };
        }
    }

    const onPageLoad = async () => {
        const { isValid, validUserEmail } = await isValidUser();
        if (!isValid) {
            console.log("route to request expired screen!");
        }
        setEmail(validUserEmail);
    }

    useEffect(() => {
        onPageLoad();
    }, []); // Run once on mount


    //handlePasswordChange method to set if the password is valid
    const handlePasswordChange = (newPassword: string, isValid: boolean) => {
        setNewPassword(newPassword)
        setIsPasswordValid(isValid);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRequestIsLoading(true);

        try {
            if (email === null) {
                return;
            }

            const response = await loginCli.postResetPasswordRequest(email, newPassword);
            if (response.status === 200) {
                setPromptVisable(true);
            } else {
                throw Error("Something went wrong out side please try again later or contact support!");
            }
        } catch (error) {
            setRequestIsLoading(false);
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
            setPageIsLoading(false);
        }
    }

    return (
        <div className="flex w-full h-screen">
            <div className="flex-1 flex items-center justify-center text-gray-50 font-mono ">
                {isPageLoading && (<div>
                    <div className="d-flex justify-content-center align-items-center">
                        <Spinner animation="border" />
                    </div>
                </div>)}
                {!isPageLoading && (
                    <form onSubmit={handleSubmit} className="bg-black border-white border-2 p-4 rounded-xl">
                        <h1 className="text-2xl items-center justify-center mb-2">Reset Password</h1>
                        <p className="text-lg">please enter a new password.</p>
                        <Divider></Divider>
                        {isErrorVisible && (
                            <ErrorAlert
                                isVisible={isErrorVisible}
                                message={errorMessage}
                            />
                        )}
                        <div className="mt-4">
                            <ResetPasswordWithValidation onNewPasswordChange={handlePasswordChange} />
                            {!isPasswordValid && isSubmitted && <span className='error-message'>Your Password must meet all requirements</span>}
                        </div>
                        <div className="mt-8 flex flex-col">
                            {isRequestIsLoading ? (
                                <div className="d-flex justify-content-center align-items-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="active:scale-[0.98] active:duration-95 hover:scale-[1.02] ease-in-out text-lg py-3 rounded-xl font-mono"
                                    style={{ backgroundColor: "#4f29f0" }}
                                >
                                    Submit
                                </button>
                            )}
                        </div>

                    </form>
                )}

            </div>
        </div>
    );
}

export default ResetPassword;