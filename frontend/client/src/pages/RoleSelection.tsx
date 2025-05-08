import React from 'react';
import { useLocation } from 'wouter';
import { FaUserShield, FaHardHat, FaCar, FaUsers } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const RoleSelection: React.FC = () => {
  const [, navigate] = useLocation();

  const handleRoleSelection = (role: string) => {
    // Store the selected role
    sessionStorage.setItem('selectedRole', role);
    
    // Check if user has registered before with this specific role
    const registeredEmailString = sessionStorage.getItem('registeredEmail');
    let hasRegisteredForRole = false;
    
    if (registeredEmailString) {
      // Look for a role:email format that matches the current role
      const rolePrefix = `${role}:`;
      hasRegisteredForRole = registeredEmailString.startsWith(rolePrefix);
      
      // If found, extract just the email part from rolePrefix:email
      if (hasRegisteredForRole) {
        const email = registeredEmailString.substring(rolePrefix.length);
        // Store the email separately for the login page
        sessionStorage.setItem('lastEmailForLogin', email);
      }
    }
    
    const destinationPage = hasRegisteredForRole ? 'login' : 'register';
    
    // Determine where to redirect based on role
    switch(role) {
      case 'admin':
        navigate('/login?role=admin');
        break;
      case 'ministry':
      case 'traffic':
      case 'public':
        navigate(`/${destinationPage}?role=${role}`);
        break;
      default:
        navigate(`/${destinationPage}?role=public`);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          <section>
            <div className="card shadow-sm mb-5">
              <div className="card-body text-center p-5">
                <h1 className="display-5 mb-4">Welcome to TunnelGuard</h1>
                <p className="lead mb-4">
                  Please select your role to continue with the appropriate access level
                </p>
                
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mt-3">
                  {/* Administrator Role */}
                  <div className="col">
                    <div 
                      className="card h-100 border-danger cursor-pointer"
                      onClick={() => handleRoleSelection('admin')}
                    >
                      <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(220, 53, 69, 0.1)' }}>
                          <FaUserShield size={48} className="text-danger" />
                        </div>
                        <h5 className="card-title">Administrator</h5>
                        <p className="card-text small text-muted">
                          Full system access for administrators only
                        </p>
                      </div>
                      <div className="card-footer bg-danger text-white text-center">
                        <small>Direct Login</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ministry of Works Role */}
                  <div className="col">
                    <div 
                      className="card h-100 border-warning cursor-pointer"
                      onClick={() => handleRoleSelection('ministry')}
                    >
                      <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(255, 193, 7, 0.1)' }}>
                          <FaHardHat size={48} className="text-warning" />
                        </div>
                        <h5 className="card-title">Ministry of Works</h5>
                        <p className="card-text small text-muted">
                          For maintenance and infrastructure management
                        </p>
                      </div>
                      <div className="card-footer bg-warning text-dark text-center">
                        <small>Register First</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Traffic Department Role */}
                  <div className="col">
                    <div 
                      className="card h-100 border-success cursor-pointer"
                      onClick={() => handleRoleSelection('traffic')}
                    >
                      <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(40, 167, 69, 0.1)' }}>
                          <FaCar size={48} className="text-success" />
                        </div>
                        <h5 className="card-title">Traffic Department</h5>
                        <p className="card-text small text-muted">
                          For traffic flow management and alerts
                        </p>
                      </div>
                      <div className="card-footer bg-success text-white text-center">
                        <small>Register First</small>
                      </div>
                    </div>
                  </div>
                  
                  {/* Public User Role */}
                  <div className="col">
                    <div 
                      className="card h-100 border-info cursor-pointer"
                      onClick={() => handleRoleSelection('public')}
                    >
                      <div className="card-body text-center p-4 d-flex flex-column align-items-center justify-content-center">
                        <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(23, 162, 184, 0.1)' }}>
                          <FaUsers size={48} className="text-info" />
                        </div>
                        <h5 className="card-title">Public User</h5>
                        <p className="card-text small text-muted">
                          For general public access to view tunnel status
                        </p>
                      </div>
                      <div className="card-footer bg-info text-white text-center">
                        <small>Register or Login</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default RoleSelection;