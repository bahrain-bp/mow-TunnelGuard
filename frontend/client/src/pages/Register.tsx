import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import { FaUserPlus, FaUserAlt, FaHardHat, FaTrafficLight, FaUsers, FaUserShield } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Role information with icons
const roleInfo = {
  public: { title: 'Public User', icon: FaUserAlt, color: 'info' },
  ministry: { title: 'Ministry of Works', icon: FaHardHat, color: 'warning' },
  traffic: { title: 'Traffic Department', icon: FaTrafficLight, color: 'success' },
  admin: { title: 'Administrator', icon: FaUserShield, color: 'danger' }
};

const Register: React.FC = () => {
  const [, navigate] = useLocation();
  const { register, login, isLoading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  
  // Check for a role parameter in the URL or in sessionStorage
  useEffect(() => {
    // First, check for role in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    
    if (roleParam && ['ministry', 'traffic', 'public'].includes(roleParam)) {
      setSelectedRole(roleParam);
      sessionStorage.setItem('selectedRole', roleParam);
    } else {
      // If no role in URL, check sessionStorage
      const role = sessionStorage.getItem('selectedRole');
      if (role && role !== 'admin') { // Admin doesn't need to register
        setSelectedRole(role);
      } else {
        // If no valid role is selected, redirect to role selection
        navigate('/role-selection');
      }
    }
  }, [navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    // Make sure we have a role selected
    if (!selectedRole) {
      setError('Please select a role first');
      navigate('/role-selection');
      return;
    }

    try {
      // Generate a username if not provided (based on email)
      if (!formData.username) {
        formData.username = formData.email.split('@')[0];
      }
      
      // Add the role to the registration data
      const userData = {
        ...formData,
        role: selectedRole
      };
      
      console.log('Submitting registration data:', { ...userData, password: '***HIDDEN***' });
      
      // Store password in session storage for auto-login 
      // This will be removed after login attempt
      sessionStorage.setItem('registrationPassword', formData.password);
      
      // Register the user
      await register(userData);
      console.log('Registration successful, attempting login');
      
      // Store the role with the user session
      localStorage.setItem('userRole', selectedRole);
      
      try {
        // Store the email in sessionStorage for future logins
        sessionStorage.setItem('registeredEmail', formData.email);
        
        // Auto-login after successful registration
        await login(formData.email, formData.password);
        console.log('Auto-login successful');
        
        // Redirect to the dashboard
        navigate('/dashboard');
      } catch (loginErr) {
        console.error('Auto-login failed after registration', loginErr);
        // Still redirect to login page with email prefilled and ensure password is available
        navigate(`/login?role=${selectedRole}&email=${encodeURIComponent(formData.email)}&fromRegistration=true`);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setError('Registration failed. Please try again.');
      // Clear any stored password if registration fails
      sessionStorage.removeItem('registrationPassword');
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
      
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          <div className="row">
            {/* Form Column */}
            <div className="col-lg-6">
              <div className="card shadow-lg">
                <div className="card-body p-4">
                  <h2 className="text-center mb-3">
                    <FaUserPlus className="me-2" />
                    Register
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

                  <form onSubmit={handleSubmit}>
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
                      <label htmlFor="phone" className="form-label">Phone Number</label>
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

                    <div className="mb-3 form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="agreeToTerms"
                        name="agreeToTerms"
                        checked={formData.agreeToTerms}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeToTerms">
                        I agree to the terms and conditions
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
                        <FaUserPlus className="me-2" />
                      )}
                      {isLoading ? 'Registering...' : 'Register'}
                    </button>

                    <div className="mt-3 text-center">
                      <p>
                        Already have an account? <Link href={`/login?role=${selectedRole}`} className="text-decoration-none">Login here</Link>
                      </p>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            
            {/* Hero Column */}
            <div className="col-lg-6 d-none d-lg-block">
              <div className="h-100 d-flex flex-column justify-content-center ps-4">
                <h2 className="display-6 mb-4">Welcome to TunnelGuard</h2>
                <p className="lead">
                  Join our community to help monitor and protect road tunnels from flooding risks.
                </p>
                
                {selectedRole === 'public' && (
                  <div className="mt-4">
                    <h4>As a Public User, you can:</h4>
                    <ul className="list-group list-group-flush mt-2">
                      <li className="list-group-item bg-transparent">⚡ Receive real-time alerts about tunnel conditions</li>
                      <li className="list-group-item bg-transparent">⚡ View flood risk levels for tunnels in your area</li>
                      <li className="list-group-item bg-transparent">⚡ Stay informed about tunnel closures and maintenance</li>
                    </ul>
                  </div>
                )}
                
                {selectedRole === 'ministry' && (
                  <div className="mt-4">
                    <h4>As a Ministry of Works user, you can:</h4>
                    <ul className="list-group list-group-flush mt-2">
                      <li className="list-group-item bg-transparent">⚡ Manage infrastructure and maintenance schedules</li>
                      <li className="list-group-item bg-transparent">⚡ Monitor sensor data for all tunnel systems</li>
                      <li className="list-group-item bg-transparent">⚡ Generate reports on tunnel conditions and safety</li>
                    </ul>
                  </div>
                )}
                
                {selectedRole === 'traffic' && (
                  <div className="mt-4">
                    <h4>As a Traffic Department user, you can:</h4>
                    <ul className="list-group list-group-flush mt-2">
                      <li className="list-group-item bg-transparent">⚡ Manage tunnel closures during emergencies</li>
                      <li className="list-group-item bg-transparent">⚡ Monitor traffic flow and congestion in real-time</li>
                      <li className="list-group-item bg-transparent">⚡ Coordinate emergency response and evacuation plans</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;