import { AxiosError } from "axios";
import { useState } from 'react';
import { Register } from '../../models/Login/Register';
import { useLoginClient } from '../../Sevices/Login/LoginClient';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
import { useNavigate } from 'react-router-dom';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';
import Spinner from 'react-bootstrap/Spinner';
import { isProblemDetails } from "../../Sevices/apiClient";
import ErrorAlert from "../../Components/Shared/ErrorAlert";

const LoginSignUp: React.FC = () => {
    const navigate = useNavigate();
    const loginCli = useLoginClient();
    const [regUsername, setUserName] = useState('');
    const [regEmail, setEmail] = useState('');
    const [regPassword, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
    const [errorMessage, setErrorMessage] = useState('');
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    const handlePasswordChange = (password: string, isValid: boolean) => {
        setPassword(password);
        setIsPasswordValid(isValid);
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);
        setIsLoading(true);
        const registerUser: Register = {
            user_name: regUsername,
            email_address: regEmail,
            password: regPassword,
            key_id: null
        };

        try {
            const [response, encryptedEmail, keyId] = await loginCli.postNewUserRequest(registerUser);
            setIsLoading(false);
            if (response.status === 200) {
                navigate("/code-confirmation/", { state: { encryptedEmail, keyId } });
            }
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

    };
    return (
        <div className="flex w-full h-screen">
            <div className="hidden lg:flex h-screen w-[530px] bg-white border-r drop-shadow-lg">
                <SignUpSidebar />
            </div>

            <div className="flex-1 flex items-center justify-center text-gray-50 font-mono">
            {isErrorVisible && (
                            <ErrorAlert
                                isVisible={isErrorVisible}
                                message={errorMessage}
                            />
                        )}
                <form onSubmit={handleSubmit}>
                    <h1 className='text-4xl font-semibold text-center'>Sign up</h1>
                    <p className='text-center font-medium text-lg text-slate-100 mt-4'>Welcome to discussed please enter the details.</p>

                    <div className='mt-8'>
                      
                        <div>
                            <div className="">
                                <input required
                                    pattern="[a-zA-Z0-9 ]+"
                                    className='w-full border-2 border-gray-50 rounded-xl p-4 mt-1 bg-transparent'
                                    value={regUsername}
                                    onChange={(e) => setUserName(e.target.value)}
                                    type="text"
                                    placeholder="Username"
                                    title="Username can only contain letters, numbers."
                                />
                            </div>

                            <div className="mt-4">

                                <input required
                                    value={regEmail}
                                    className='w-full border-2 border-gray-50 rounded-xl p-4 mt-1 bg-transparent'
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="mt-4">
                                <PasswordWithValidation onPasswordChange={handlePasswordChange} />

                                {!isPasswordValid && isSubmitted && <span className='error-message'>Your Password must meet all requirements</span>}
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col">
                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="active:scale-[0.98] active:duration-95 hover:scale-[1.01] ease-in-out text-lg py-3 rounded-xl font-mono"
                                    style={{ backgroundColor: "#4f29f0" }}
                                >
                                    Create Account
                                </button>
                            )}
                        </div>

                    </div>

                </form>
            </div>
        </div>
    );
}


export default LoginSignUp;