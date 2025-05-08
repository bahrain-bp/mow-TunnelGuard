import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockTunnels } from '../data/mockData';

const tunnelIframes = {
    'TUN001': `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3579.3801309415016!2d50.59217747835604!3d26.216835417942224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49a9005b8d76af%3A0x7759a9d2ed1b5b49!2sAl%20Fateh%20Tunnel!5e0!3m2!1sen!2sbh!4v1746620278384!5m2!1sen!2sbh" width="600" height="450" style="border:0;" allowFullscreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>`,
    'TUN002': `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d28635.041414363703!2d50.5741527535395!3d26.21683392737806!2m3!1f0;2f0;3f0!3m2!1i1024;2i768!4f13.1!3m3!1m2!1s0x3e49a900707c0ad5%3A0x54f0491b3de5e44a!2sMINA%20SALMAN%20INTERSECTION!5e0!3m2!1sen!2sbh!4v1746620349903!5m2!1sen!2sbh" width="600" height="450" style="border:0;" allowFullscreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>`,
    // Add more mappings here as needed
};

const floodThresholds = {
  'TUN001': '35%',
  'TUN002': '40%',
  'TUN003': '30%',
  'TUN004': '25%',
  'TUN005': '45%',
  'TUN006': '35%',
  'TUN007': '30%'
};

const TunnelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const tunnelIndex = mockTunnels.findIndex(t => t.id === id);
  const [tunnels, setTunnels] = useState(mockTunnels);
  const [isEditing, setIsEditing] = useState(false);

  if (tunnelIndex === -1) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          <h4 className="alert-heading">Tunnel not found</h4>
          <p>The tunnel with ID {id} could not be found in the system.</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Link to="/tunnels">
              <button className="btn btn-outline-warning">Return to Tunnel List</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tunnel = tunnels[tunnelIndex];
  const [tunnelName, setTunnelName] = useState(tunnel.name);

  const saveName = () => {
    const updatedTunnels = [...tunnels];
    updatedTunnels[tunnelIndex].name = tunnelName;
    setTunnels(updatedTunnels);
    setIsEditing(false);
  };

  const deleteTunnel = () => {
    if (window.confirm("Are you sure you want to delete this tunnel?")) {
      const updatedTunnels = tunnels.filter((_, i) => i !== tunnelIndex);
      setTunnels(updatedTunnels);
      navigate('/tunnels');
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        {isEditing ? (
          <div className="d-flex gap-2 align-items-center w-100">
            <input
              type="text"
              className="form-control"
              value={tunnelName}
              onChange={(e) => setTunnelName(e.target.value)}
            />
            <button className="btn btn-success btn-sm" onClick={saveName}>Save</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        ) : (
          <>
            <h1>{tunnel.name}</h1>
            <div className="d-flex gap-3 align-items-center">
              <span className={`badge ${getRiskLevelBadgeClass(tunnel.riskLevel)} fs-6 px-3 py-2`}>
                {tunnel.riskLevel} Risk
              </span>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setIsEditing(true)}>Edit Name</button>
            </div>
          </>
        )}
      </div>

      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">Tunnel Details</h4>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6 mb-3"><h6 className="text-muted">ID</h6><p className="fw-bold">{tunnel.id}</p></div>
                <div className="col-md-6 mb-3"><h6 className="text-muted">Location</h6><p className="fw-bold">
                  {tunnelIframes[tunnel.id] || 'Unknown'}
                </p></div>
                <div className="col-md-6 mb-3"><h6 className="text-muted">Flood Threshold</h6><p className="fw-bold">{floodThresholds[tunnel.id] || '25%'}</p></div>
                <div className="col-md-6 mb-3"><h6 className="text-muted">Last Updated</h6><p className="fw-bold">{new Date(tunnel.lastUpdate).toLocaleString()}</p></div>
                <div className="col-md-6 mb-3"><h6 className="text-muted">Barrier State</h6>
                  <p className="fw-bold"><span className={`badge bg-${tunnel.barrierStatus === 'Closed' ? 'danger' : 'success'}`}>{tunnel.barrierStatus}</span></p>
                </div>
                <div className="col-md-6 mb-3"><h6 className="text-muted">Sensor Count</h6><p className="fw-bold">{Object.keys(tunnel.sensors).length}</p></div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <Link to={`/tunnel/${tunnel.id}/sensors`}>
                  <button className="btn btn-primary">View Sensors</button>
                </Link>
                <button className="btn btn-outline-danger" onClick={deleteTunnel}>Delete Tunnel</button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-info text-white">
              <h4 className="mb-0">Quick Stats</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6 className="text-muted">Temperature</h6>
                <p className="fw-bold">{tunnel.sensors.temperature}°C</p>
                <div className="progress"><div className="progress-bar bg-info" style={{ width: `${(tunnel.sensors.temperature / 50) * 100}%` }}></div></div>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Humidity</h6>
                <p className="fw-bold">{tunnel.sensors.humidity}%</p>
                <div className="progress"><div className="progress-bar bg-primary" style={{ width: `${tunnel.sensors.humidity}%` }}></div></div>
              </div>

              <div className="mb-3">
                <h6 className="text-muted">Average Traffic</h6>
                <p className="fw-bold">{calculateAverage(tunnel)}%</p>
                <div className="progress"><div className={`progress-bar ${getTrafficBarColor(calculateAverage(tunnel))}`} style={{ width: `${calculateAverage(tunnel)}%` }}></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Link to="/tunnels">
          <button className="btn btn-outline-secondary">Back to Tunnels</button>
        </Link>
      </div>
    </div>
  );
};

// Helpers
const getRiskLevelBadgeClass = (riskLevel) => {
  switch (riskLevel) {
    case 'High': return 'danger';
    case 'Moderate': return 'warning';
    case 'Low': return 'success';
    default: return 'secondary';
  }
};

const calculateAverage = (tunnel) => {
  const { entrance, center, exit } = tunnel.sensors;
  return Math.round((entrance + center + exit) / 3);
};

const getTrafficBarColor = (average) => {
  if (average >= 75) return 'bg-danger';
  if (average >= 50) return 'bg-warning';
  return 'bg-success';
};

export default TunnelDetail;