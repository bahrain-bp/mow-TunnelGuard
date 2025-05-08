import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../context/AuthContext';
import { FaSignInAlt, FaUserAlt, FaHardHat, FaTrafficLight, FaUserShield } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PasswordInput from '../components/PasswordInput';

// Role information with icons
const roleInfo = {
  public: { title: 'Public User', icon: FaUserAlt, color: 'info' },
  ministry: { title: 'Ministry of Works', icon: FaHardHat, color: 'warning' },
  traffic: { title: 'Traffic Department', icon: FaTrafficLight, color: 'success' },
  admin: { title: 'Administrator', icon: FaUserShield, color: 'danger' }
};

const Login: React.FC = () => {
  const [, navigate] = useLocation();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Check for role and email parameters in the URL or in sessionStorage
  useEffect(() => {
    // First, check for role and email in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const emailParam = urlParams.get('email');
    const fromRegistration = urlParams.get('fromRegistration') === 'true';
    
    console.log('URL params:', { roleParam, emailParam, fromRegistration });
    
    // If email is provided, set it in the form
    if (emailParam) {
      setFormData(prev => ({ ...prev, email: emailParam }));
    }
    
    // If user came from registration and we have a stored password
    if (fromRegistration) {
      const storedPassword = sessionStorage.getItem('registrationPassword');
      if (storedPassword) {
        console.log('Found registration password, auto-filling form');
        setFormData(prev => ({ 
          ...prev, 
          password: storedPassword,
          // Automatically check the remember me box
          rememberMe: true
        }));
        
        // Set a flag to automatically submit the form
        setTimeout(() => {
          console.log('Auto-submitting login form');
          document.getElementById('loginForm')?.dispatchEvent(
            new Event('submit', { bubbles: true, cancelable: true })
          );
        }, 500);
      }
    }
    
    if (roleParam && ['admin', 'ministry', 'traffic', 'public'].includes(roleParam)) {
      setSelectedRole(roleParam);
      sessionStorage.setItem('selectedRole', roleParam);
    } else {
      // If no role in URL, check sessionStorage
      const role = sessionStorage.getItem('selectedRole');
      if (role) {
        setSelectedRole(role);
      } else {
        // If no role is selected, redirect to role selection
        navigate('/role-selection');
      }
    }
  }, [navigate]);

  // Use role-specific stored email when available
  useEffect(() => {
    // Check if there's an email for this specific role
    const lastEmailForLogin = sessionStorage.getItem('lastEmailForLogin');
    
    if (lastEmailForLogin && formData.email === '') {
      console.log('Found email for specific role:', lastEmailForLogin);
      setFormData(prev => ({ ...prev, email: lastEmailForLogin }));
      // Clear this temporary value after use
      sessionStorage.removeItem('lastEmailForLogin');
    }
  }, []);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

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
    
    console.log('Login form submitted with:', { 
      email: formData.email, 
      password: '***HIDDEN***', 
      role: selectedRole 
    });

    // Special handling for admin credentials
    if (selectedRole === 'admin') {
      if (formData.email === 'admin@tunnelguard.com' && formData.password === 'Admin123') {
        try {
          console.log('Attempting admin login...');
          await login(formData.email, formData.password);
          
          // Store the admin role
          localStorage.setItem('userRole', 'admin');
          
          // Redirect to the dashboard
          console.log('Admin login successful, redirecting to dashboard');
          navigate('/dashboard');
        } catch (err) {
          console.error('Admin login error:', err);
          setError('System error. Please try again.');
        }
      } else {
        setError('Invalid admin credentials. Please use the provided admin account.');
      }
      return;
    }
    
    // For all other roles
    try {
      console.log('Attempting non-admin login with email:', formData.email);
      
      // Get new user registration password from session if available
      const sessionPassword = sessionStorage.getItem('registrationPassword');
      if (sessionPassword) {
        console.log('Found registration password in session, using it for login');
        await login(formData.email, sessionPassword);
        // Clear after use
        sessionStorage.removeItem('registrationPassword');
      } else {
        await login(formData.email, formData.password);
      }
      
      // Store the selected role with the user data
      if (selectedRole) {
        localStorage.setItem('userRole', selectedRole);
        console.log('User role stored:', selectedRole);
      }
      
      // Redirect to the dashboard
      console.log('Login successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error details:', err);
      
      if (selectedRole === 'ministry' || selectedRole === 'traffic') {
        setError('Invalid credentials. Make sure you have registered first.');
      } else {
        setError('Invalid credentials. Please try again or register if you\'re a new user.');
      }
    }
  };
  
  // Allow user to change roles
  const handleChangeRole = () => {
    sessionStorage.removeItem('selectedRole');
    navigate('/role-selection');
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light d-flex align-items-center">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg">
                <div className="card-body p-4">
                  <h2 className="text-center mb-3">
                    <FaSignInAlt className="me-2" />
                    Login
                  </h2>
                  
                  {selectedRole && (
                    <div className={`alert alert-${roleInfo[selectedRole as keyof typeof roleInfo].color} d-flex align-items-center mb-4`}>
                      <div className="me-3">
                        {React.createElement(roleInfo[selectedRole as keyof typeof roleInfo].icon, { size: 24 })}
                      </div>
                      <div className="flex-grow-1">
                        <strong>Role: {roleInfo[selectedRole as keyof typeof roleInfo].title}</strong>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary" 
                        onClick={handleChangeRole}
                      >
                        Change
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <form id="loginForm" onSubmit={handleSubmit}>
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
                      <PasswordInput
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        label="Password"
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
                    
                    <div className="mt-3 text-center">
                      <p>
                        Don't have an account? <Link href="/register" className="text-decoration-none">Register here</Link>
                      </p>
                    </div>
                  </form>
                  
                  {/* Admin credentials help */}
                  {selectedRole === 'admin' && (
                    <div className="mt-4 border-top pt-3">
                      <div className="alert alert-info small">
                        <div className="fw-bold">Administrator Login</div>
                        <p className="mb-1">Use the following credentials:</p>
                        <div>Email: admin@tunnelguard.com</div>
                        <div>Password: Admin123</div>
                      </div>
                    </div>
                  )}
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

export default Login;
