import React from 'react';
import { Link } from 'react-router-dom';
import { mockTunnels } from '../data/mockData';

const TunnelList: React.FC = () => {
  return (
    <div className="container py-4">
      <h1 className="mb-4">Tunnel Management</h1>
      <div className="row">
        {mockTunnels.map(tunnel => (
          <div key={tunnel.id} className="col-12 col-md-6 col-lg-4 mb-4">
            <Link to={`/tunnel/${tunnel.id}`} className="text-decoration-none">
              <div className="card h-100 tunnel-card shadow-sm">
                <div className="card-body">
                  <div className="card-title d-flex justify-content-between">
                    <span>{tunnel.name}</span>
                    <span className={`badge ${getRiskLevelBadgeClass(tunnel.riskLevel)}`}>
                      {tunnel.riskLevel}
                    </span>
                  </div>
                  <p className="card-text text-muted">ID: {tunnel.id}</p>
                  <div className="d-flex justify-content-between mt-3">
                    <span className="text-secondary">
                      Barrier: <span className={tunnel.barrierStatus === 'Closed' ? 'text-danger' : 'text-success'}>
                        {tunnel.barrierStatus}
                      </span>
                    </span>
                    <small className="text-muted">
                      Updated: {new Date(tunnel.lastUpdate).toLocaleTimeString()}
                    </small>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to get appropriate badge class based on risk level
const getRiskLevelBadgeClass = (riskLevel: string): string => {
  switch (riskLevel) {
    case 'High':
      return 'bg-danger';
    case 'Moderate':
      return 'bg-warning text-dark';
    case 'Low':
      return 'bg-success';
    default:
      return 'bg-secondary';
  }
};

export default TunnelList; 