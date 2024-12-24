import axios from "axios";
import { useState } from 'react';
import { Register } from '../../models/Login/Register';
import { useLoginClient } from '../../Sevices/Login/LoginClient';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
import { useNavigate } from 'react-router-dom';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';
import { XCircleFill } from 'react-bootstrap-icons';
import Spinner from 'react-bootstrap/Spinner';

const LoginSignUp: React.FC = () => {
    const navigate = useNavigate();
    const loginCli = useLoginClient();
    const [regUsername, setUserName] = useState('');
    const [regEmail, setEmail] = useState('');
    const [regPassword, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
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

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setIsErrorVisible(true);
                    const apiError = error.response.data?.error.message;
                    console.error(apiError);
                    setIsLoading(false);
                    if (apiError != null) {

                        setErrorMessage(`Error: ${apiError}`);
                    } else {
                        setErrorMessage("An error occurred our side, we're sorry for the inconvenience. Please try again later.");
                    }

                } else if (error.request) {
                    throw new Error(`no response from: ${error.request}`);
                } else {
                    throw new Error('Error setting up post request');
                }
            }
            throw new Error('Error posting register request');
        }

    };
    return (
        <div className="flex w-full h-screen">
            <div className="hidden lg:flex h-screen w-[530px] bg-white border-r drop-shadow-lg">
                <SignUpSidebar />
            </div>

            <div className="flex-1 flex items-center justify-center text-gray-50 font-mono">
                <form onSubmit={handleSubmit}>

                    <h1 className='text-4xl font-semibold text-center'>Sign up</h1>
                    <p className='text-center font-medium text-lg text-slate-100 mt-4'>Welcome to discussed please enter the details.</p>

                    <div className='mt-8'>
                        {isErrorVisible && (<div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert" >
                            <div className="d-flex align-items-centre">
                                <XCircleFill size={24} color="red" />{errorMessage}
                            </div>
                        </div>
                        )
                        }
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