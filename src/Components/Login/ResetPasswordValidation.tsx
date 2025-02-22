import { useState } from "react";
import ResetPasswordChecklist from "./CheckList/ResetPasswordCheckList";

interface ResetPasswordWithValidationProps { 
    onNewPasswordChange: (newPassword: string, isValid: boolean) => void;
}

interface ResetPassword { 
    newPassword: string, 
    confirmPassword: string 
}

interface ResetPassword {
    newPassword: string;
    confirmPassword: string;
}

const ResetPasswordWithValidation: React.FC<ResetPasswordWithValidationProps> = ({onNewPasswordChange}) => {
    const [passwordData, setPasswordData] = useState<ResetPassword>({
        newPassword: '',
        confirmPassword: ''
    });

    const [checks, setChecks] = useState({
        hasUpperCase: false,
        hasNumber: false,
        hasSpecialChar: false,
        minLength: false,
        passwordMatch: false
    });

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        
        // Update password data first
        const newPasswordData = {
            ...passwordData,
            [name]: value
        };
        
        setPasswordData(newPasswordData);

        // Use the new password data for validation
        const newChecks = {
            hasUpperCase: /[A-Z]/.test(newPasswordData.newPassword),
            hasNumber: /[0-9]/.test(newPasswordData.newPassword),
            hasSpecialChar: /[!@#$%^&*]/.test(newPasswordData.newPassword),
            minLength: newPasswordData.newPassword.length >= 12,
            passwordMatch: CheckPasswordsMatch(newPasswordData.newPassword, newPasswordData.confirmPassword),
        };
        
        setChecks(newChecks);

        const isValid = Object.values(newChecks).every(Boolean);
        onNewPasswordChange(newPasswordData.newPassword, isValid);
    };

    const CheckPasswordsMatch = (newPassword: string, confirmPassword: string) : boolean => {
        if(newPassword === confirmPassword && newPassword.length > 1 
            && confirmPassword.length > 1){
                return true;
            }

        return false;
    }


    return (
        <div>
            <div>
                <input
                    type="password"
                    required
                    name="newPassword"
                    className="w-full border-2 border-gray-50 rounded-xl p-3 bg-transparent"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="new password"
                />

                <input
                    type="password"
                    required
                    name="confirmPassword"
                    className="w-full border-2 border-gray-50 rounded-xl p-3 mt-4 bg-transparent"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="re-enter password"
                />
            </div>
            <div>
                <ResetPasswordChecklist checks={checks} />
            </div>
        </div>
    );
};

export default ResetPasswordWithValidation;