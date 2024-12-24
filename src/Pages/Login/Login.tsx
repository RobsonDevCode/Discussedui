
import axios from "axios";
import { MouseEventHandler, useState } from 'react';
import { useLoginClient } from '../../Sevices/Login/LoginClient';

import { XCircleFill } from 'react-bootstrap-icons';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';
import Spinner from 'react-bootstrap/Spinner';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
//import { useNavigate } from 'react-router-dom';
import { Login } from '../../models/Login/Login';

const LoginPage: React.FC = () => {
   // const navigate = useNavigate();
    const loginCli = useLoginClient();
    const [usernameOrEmail, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isErrorVisible, setIsErrorVisible] = useState(false);

    const handlePasswordChange = (password: string, isValid: boolean) => {
        console.log("hello");
        setPassword(password);
        setIsPasswordValid(isValid);
    }
    const handleForgotPassword = (e: MouseEventHandler<HTMLButtonElement>) => { 
        
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true);
        setIsLoading(true);
        const user: Login = {
            username_or_email: usernameOrEmail,
            password: password,
            key_id: null
        };

        try {
            const response = await loginCli.postLoginRequest(user);
            setIsLoading(false);
            if (response.status === 200) {
                console.log("success");
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

                    <h1 className='text-4xl font-semibold text-center'>Sign In</h1>
                    <p className='text-center font-medium text-lg text-slate-100 mt-4'>Welcome to discussed please enter your details.</p>

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

                        <div className="mt-8 flex flex-row gap-4 flex-1 flex items-center justify-center text-gray-50 font-mono">
                        <button className="w-1/2 active:scale-[0.98] active:duration-95 hover:scale-[1.01] hover:bg-white hover:text-gray-900 ease-in-out text-lg py-3 rounded-xl font-mono outline">Create An Account</button>
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
                        <button onClick={handleForgotPassword} className="pt-2 hover:underline w-full text-center">Forgot Password?</button>


                    </div>

                </form>
            </div>
        </div>
    );
}


export default LoginPage;