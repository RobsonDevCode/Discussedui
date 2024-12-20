
import {
    Person as PersonIcon,
    Envelope as EmialIcon,
    Key as PasswordIcon
}from 'react-bootstrap-icons';

import './LoginSignUp.css'
import axios from "axios";
import { useState } from 'react';
import { Register } from '../../models/Login/Register';
import { LoginClient } from '../../Sevices/Login/LoginClient';
import PasswordWithValidation from '../../Components/Login/PasswordWithValidation';
import ResponsiveLogo from '../LoginSignUp/ResponsiveLogo';

const LoginSignUp: React.FC = () => {
  const [regUsername, SetUserName] = useState('');
  const [regEmail, SetEmail] = useState('');
  const [regPassword, SetPassword] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // State to track submission
  const [errorMessage, setErrorMessage] = useState<string| null>(null

  )
  const handlePasswordChange = (password: string, isValid: boolean) => {
    SetPassword(password);
    setIsPasswordValid(isValid);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    const registerUser: Register = {
        user_name: regUsername,
        email_address: regEmail,
        password: regPassword
    };
    try{
        const loginCli = new LoginClient();
        const userCreated = await loginCli.postNewUserRequest(registerUser);

    if (!userCreated){
      throw new Error();
    }
    }catch(error){
        if(axios.isAxiosError(error)){
            if(error.response){
                const apiError = error.response.data?.error.message;
                if(apiError != null){ 
                    setErrorMessage(`Error: ${apiError}`);
                }
                throw new Error(error.response.data.message || "Falied posting register request");
            }else if(error.request){
                throw new Error(`no response from: ${error.request}`);
            }else{
                throw new Error('Error setting up post request');
            }
        }
        throw new Error('Error posting register request');
    } 

  };
      return (
        <div>
        <form className='sign-up' onSubmit={handleSubmit}>
        <ResponsiveLogo/>
        <div className="container">
        <div className="header">
            <div className="text">Sign Up</div>
            <div className="divider"></div>
        </div>
        <div className="inputs">
        {errorMessage != null && isSubmitted && <span className='error-message'>{errorMessage}</span>}

            <div className="input position-relative">
                
                <PersonIcon 
                    size={24}
                    className="position-absolute text-muted" 
                    style={{ 
                        transform: 'translateY(160%) translateX(15%)', 
                        zIndex: 10 ,
                        color: 'ghostwhite'
                    }} 
                />
                <input required
                   pattern="[a-zA-Z0-9 ]+"
                   value={regUsername}
                   onChange= {(e) => SetUserName(e.target.value)}
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
                        zIndex: 10 ,
                        color: 'ghostwhite'
                    }} 
                />
                <input required
                   value={regEmail}
                   onChange={(e) => SetEmail(e.target.value)}
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
    </form>
    </div>
    );
}


export default LoginSignUp;