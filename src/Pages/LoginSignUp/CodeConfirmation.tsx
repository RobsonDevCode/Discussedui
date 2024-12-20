import React, { useState, useRef, ChangeEvent, KeyboardEvent, ClipboardEvent, useEffect } from 'react';
import ResponsiveLogo from './ResponsiveLogo';
import { useLocation } from "react-router-dom";
import { EmailClient } from '../../Sevices/Email/EmailClient';
import { Email } from '../../models/Email/Email';
import SignUpSidebar from '../../Components/Shared/SignUpSidebar';

const CodeConfirmation: React.FC = () => {
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const location = useLocation();
  const emailClient = new EmailClient();

  const sendConfirmationEmail = async () => {

    const email: Email = {
      to_send: location.state?.encryptedEmail,
      key_id: location.state?.keyId
    };

    if (email.to_send === null || email.key_id === null) {
      throw Error(); //need a website shat itself page
    }

    const response = await emailClient.sendConfirmation(email)
    if (response.status !== 200) {
      throw Error();
    }
  };

  sendConfirmationEmail();



  useEffect(() => {
    const handleSubmit = (): void => {
      const code = codes.join('');
      // Handle submission with complete code
      console.log('Submitted code:', code);
    };

    if (codes.every(code => code !== '')) {
      handleSubmit();
    }
  }, [codes]);


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
    const pastedData = e.clipboardData.getData('text').slice(0, codes.length);
    const pastedCodes = pastedData.split('').filter(char => /^\d$/.test(char));

    const newCodes = [...codes];
    pastedCodes.forEach((code, index) => {
      if (index < codes.length) {
        newCodes[index] = code;
      }
    });
    setCodes(newCodes);

    const nextEmptyIndex = newCodes.findIndex(code => code === '');
    const focusIndex = nextEmptyIndex === -1 ? codes.length - 1 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <form className="code-confirmation">
        <div className="fixed left-0 top-0 h-screen w-1/4">
          <SignUpSidebar />
        </div>
        <ResponsiveLogo />
        <div className="flex flex-col items-center justify-start font-mono w-full sm:w-[650px] h-auto sm:h-[600px] px-4 sm:px-[70px] pt-4 sm:pt-[40px] pb-4 sm:pb-[30px] mt-[100px] mx-auto bg-black rounded-[10%] shadow-lg text-white">
          <div className="flex flex-col items-center gap-2 w-full mb-8">
            <h1 className="text-ghostwhite text-[35px] font-bold">Email Confirmation</h1>
            <p className="text-base text-white text-center">Please check your email to find the confirmation code we have sent you</p>
          </div>

          <div className="code-input-container flex justify-center gap-4 mt-auto mb-16">
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
        </div>
      </form>
    </div>
  );
};


export default CodeConfirmation;