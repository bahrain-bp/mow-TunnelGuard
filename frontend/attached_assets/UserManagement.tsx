import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import { FaUserPlus } from 'react-icons/fa';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  status: string;
  verificationCode: string;
}

const UserManagement: React.FC = () => {
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: 'Active',
    verificationCode: Math.random().toString(36).substring(2,10).toUpperCase()
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Log the new user data
    console.log('New User Created:', {
      ...formData,
      verificationCode: Math.random().toString(36).substring(2,10).toUpperCase()
    });

    toast.success('User created successfully');

    // Reset form
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      status: 'Active',
      verificationCode: Math.random().toString(36).substring(2,10).toUpperCase()
    });
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
                    User Management Panel – Add User
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
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
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
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label htmlFor="verificationCode" className="form-label">Verification Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="verificationCode"
                        value={formData.verificationCode}
                        readOnly
                      />
                      <small className="text-muted">Auto-generated unique code</small>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                      <FaUserPlus className="me-2" />
                      Create User
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-dark text-light py-4">
        <div className="container text-center">
          <p className="mb-0">© 2024 TunnelGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default UserManagement;