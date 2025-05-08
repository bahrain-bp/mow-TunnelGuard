import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest, queryClient } from '../lib/queryClient';
import { toast } from 'react-toastify';

interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  
}

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  getUser: (id: number) => User | undefined;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setError('Failed to fetch users');
      // Initialize with empty array if API fails
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getUser = (id: number) => {
    return users.find(user => user.id === id);
  };

  const updateUser = async (id: number, data: Partial<User>) => {
    setLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/users/${id}`, data);
      const updatedUser = await response.json();
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, ...updatedUser } : user
        )
      );
      
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error('Failed to update user', error);
      toast.error('Failed to update user');
      
      // Update locally if API fails
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === id ? { ...user, ...data } : user
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    setLoading(true);
    try {
      await apiRequest('DELETE', `/api/users/${id}`);
      
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== id)
      );
      
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('Failed to delete user');
      
      // Delete locally if API fails
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== id)
      );
    } finally {
      setLoading(false);
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    setLoading(true);
    try {
      const response = await apiRequest('POST', '/api/users', user);
      const newUser = await response.json();
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      toast.success('User added successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
    } catch (error) {
      console.error('Failed to add user', error);
      toast.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      users,
      loading,
      error,
      fetchUsers,
      getUser,
      updateUser,
      deleteUser,
      addUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
