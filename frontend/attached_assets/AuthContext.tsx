import React, { createContext, useContext, useState } from 'react';
import { User, AuthContextType } from '../types';
import { toast } from 'react-toastify';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('tunnelguard_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email === 'demo@tunnelguard.com' && password === 'demo123') {
      const mockUser: User = {
        id: '1',
        fullName: 'Demo User',
        email: email,
        phone: '+1234567890',
        department: 'Ministry of Works',
        status: 'Active',
        verificationCode: Math.random().toString(36).substring(2,10).toUpperCase()
      };
      
      setUser(mockUser);
      localStorage.setItem('tunnelguard_user', JSON.stringify(mockUser));
      toast.success('Login successful!');
    } else {
      toast.error('Invalid credentials');
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tunnelguard_user');
    toast.info('Logged out successfully');
  };

  const register = async (userData: Omit<User, 'id' | 'status' | 'verificationCode'>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substring(2,9),
      status: 'Active',
      verificationCode: Math.random().toString(36).substring(2,10).toUpperCase()
    };
    
    setUser(newUser);
    localStorage.setItem('tunnelguard_user', JSON.stringify(newUser));
    toast.success('Registration successful!');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}; 