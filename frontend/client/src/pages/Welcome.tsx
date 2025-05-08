import React from 'react';
import { Link } from 'wouter';
import { FaShieldAlt, FaUserPlus, FaSignInAlt, FaMoon, FaSun, FaWater, FaTachometerAlt, FaBell } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';
import Footer from '../components/Footer';
import LiveWaterLevelChart from '../components/LiveWaterLevelChart';

const Welcome: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`min-vh-100 d-flex flex-column ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <header className="modern-navbar shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaShieldAlt className="text-primary me-2" size={28} />
              <span className="fs-4 fw-bold">TunnelGuard</span>
            </div>
            
            <div className="d-flex align-items-center">
              <button 
                onClick={toggleTheme} 
                className={`btn btn-sm ${theme === 'dark' ? 'btn-light' : 'btn-dark'}`}
                aria-label="Toggle dark mode"
                style={{
                  color: theme === 'dark' ? '#1e1e1e' : 'white',
                  fontWeight: '500'
                }}
              >
                {theme === 'dark' ? (
                  <FaSun size={16} title="Switch to light mode" className="text-dark" />
                ) : (
                  <FaMoon size={16} title="Switch to dark mode" className="text-white" />
                )}
                <span className="ms-2">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <Link 
                href="/role-selection" 
                className="btn btn-outline-primary ms-3"
              >
                <FaSignInAlt className="me-2" />
                Login
              </Link>
              
              <Link 
                href="/register?role=public" 
                className="btn btn-primary ms-2"
              >
                <FaUserPlus className="me-2" />
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow-1 modern-content">
        {/* Hero section */}
        <div className="py-5 mb-5" style={{ 
          background: "linear-gradient(135deg, #4e73df 0%, #224abe 100%)", 
          borderRadius: "0 0 10px 10px",
          color: "#ffffff" 
        }}>
          <div className="container py-4">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="mb-4">
                  <FaShieldAlt className="mb-4" size={64} style={{ color: "#ffffff" }} />
                  <h1 className="display-4 fw-bold" style={{ color: "#ffffff" }}>TunnelGuard</h1>
                  <p className="lead" style={{ color: "#ffffff" }}>The advanced monitoring system for tunnel safety and management</p>
                  
                  <p className="my-4" style={{ color: "#ffffff", opacity: 0.9 }}>
                    TunnelGuard is a flood risk monitoring and alert system created to help citizens stay safe while using road tunnels. 
                    By providing timely updates and real-time alerts on tunnel conditions, TunnelGuard empowers the public to avoid dangerous routes.
                  </p>
                  
                  <div className="d-flex gap-3 mt-4">
                    <Link 
                      href="/register?role=public" 
                      className="btn btn-primary btn-lg fw-bold"
                      style={{ background: "linear-gradient(45deg, #4e73df, #6d8af8)" }}
                    >
                      <FaUserPlus className="me-2" />
                      Register
                    </Link>
                    <Link 
                      href="/role-selection" 
                      className="btn btn-outline-light btn-lg"
                    >
                      <FaSignInAlt className="me-2" />
                      Login
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="bg-white bg-opacity-10 rounded-4 p-4" style={{ 
                  height: '350px',
                  background: "rgba(255, 255, 255, 0.1)"
                }}>
                  <div className="text-center mb-3">
                    <h4 style={{ color: "#ffffff" }}>Live Water Level Monitoring</h4>
                    <p style={{ color: "#ffffff" }}>Current tunnel conditions across the network</p>
                  </div>
                  
                  <LiveWaterLevelChart />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="container py-5 mb-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How TunnelGuard Works</h2>
            <p className="lead">Comprehensive protection through advanced monitoring</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <FaTachometerAlt className="text-primary" size={28} />
                  </div>
                  <h3 className="h4 mb-3">Real-time Monitoring</h3>
                  <p className="text-muted">Our sensor network provides continuous 24/7 monitoring of all tunnel conditions</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <FaBell className="text-primary" size={28} />
                  </div>
                  <h3 className="h4 mb-3">Instant Alerts</h3>
                  <p className="text-muted">Receive immediate notifications when tunnel conditions become hazardous</p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                    <FaWater className="text-primary" size={28} />
                  </div>
                  <h3 className="h4 mb-3">Water Level Tracking</h3>
                  <p className="text-muted">Advanced sensors track water levels to predict flooding risks before they occur</p>
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

export default Welcome;
