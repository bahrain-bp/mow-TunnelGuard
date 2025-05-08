import React from 'react';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import Header from '../components/Header';

const Welcome: React.FC = () => {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
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
                    to="/register" 
                    className="btn btn-primary btn-lg px-4 gap-3"
                  >
                    <FaUserPlus className="me-2" />
                    Register
                  </Link>
                  <Link 
                    to="/login" 
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

      <footer className="bg-dark text-light py-4">
        <div className="container text-center">
          <p className="mb-0">© 2024 TunnelGuard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Welcome; 