
import { AxiosError } from "axios";
import { useState } from 'react';
import { useLoginClient } from '../../Sevices/Login/LoginClient';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';
import Spinner from 'react-bootstrap/Spinner';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
//import { useNavigate } from 'react-router-dom';
import { Login } from '../../models/Login/Login';
import { useNavigate } from "react-router-dom";
import { isProblemDetails } from "../../Sevices/userClient";
import ErrorAlert from "../../Components/Shared/ErrorAlert";

const LoginPage: React.FC = () => {

    const navigate = useNavigate();
    const loginCli = useLoginClient();

    const [usernameOrEmail, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
    const [isLoading, setIsLoading] = useState(false);

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
        const user: Login = {
            username_or_email: usernameOrEmail,
            password: password,
        };

        try {
            const response = await loginCli.postLoginRequest(user);
            setIsLoading(false);
            if (response.status === 200) {
                const userId = response.data;
                localStorage.setItem('userId', userId);
                navigate("/", { state: { userId } })
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

            <div className="flex-1 flex items-center flex-col justify-center text-gray-50 font-mono">
                <form onSubmit={handleSubmit}>

                    <h1 className='text-4xl font-semibold text-center'>Sign In</h1>
                    <p className='text-center font-medium text-lg text-slate-100 mt-4'>Welcome to discussed please enter your details.</p>

                    <div className='mt-8'>
                        {isErrorVisible && (
                            <ErrorAlert
                                isVisible={isErrorVisible}
                                message={errorMessage}
                            />
                        )}
                        <div>
                            <div className="">
                                <input required
                                    className='w-full border-2 border-gray-50 rounded-xl p-4 mt-1 bg-transparent'
                                    value={usernameOrEmail}
                                    onChange={(e) => setUserName(e.target.value)}
                                    type="text"
                                    placeholder="Enter Username or Email"
                                />
                            </div>

                            <div className="mt-4">
                                <PasswordWithValidation onPasswordChange={handlePasswordChange} />
                                {!isPasswordValid && isSubmitted && <span className='error-message'>Your Password must meet all requirements</span>}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-row gap-4 flex-1 flex items-center justify-center text-gray-50 font-mono">
                            <button
                                type="button"
                                onClick={() => navigate('/sign-up')}
                                className="w-1/2 active:scale-[0.98] active:duration-95 hover:scale-[1.01] hover:bg-white hover:text-gray-900 ease-in-out text-lg py-3 rounded-xl font-mono outline"
                            >
                                Create An Account
                            </button>

                            {isLoading ? (
                                <div className="d-flex justify-content-center align-items-center">
                                    <Spinner animation="border" />
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="active:scale-[0.98] active:duration-95 hover:scale-[1.01] ease-in-out text-lg py-3 w-1/2 rounded-xl font-mono"
                                    style={{ backgroundColor: "#4f29f0" }}
                                >
                                    Sign In
                                </button>
                            )}
                        </div>
                    </div>
                </form>
                <button onClick={() => navigate('/forgot-password')} className="pt-4 hover:underline w-full text-center">Forgot Password?</button>
            </div>
        </div>
    );
}


export default LoginPage;