import React, { useState } from 'react';
import Checklist from './CheckList/CheckList';

interface PasswordWithValidationProps {
  onPasswordChange: (password: string, isValid: boolean) => void;
}

const PasswordWithValidation: React.FC<PasswordWithValidationProps> = ({ onPasswordChange }) => {
  const [password, setPassword] = useState('');
  const [checks, setChecks] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    const newChecks = {
      hasUpperCase: /[A-Z]/.test(value),
      hasNumber: /[0-9]/.test(value),
      hasSpecialChar: /[!@#$%^&*]/.test(value),
      minLength: value.length >= 12,
    };

    setChecks(newChecks);

    // Check overall validity
    const isValid = Object.values(newChecks).every(Boolean);
    onPasswordChange(value, isValid);
  };

  return (
    <div>
        <div>
    <input
      type="password"
      value={password}
      onChange={handlePasswordChange}
      className="form-control ps-5"
      placeholder="Password"
    />
    </div>
    <Checklist checks={checks} />
  </div>
    
  );
};

export default PasswordWithValidation;
