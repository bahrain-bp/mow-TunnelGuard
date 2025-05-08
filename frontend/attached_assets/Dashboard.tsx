import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import TunnelCard from '../components/TunnelCard';
import { mockTunnels } from '../data/mockData';
import { Tunnel } from '../types';
import { FaSearch, FaSort, FaServer, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard: React.FC = () => {
  const [tunnels, setTunnels] = useState<Tunnel[]>(mockTunnels);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'risk'>('id');
  const [systemStatus] = useState({
    status: 'Operational',
    lastUpdate: new Date().toISOString()
  });

  const handleToggleBarrier = (tunnelId: string) => {
    setTunnels(prevTunnels =>
      prevTunnels.map(tunnel =>
        tunnel.id === tunnelId
          ? {
              ...tunnel,
              barrierStatus: tunnel.barrierStatus === 'Open' ? 'Closed' : 'Open'
            }
          : tunnel
      )
    );
  };

  const filteredTunnels = tunnels
    .filter(tunnel =>
      tunnel.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tunnel.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'id') {
        return a.id.localeCompare(b.id);
      }
      const riskOrder = { High: 3, Moderate: 2, Low: 1 };
      return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
    });

  const highRiskTunnels = filteredTunnels.filter(t => t.riskLevel === 'High');
  const riskCounts = {
    high: tunnels.filter(t => t.riskLevel === 'High').length,
    moderate: tunnels.filter(t => t.riskLevel === 'Moderate').length,
    low: tunnels.filter(t => t.riskLevel === 'Low').length
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light">
        <div className="container-fluid py-4">
          {/* Risk Summary Bar */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Risk Summary</h5>
                    <div className="d-flex gap-3">
                      <span className="badge bg-danger">
                        High Risk: {riskCounts.high}
                      </span>
                      <span className="badge bg-warning text-dark">
                        Moderate Risk: {riskCounts.moderate}
                      </span>
                      <span className="badge bg-success">
                        Low Risk: {riskCounts.low}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <FaServer className="text-success me-2" />
                      AWS Services: {systemStatus.status}
                    </div>
                    <small className="text-muted">
                      Last updated: {new Date(systemStatus.lastUpdate).toLocaleString()}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* High Risk Section */}
          {highRiskTunnels.length > 0 && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-danger">
                  <div className="card-header bg-danger text-white">
                    <FaExclamationTriangle className="me-2" />
                    High Risk Tunnels Requiring Immediate Attention
                  </div>
                  <div className="card-body">
                    <div className="row g-4">
                      {highRiskTunnels.map(tunnel => (
                        <div key={tunnel.id} className="col-md-6 col-lg-4">
                          <TunnelCard
                            tunnel={tunnel}
                            onToggleBarrier={handleToggleBarrier}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search and Sort Controls */}
          <div className="row mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tunnels by ID or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSort />
                </span>
                <select
                  className="form-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'id' | 'risk')}
                >
                  <option value="id">Sort by ID</option>
                  <option value="risk">Sort by Risk Level</option>
                </select>
              </div>
            </div>
          </div>

          {/* All Tunnels Grid */}
          <div className="row g-4">
            {filteredTunnels.map(tunnel => (
              <div key={tunnel.id} className="col-md-6 col-lg-4">
                <TunnelCard
                  tunnel={tunnel}
                  onToggleBarrier={handleToggleBarrier}
                />
              </div>
            ))}
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

export default Dashboard; 