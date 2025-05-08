
import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FaUserPlus } from 'react-icons/fa';
import { useUsers } from '../context/UserContext';

interface UserFormData {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  
  role: string;
  status: string;
}

const UserManagement: React.FC = () => {
  const [, navigate] = useLocation();
  const { addUser } = useUsers();
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    
    role: 'user',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await addUser(formData);
      toast.success('User added successfully!');
      navigate('/users');
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light">
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <FaUserPlus className="me-2" />
                    Add New User
                  </h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="fullName" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="department" className="form-label">Department</label>
                      <select
                        className="form-select"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                      >
                        <option value="Public">Public</option>
                        <option value="Ministry of Works">Ministry of Works</option>
                        <option value="Traffic Department">Traffic Department</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="role" className="form-label">Role</label>
                      <select
                        className="form-select"
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                      >
                        <option value="user">User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="status" className="form-label">Status</label>
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Creating User...
                        </>
                      ) : (
                        <>
                          <FaUserPlus className="me-2" />
                          Create User
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserManagement;
