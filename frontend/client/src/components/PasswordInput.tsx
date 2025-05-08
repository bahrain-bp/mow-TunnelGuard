import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface PasswordInputProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  autoComplete?: string;
  disabled?: boolean;
  label?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder = "Enter password",
  required = false,
  className = "form-control",
  autoComplete = "current-password",
  disabled = false,
  label
}) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="position-relative">
      {label && (
        <label htmlFor={id} className="form-label">{label}</label>
      )}
      <div className="input-group">
        <input
          type={showPassword ? "text" : "password"}
          className={className}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={togglePasswordVisibility}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;