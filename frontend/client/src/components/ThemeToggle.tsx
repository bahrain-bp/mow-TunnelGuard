import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-sm ${theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light'} d-flex align-items-center ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}
    >
      {theme === 'light' ? <FaMoon className="me-1" size={14} /> : <FaSun className="me-1" size={14} />}
      <span className="d-none d-md-inline">{theme === 'light' ? 'Dark' : 'Light'} Mode</span>
    </button>
  );
};

export default ThemeToggle;