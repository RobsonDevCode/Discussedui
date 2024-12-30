import { useState } from "react";
import ResetPasswordChecklist from "./CheckList/ResetPasswordCheckList";

interface ResetPasswordWithValidationProps { 
    onNewPasswordChange: (newPassword: string, isValid: boolean) => void;
}

interface ResetPassword { 
    newPassword: string, 
    confirmPassword: string 
}

const ResetPasswordWithValidation: React.FC<ResetPasswordWithValidationProps> = ({onNewPasswordChange}) => { 
 const [passwordData, setPasswordData] = useState<ResetPassword>({ 
    newPassword: '', 
    confirmPassword: ''
 });

 const [checks, setChecks] = useState ({
    hasUpperCase: false, 
    hasNumber: false, 
    hasSpecialChar: false, 
    minLength: false, 
    passwordMatch: false
 })

 const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => { 
    const {name, value} = e.target;

    setPasswordData(prevState => ({
        ...prevState, 
        [name as keyof ResetPassword]: value
    })); 

    const newChecks = { 
        hasUpperCase: /[A-Z]/.test(passwordData.newPassword), 
        hasNumber: /[0-9]/.test(passwordData.newPassword), 
        hasSpecialChar: /[!@#$%^&*]/.test(passwordData.newPassword), 
        minLength: passwordData.newPassword.length >= 12, 
        passwordMatch: (passwordData.newPassword=== passwordData.confirmPassword) ? true : false, 
    }; 
    setChecks(checks);

    const isValid = Object.values(newChecks).every(Boolean); 
    onNewPasswordChange(passwordData.newPassword, isValid); 
 }

 return(
    <div>
        <div>
            <input
             type="password"
             required
             className="w-full border-2 border-gray-50 rounded-xl p-3  bg-transparent"
             value={passwordData.newPassword}
             onChange={handlePasswordChange}
             placeholder="new password"/>

            <input
             type="password"
             required
             className="w-full border-2 border-gray-50 rounded-xl p-3 mt-4 bg-transparent"
             onChange={handlePasswordChange}
             value={passwordData.confirmPassword}
             placeholder="re-enter password"/>
        </div>
        <div>
            <ResetPasswordChecklist checks={checks}/>
        </div>
    </div>
 )
}
export default ResetPasswordWithValidation;