import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';
import Header from '../components/Header';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light d-flex align-items-center">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow-lg">
                <div className="card-body p-4">
                  <h2 className="text-center mb-4">
                    <FaSignInAlt className="me-2" />
                    Login
                  </h2>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email address</label>
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

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="rememberMe"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="rememberMe">
                        Remember me
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <FaSignInAlt className="me-2" />
                      )}
                      {isLoading ? 'Logging in...' : 'Login'}
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

export default Login; 