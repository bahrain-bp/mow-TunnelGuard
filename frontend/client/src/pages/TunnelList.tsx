import React, { useState } from 'react';
import { Link } from 'wouter';
import { useTunnels } from '../context/TunnelContext';
import PageLayout from '../components/PageLayout';

const TunnelList: React.FC = () => {
  const { tunnels, loading, error } = useTunnels();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('id');

  const filteredTunnels = tunnels
    .filter(tunnel => {
      const searchLower = searchQuery.toLowerCase();
      return tunnel.id.toLowerCase().includes(searchLower) || 
             tunnel.name.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'id':
          return a.id.localeCompare(b.id);
        case 'risk':
          const riskOrder = { 'High': 0, 'Moderate': 1, 'Low': 2 };
          return riskOrder[a.riskLevel as keyof typeof riskOrder] - riskOrder[b.riskLevel as keyof typeof riskOrder];
        case 'water':
          return b.waterLevel - a.waterLevel;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'update':
          return new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime();
        default:
          return 0;
      }
    });

  const getRiskLevelBadgeClass = (riskLevel: string) => {
    switch (riskLevel) {
      case 'High': return 'bg-danger';
      case 'Moderate': return 'bg-warning text-dark';
      case 'Low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <PageLayout>
      <h1 className="mb-4">Tunnel Management</h1>
      
      {/* Search and Sort Controls */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="position-relative">
            <div className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
              </svg>
            </div>
            <input 
              type="text" 
              className="form-control ps-5" 
              placeholder="Search tunnels by ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="position-relative">
            <div className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sort-down text-muted" viewBox="0 0 16 16">
                <path d="M3.5 2.5a.5.5 0 0 0-1 0v8.793l-1.146-1.147a.5.5 0 0 0-.708.708l2 1.999.007.007a.497.497 0 0 0 .7-.006l2-2a.5.5 0 0 0-.707-.708L3.5 11.293V2.5zm3.5 1a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zM7.5 6a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zm0 3a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1h-3zm0 3a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1h-1z"/>
              </svg>
            </div>
            <select 
              className="form-select ps-5" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="id">Sort by ID</option>
              <option value="risk">Sort by Risk Level</option>
              <option value="water">Sort by Water Level (High to Low)</option>
              <option value="name">Sort by Name</option>
              <option value="update">Sort by Last Update</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading tunnels...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="row">
          {filteredTunnels.map(tunnel => (
            <div key={tunnel.id} className="col-12 col-md-6 col-lg-4 mb-4">
              <Link href={`/tunnel/${tunnel.id}`} className="text-decoration-none">
                <div className="card h-100 tunnel-card shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between">
                      <span className="card-title h5">{tunnel.name}</span>
                      <span className={`badge ${getRiskLevelBadgeClass(tunnel.riskLevel)}`}>
                        {tunnel.riskLevel}
                      </span>
                    </div>
                    <p className="card-text text-muted">ID: {tunnel.id}</p>
                    
                    {/* Water Level Indicator */}
                    <div className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-secondary">Water Level:</small>
                        <small className={`fw-bold ${tunnel.waterLevel > 70 ? 'text-danger' : tunnel.waterLevel > 40 ? 'text-warning' : 'text-success'}`}>
                          {tunnel.waterLevel}%
                        </small>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar ${tunnel.waterLevel > 70 ? 'bg-danger' : tunnel.waterLevel > 40 ? 'bg-warning' : 'bg-success'}`}
                          role="progressbar" 
                          style={{ width: `${tunnel.waterLevel}%` }}
                          aria-valuenow={tunnel.waterLevel}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    
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
          
          {filteredTunnels.length === 0 && (
            <div className="col-12">
              <div className="alert alert-info">
                No tunnels found matching your search criteria.
              </div>
            </div>
          )}
        </div>
      )}
    </PageLayout>
  );
};

export default TunnelList;