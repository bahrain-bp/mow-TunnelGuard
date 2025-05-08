import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AlertsPage from "./pages/AlertsPage";
import Dashboard from "./pages/Dashboard";
import SimpleTunnelList from "./pages/SimpleTunnelList";
import CombinedUsersPage from "./pages/CombinedUsersPage";
import TunnelSensors from "./pages/TunnelSensors";
import RoleSelection from "./pages/RoleSelection";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TunnelDetail from "./pages/TunnelDetail";
import Welcome from "./pages/Welcome";
import ProfilePage from "./pages/ProfilePage";
import SystemConfigPage from "./pages/SystemConfigPage";
import OperationsLogPage from "./pages/OperationsLogPage";
import React, { useState } from 'react';
import { Link, useLocation } from "wouter";
import { FaShieldAlt, FaUserPlus, FaSignInAlt, FaEnvelope, FaLock, FaUser, FaPhone } from "react-icons/fa";
import { UserProvider } from "@/context/UserContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext"; 
import { TunnelProvider } from "./context/TunnelContext";
import { ProtectedRoute } from "./lib/protected-route";
import PageLayout from "./components/PageLayout";
import Footer from "./components/Footer";

// Simple Login component that doesn't use auth context
const SimpleLogin = () => {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      // For demo purposes, just redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Invalid credentials. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <FaShieldAlt className="text-primary me-2" size={24} />
              <Link href="/" className="text-decoration-none">
                <span className="fs-4 fw-semibold text-dark">TunnelGuard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 bg-light d-flex align-items-center">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
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

                    <div className="mt-3 text-center">
                      <p>
                        Don't have an account? <Link href="/register" className="text-decoration-none">Register here</Link>
                      </p>
                    </div>
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

// Simple Register component that doesn't use auth context
const SimpleRegister = () => {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: 'Public',
    agreeToNotifications: false,
    username: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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
    if (!formData.agreeToNotifications) {
      setError('You must agree to receive notifications');
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

    setIsLoading(true);
    try {
      // For demo purposes, just redirect to dashboard
      setTimeout(() => {
        navigate('/dashboard');
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      setError('Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <FaShieldAlt className="text-primary me-2" size={24} />
              <Link href="/" className="text-decoration-none">
                <span className="fs-4 fw-semibold text-dark">TunnelGuard</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 bg-light">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
              <div className="card shadow-lg">
                <div className="card-body p-4">
                  <h2 className="text-center mb-4">
                    <FaUserPlus className="me-2" />
                    Register
                  </h2>

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
                        id="agreeToNotifications"
                        name="agreeToNotifications"
                        checked={formData.agreeToNotifications}
                        onChange={handleChange}
                        required
                      />
                      <label className="form-check-label" htmlFor="agreeToNotifications">
                        I agree to receive TunnelGuard notifications
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
                        Already have an account? <Link href="/login" className="text-decoration-none">Login here</Link>
                      </p>
                    </div>
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

// Simple Welcome component that doesn't use auth context
const SimpleWelcome = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center">
              <FaShieldAlt className="text-primary me-2" size={24} />
              <span className="fs-4 fw-semibold text-dark">TunnelGuard</span>
            </div>

            <nav>
              <ul className="d-flex gap-3 m-0 list-unstyled">
                <li>
                  <Link href="/role-selection" className="text-decoration-none text-secondary">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-decoration-none text-secondary">
                    Register
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow-1 bg-light">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto">
              <div className="text-center">
                <h1 className="display-4 fw-bold mb-4">
                  <FaShieldAlt className="text-primary me-2" />
                  TunnelGuard
                </h1>
                <p className="lead mb-4">
                  TunnelGuard is a flood risk monitoring and alert system created to help citizens stay safe while using road tunnels. 
                  By providing timely updates and real-time alerts on tunnel conditions, TunnelGuard empowers the public to avoid dangerous routes and stay informed. 
                  Join our community to receive alerts and contribute to a safer roadway environment.
                </p>
                <div className="d-grid gap-3 d-sm-flex justify-content-center">
                  <Link 
                    href="/register" 
                    className="btn btn-primary btn-lg px-4 gap-3"
                  >
                    <FaUserPlus className="me-2" />
                    Register
                  </Link>
                  <Link 
                    href="/role-selection" 
                    className="btn btn-outline-primary btn-lg px-4"
                  >
                    <FaSignInAlt className="me-2" />
                    Login
                  </Link>
                </div>

                <div className="row mt-5 pt-5">
                  <div className="col-6">
                    <h3 className="h2 text-primary">24/7</h3>
                    <p className="text-muted">Monitoring</p>
                  </div>
                  <div className="col-6">
                    <h3 className="h2 text-primary">Real-time</h3>
                    <p className="text-muted">Alerts</p>
                  </div>
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

// Create a layout wrapper for authenticated/protected routes
// We don't need this anymore since ProtectedRoute will handle the layout
// This was causing the duplicate header issue

// Router component to handle routing logic
function Router() {
  const [location] = useLocation();
  
  // Public routes that don't need the authenticated layout
  const isPublicRoute = 
    location === '/' || 
    location === '/role-selection' || 
    location === '/login' || 
    location.startsWith('/register') || 
    location === '/404';
  
  return (
    <Switch>
      {/* Public routes - no layout wrapper */}
      <Route path="/" component={Welcome} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes - remove the duplicate ProtectedLayout wrapper */}
      <ProtectedRoute path="/dashboard" component={Dashboard} requiredRole="public" />
      <ProtectedRoute path="/tunnels" component={SimpleTunnelList} requiredRole="public" />
      <ProtectedRoute path="/tunnel/:id/sensors" component={TunnelSensors} requiredRole="public" />
      <ProtectedRoute path="/tunnel/:id" component={TunnelDetail} requiredRole="public" />
      <ProtectedRoute path="/users" component={CombinedUsersPage} requiredRole="admin" />
      <ProtectedRoute path="/alerts" component={AlertsPage} requiredRole="public" />
      <ProtectedRoute path="/profile" component={ProfilePage} requiredRole="public" />
      
      {/* System Pages */}
      <ProtectedRoute path="/logs" component={OperationsLogPage} requiredRole={["admin", "ministry", "traffic"]} />
      <ProtectedRoute path="/settings" component={SystemConfigPage} requiredRole="admin" />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <UserProvider>
          <TunnelProvider>
            <ThemeProvider>
              <Toaster />
              <Router />
            </ThemeProvider>
          </TunnelProvider>
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;