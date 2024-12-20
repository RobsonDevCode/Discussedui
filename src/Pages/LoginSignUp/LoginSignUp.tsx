
import {
    Person as PersonIcon,
    Envelope as EmialIcon,
    Key as PasswordIcon,
    ExclamationCircle as ErrorIcon
} from 'react-bootstrap-icons';

import './LoginSignUp.css'
import axios from "axios";
import { useState } from 'react';
import { Register } from '../../models/Login/Register';
import { LoginClient } from '../../Sevices/Login/LoginClient';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
import ResponsiveLogo from './ResponsiveLogo';
import { useNavigate } from 'react-router-dom';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';

const LoginSignUp: React.FC = () => {
    const navigate = useNavigate()
    const [regUsername, setUserName] = useState('');
    const [regEmail, setEmail] = useState('');
    const [regPassword, setPassword] = useState('');
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

        const registerUser: Register = {
            user_name: regUsername,
            email_address: regEmail,
            password: regPassword,
            key_id: null
        };

        try {
            const loginCli = new LoginClient();
            const [response, encryptedEmail, keyId] = await loginCli.postNewUserRequest(registerUser);
            if (response.status === 200) {
                navigate("/code-confirmation/", { state: { encryptedEmail, keyId } });
            };

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    setIsErrorVisible(true);
                    const apiError = error.response.data?.error.message;
                    console.error(apiError);
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
        <div className='flex h-screen'>
            <div className="fixed left-0 top-0 h-screen w-1/4">
                <SignUpSidebar />
            </div>
            <form className='sign-up' onSubmit={handleSubmit}>
                <div className="flex-grow flex justify-center items-center">
                    <ResponsiveLogo />
                    <div className={`container ${isErrorVisible ? 'container-expanded' : 'container'}`}>
                        <div className="header">
                            <div className="text">Sign Up</div>
                            <div className="divider"></div>
                        </div>
                        <div className="inputs">
                            {errorMessage != null && isSubmitted && <span className='error-message'>{errorMessage}</span>}
                            {isErrorVisible && (<div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert" >
                                <div className="d-flex align-items-centre">
                                    <ErrorIcon /> {errorMessage}
                                </div>
                            </div>
                            )}
                            <div className="input position-relative">

                                <PersonIcon
                                    size={24}
                                    className="position-absolute text-muted"
                                    style={{
                                        transform: 'translateY(160%) translateX(15%)',
                                        zIndex: 10,
                                        color: 'ghostwhite'
                                    }}
                                />
                                <input required
                                    pattern="[a-zA-Z0-9 ]+"
                                    value={regUsername}
                                    onChange={(e) => setUserName(e.target.value)}
                                    type="text"
                                    className="form-control ps-5"
                                    placeholder="Username"
                                    title="Username can only contain letters, numbers."
                                />
                            </div>
                            <div className="input-divider"></div>

                            <div className="input position-relative">
                                <EmialIcon
                                    size={24}
                                    className="position-absolute text-muted"
                                    style={{
                                        transform: 'translateY(160%) translateX(15%)',
                                        zIndex: 10,
                                        color: 'ghostwhite'
                                    }}
                                />
                                <input required
                                    value={regEmail}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                    className="form-control ps-5"
                                    placeholder="name@example.com"
                                />
                            </div>
                            <div className="input-divider"></div>

                            <div className="input position-relative">
                                <PasswordIcon
                                    size={24}
                                    className="position-absolute text-muted"
                                    style={{
                                        transform: 'translateY(160%) translateX(15%)',
                                        zIndex: 10,
                                        color: 'ghostwhite'
                                    }}
                                />
                                <PasswordWithValidation onPasswordChange={handlePasswordChange} />

                                {!isPasswordValid && isSubmitted && <span className='error-message'>Your Password must meet all requirements</span>}
                            </div>

                            <div className="submit-container">
                                <button type="submit" className="submit-button">Create Account</button>
                            </div>
                        </div>

                    </div>
                </div>
            </form>
        </div>
    );
}


export default LoginSignUp;