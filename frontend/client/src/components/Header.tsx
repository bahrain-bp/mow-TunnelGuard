import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  FaShieldAlt, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaChartLine, 
  FaList, 
  FaUsers, 
  FaBell, 
  FaCog, 
  FaMoon,
  FaSun,
  FaTachometerAlt,
  FaExclamationCircle,
  FaSignInAlt,
  FaUserPlus,
  FaCaretDown,
  FaHistory
} from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated, userRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const [, navigate] = useLocation();
  const [displayName, setDisplayName] = useState('User');
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      // Clear any role information
      sessionStorage.removeItem('selectedRole');
      localStorage.removeItem('userRole');
      // Redirect to home
      navigate('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };
  
  // Update display name when user changes
  useEffect(() => {
    if (user?.fullName) {
      setDisplayName(user.fullName.split(' ')[0]); // First name only
    } else if (userRole) {
      // Capitalize first letter of role
      setDisplayName(userRole.charAt(0).toUpperCase() + userRole.slice(1));
    }
  }, [user, userRole]);
  
  return (
    <div className="modern-navbar shadow-sm">
      <div className="container-fluid px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <Link href="/" className="text-decoration-none">
              <div className="d-flex align-items-center brand-logo">
                <FaShieldAlt className="text-primary me-2" size={28} />
                <span className="fs-4 fw-bold">TunnelGuard</span>
              </div>
            </Link>

          </div>
          
          <nav className="main-nav">
            {isAuthenticated ? (
              <div className="d-flex align-items-center">
                <div className="nav-links">
                  {/* Navigation items - Main sections */}
                  <Link 
                    href="/dashboard" 
                    className={`nav-item ${location.includes('/dashboard') ? 'active' : ''}`}
                  >
                    <FaTachometerAlt />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link 
                    href="/tunnels" 
                    className={`nav-item ${location.includes('/tunnels') || location.includes('/tunnel/') ? 'active' : ''}`}
                  >
                    <FaList />
                    <span>Tunnels</span>
                  </Link>
                  
                  <Link 
                    href="/alerts" 
                    className={`nav-item ${location.includes('/alerts') ? 'active' : ''}`}
                  >
                    <FaExclamationCircle />
                    <span>Alerts</span>
                  </Link>
                  
                  {/* System dropdown - Updated to match design in screenshot */}
                  <div className="dropdown d-inline-block">
                    <button
                      className="btn btn-primary d-flex align-items-center"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FaCog className="me-2" /> System <FaCaretDown className="ms-2" />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0">
                      <li>
                        <Link href="/profile" className="dropdown-item py-2">
                          <FaUserCircle className="me-2 text-primary" />
                          Show Profile
                        </Link>
                      </li>
                      <li>
                        <Link href="/users" className="dropdown-item py-2">
                          <FaUsers className="me-2 text-primary" />
                          User Management
                        </Link>
                      </li>
                      <li>
                        <Link href="/logs" className="dropdown-item py-2">
                          <FaHistory className="me-2 text-info" />
                          System Logs
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" className="dropdown-item py-2">
                          <FaCog className="me-2 text-warning" />
                          System Configuration
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          onClick={toggleTheme}
                          className="dropdown-item py-2"
                        >
                          {theme === 'dark' ? (
                            <>
                              <FaSun size={18} className="me-2 text-warning" />
                              Switch to Light Mode
                            </>
                          ) : (
                            <>
                              <FaMoon size={18} className="me-2 text-primary" />
                              Switch to Dark Mode
                            </>
                          )}
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button 
                          onClick={handleLogout}
                          className="dropdown-item text-danger py-2"
                        >
                          <FaSignOutAlt className="me-2" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center">
                <button 
                  onClick={toggleTheme}
                  className={`btn btn-sm ${theme === 'dark' ? 'btn-warning' : 'btn-outline-secondary'} me-3`}
                  aria-label="Toggle dark mode"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <>
                      <FaSun size={16} className="me-1" /> Light Mode
                    </>
                  ) : (
                    <>
                      <FaMoon size={16} className="me-1" /> Dark Mode
                    </>
                  )}
                </button>
                
                <Link 
                  href="/role-selection" 
                  className="btn btn-outline-primary"
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
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Header;