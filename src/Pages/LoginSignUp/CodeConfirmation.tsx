import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useEmailClient } from '../../Sevices/Email/EmailClient';
import { Email } from '../../models/Email/Email';
import { Toaster, toast } from 'sonner';
import { ConfirmationCodePayload } from '../../models/Login/ConfirmationCode';
import Spinner from 'react-bootstrap/Spinner';
import axios from 'axios';
import { XCircleFill } from 'react-bootstrap-icons';

const CodeConfirmation: React.FC = () => {
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const emailClient = useEmailClient();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const sendConfirmationEmail = async () => {
    const email: Email = {
      to_send: location.state?.encryptedEmail,
      key_id: location.state?.keyId
    };

    if (email.to_send === null || email.key_id === null) {
      navigate('/error'); //no real way of fixing this without submitting again
    }
    const response = await emailClient.sendConfirmation(email)
    if (response?.status !== 200) {
      navigate('/error');
    }
  };


  useEffect(() => {
    if (codes.every(code => code !== '')) {
      handleSubmit();
    }
  }, [codes]);


  const handleSubmit = async () => {
    setIsLoading(true);
    const code = codes.join('');
    // Handle submission with complete code
    const payload: ConfirmationCodePayload = {
      email: location.state?.encryptedEmail,
      confirmation_code: code, 
      key: location.state?.keyId
    };

    try {
      console.log(payload);
      
      const response = await emailClient.postConfirmationCode(payload);
      console.log(response?.status);
      if (response?.status === 200) {
        console.log("success");
      } else {
        setIsLoading(false);

        console.error(response)
      }
    }
    catch (error) {
      if (axios.isAxiosError(error)) {
          if (error.response) {
              setIsErrorVisible(true);
              setIsLoading(false);
              const apiError = error.response.data?.error.detail;
              console.error(apiError);
              if (apiError != null) {
                console.log(`not null api`);
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


  const handleResendEmail = async () => {
    setCodes(new Array(codes.length).fill(''));
    await sendConfirmationEmail();
    toast.success("Resending email...");
  }
  const handleChange = (index: number, value: string): void => {
    if (!/^\d*$/.test(value)) return;

    const newCodes = [...codes];
    newCodes[index] = value;
    setCodes(newCodes);

    if (value !== '' && index < codes.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    
    // Get the full pasted text
    const pastedData = e.clipboardData.getData('text');
    
    // Extract all numbers from the pasted data, not just the first codes.length characters
    const pastedCodes = pastedData
      .split('')
      .filter(char => /^\d$/.test(char))
      .slice(0, codes.length); // Only take up to the maximum number of code inputs
      
    // Create a new array with the existing codes
    const newCodes = [...codes];
    
    // Update codes with pasted values
    pastedCodes.forEach((code, index) => {
      if (index < codes.length) {
        newCodes[index] = code;
      }
    });
    
    // Update the codes state
    setCodes(newCodes);
    
    // Find the next empty input or focus the last filled input
    const nextEmptyIndex = newCodes.findIndex(code => code === '');
    const focusIndex = nextEmptyIndex === -1 ? codes.length - 1 : nextEmptyIndex;
    
    // Focus the appropriate input field
    setTimeout(() => {
      inputRefs.current[focusIndex]?.focus();
    }, 0);
  };
  return (
    <div className='p-4'>
      <div>
        <Toaster
          richColors
          position='bottom-left'
          toastOptions={{
            style: {
              fontSize: '1.2rem',     // Increase font size
              width: '600px',         // Increase width
              minHeight: '80px',      // Increase height
            }
          }}
        />
      </div>
      <div className='flex-1 flex items-center justify-center text-gray-50 font-mono'>
        <form >
          {isErrorVisible && (<div className="bg-red-200 border border-red-400 text-red-700 px-3 py-3 rounded relative" role="alert" >
                                      <div className="d-flex align-items-centre">
                                          <XCircleFill size={24} color="red" />
                                          <p className='ml-2'>{errorMessage ?? "An Error occured please try again or try resending a code!"}</p>
                                      </div>
                                  </div>
                                  )
                                  }
          <h1 className="lg:text-5xl text-2xl font-semibold text-center pt-2">Email Confirmation</h1>
          <p className="text-center font-medium text-lg text-slate-100 mt-4 mb-4">Please check your email to find the confirmation code we have sent you</p>

          <div className="code-input-container flex justify-center gap-4 mt-auto mb-16 mt-4">
            {codes.map((code, index) => (
              <input
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={code}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md bg-transparent text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label={`Digit ${index + 1} of confirmation code`}
              />
            ))}

          </div>
        </form>
      </div>
      <div className="mt-8 flex flex-row gap-4 flex-1 flex items-center justify-center text-gray-50 font-mono">
        <button onClick={handleResendEmail} className="w-1/2 active:scale-[0.98] active:duration-95 hover:scale-[1.01] ease-in-out  text-lg  py-3 rounded-xl font-mono outline">Resend Code</button>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <button onClick={handleSubmit} type="submit" className="w-1/2 active:scale-[0.98] active:duration-95 hover:scale-[1.01] ease-in-out  text-lg  py-3 rounded-xl font-mono" style={{ backgroundColor: '#4f29f0' }}>Submit</button>
        )}
      </div>
      <p className='mt-8 flex flex-row gap-4 flex-1 flex items-center justify-center text-gray-50 mt-4'>If you're not receiving the email please check spam or contact our support team!</p>
      <div />
    </div>
  );
};


export default CodeConfirmation;