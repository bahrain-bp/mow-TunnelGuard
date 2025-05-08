import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaEnvelope, FaIdCard, FaUserShield, FaClock } from 'react-icons/fa';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <PageWrapper>
        <div className="container py-5">
          <div className="alert alert-warning">
            Please log in to view your profile.
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <div className="container py-5">
        <h1 className="mb-4">User Profile</h1>
        
        <div className="row">
          <div className="col-lg-4 mb-4 mb-lg-0">
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body text-center py-5">
                <div className="profile-avatar mb-4">
                  <div className="rounded-circle bg-primary bg-opacity-10 text-primary mx-auto" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaUserCircle size={80} />
                  </div>
                </div>
                <h3 className="fw-bold mb-1">{user.fullName}</h3>
                <p className="text-muted mb-3">@{user.username}</p>
                <div className="d-flex justify-content-center">
                  <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill text-capitalize">
                    {user.role} User
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-header bg-transparent border-0 pt-4 pb-0 ps-4">
                <h4 className="fw-bold mb-0">Account Information</h4>
              </div>
              <div className="card-body p-4">
                <div className="mb-4">
                  <div className="row border-bottom pb-3 mb-3">
                    <div className="col-md-4 d-flex align-items-center">
                      <FaIdCard className="text-primary me-2" />
                      <span className="fw-medium">Full Name</span>
                    </div>
                    <div className="col-md-8">
                      <p className="mb-0">{user.fullName}</p>
                    </div>
                  </div>
                  
                  <div className="row border-bottom pb-3 mb-3">
                    <div className="col-md-4 d-flex align-items-center">
                      <FaUserCircle className="text-primary me-2" />
                      <span className="fw-medium">Username</span>
                    </div>
                    <div className="col-md-8">
                      <p className="mb-0">{user.username}</p>
                    </div>
                  </div>
                  
                  <div className="row border-bottom pb-3 mb-3">
                    <div className="col-md-4 d-flex align-items-center">
                      <FaEnvelope className="text-primary me-2" />
                      <span className="fw-medium">Email</span>
                    </div>
                    <div className="col-md-8">
                      <p className="mb-0">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="row border-bottom pb-3 mb-3">
                    <div className="col-md-4 d-flex align-items-center">
                      <FaUserShield className="text-primary me-2" />
                      <span className="fw-medium">Role</span>
                    </div>
                    <div className="col-md-8">
                      <p className="mb-0 text-capitalize">{user.role}</p>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4 d-flex align-items-center">
                      <FaClock className="text-primary me-2" />
                      <span className="fw-medium">Account Status</span>
                    </div>
                    <div className="col-md-8">
                      <span className="badge bg-success">Active</span>
                    </div>
                  </div>
                </div>
                
                <div className="alert alert-info d-flex align-items-center" role="alert">
                  <div>
                    <p className="mb-0"><strong>Note:</strong> To change your password or update your profile information, please contact your system administrator.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ProfilePage;