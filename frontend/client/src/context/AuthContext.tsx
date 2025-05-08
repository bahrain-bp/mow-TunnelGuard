import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiRequest } from '../lib/queryClient';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  status: string;
  userRole?: string; // System role (public, ministry, traffic, admin)
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: string | null;
  hasPermission: (requiredRole: string | string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(() => {
    return localStorage.getItem('userRole');
  });

  // Map of role hierarchies and permissions (higher roles have access to lower role features)
  const roleHierarchy: Record<string, number> = {
    'public': 1,
    'ministry': 2,
    'traffic': 3,
    'admin': 4
  };

  // Check if the current user has permission for a given role
  const hasPermission = (requiredRole: string | string[]): boolean => {
    if (!userRole) return false;
    
    const currentRoleLevel = roleHierarchy[userRole];
    
    if (Array.isArray(requiredRole)) {
      // Check if user has any of the roles in the array
      return requiredRole.some(role => roleHierarchy[role] <= currentRoleLevel);
    } else {
      // Check if user has the specific role
      return roleHierarchy[requiredRole] <= currentRoleLevel;
    }
  };

  useEffect(() => {
    // If user logs in, check if there's a selected role in sessionStorage
    if (user) {
      const selectedRole = sessionStorage.getItem('selectedRole');
      if (selectedRole && !userRole) {
        setUserRole(selectedRole);
        localStorage.setItem('userRole', selectedRole);
        
        // Update user object with role info
        const updatedUser = { ...user, userRole: selectedRole };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  }, [user, userRole]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      const response = await apiRequest('POST', '/api/login', { email, password });
      const userData = await response.json();
      
      console.log('Login successful, received user data:', userData);
      
      // Get selected role from session storage
      const selectedRole = sessionStorage.getItem('selectedRole');
      console.log(`Selected role from session: ${selectedRole}`);
      
      // Add role information to the user object
      const userWithRole = {
        ...userData,
        userRole: selectedRole || userData.role || 'public'
      };
      
      setUser(userWithRole);
      
      // Store role separately for easy access
      if (selectedRole) {
        setUserRole(selectedRole);
        localStorage.setItem('userRole', selectedRole);
      } else if (userData.role) {
        // If no role in session but user has a role from the backend
        setUserRole(userData.role);
        localStorage.setItem('userRole', userData.role);
      }
      
      localStorage.setItem('user', JSON.stringify(userWithRole));
      toast.success("Login successful!");
    } catch (error) {
      console.error('Login error:', error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      console.log('Registering user with data:', { ...userData, password: '***REDACTED***' });
      
      const response = await apiRequest('POST', '/api/register', userData);
      const newUser = await response.json();
      
      console.log('Registration successful, received user data:', newUser);
      
      // Get selected role from session storage or default to public user
      const selectedRole = sessionStorage.getItem('selectedRole') || 'public';
      console.log(`Selected role from session during registration: ${selectedRole}`);
      
      // Add role information to the user object
      const userWithRole = {
        ...newUser,
        userRole: selectedRole
      };
      
      setUser(userWithRole);
      setUserRole(selectedRole);
      localStorage.setItem('userRole', selectedRole);
      localStorage.setItem('user', JSON.stringify(userWithRole));
      
      // Store user's email and role together for future login attempts
      if (userData.email) {
        const roleBasedEmail = `${selectedRole}:${userData.email}`;
        sessionStorage.setItem('registeredEmail', roleBasedEmail);
        console.log('Saved registered user info with role:', selectedRole);
      }
      
      toast.success("Registration successful!");
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Registration failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Preserve the registered email and role for future login attempts
    const registeredEmail = user?.email;
    const currentRole = userRole;
    
    // Reset user state
    setUser(null);
    setUserRole(null);
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    
    // Clear role selection from session
    sessionStorage.removeItem('selectedRole');
    
    // Store the email and role for future login attempts
    if (registeredEmail && currentRole) {
      const roleBasedEmail = `${currentRole}:${registeredEmail}`;
      sessionStorage.setItem('registeredEmail', roleBasedEmail);
      console.log('Preserved user info with specific role:', currentRole);
    }
    
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      userRole,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
