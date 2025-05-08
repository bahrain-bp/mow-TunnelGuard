import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockTunnels } from '../data/mockData';

const TunnelSensors: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const tunnel = mockTunnels.find(t => t.id === id);

  if (!tunnel) {
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

  // Get sensor entries from the tunnel object
  const sensorEntries = Object.entries(tunnel.sensors);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Sensors: {tunnel.name}</h1>
        <div>
          <Link to={`/tunnel/${tunnel.id}`}>
            <button className="btn btn-outline-primary me-2">
              Back to Tunnel Details
            </button>
          </Link>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Sensor Data</h4>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-lg-8 mb-4">
              <table className="table table-striped table-bordered table-hover">
                <thead>
                  <tr>
                    <th>Sensor</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sensorEntries.map(([key, value]) => (
                    <tr key={key}>
                      <td className="fw-bold">{formatSensorName(key)}</td>
                      <td>{formatSensorValue(key, value)}</td>
                      <td>{renderSensorStatus(key, value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-lg-4">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h5>Sensor Health Summary</h5>
                  <div className="mt-3">
                    <h6 className="text-muted">Overall Health</h6>
                    <div className="progress mb-3">
                      <div 
                        className={`progress-bar ${getSensorHealthClass(calculateAverageHealth(tunnel))}`}
                        style={{ width: `${calculateAverageHealth(tunnel)}%` }}
                      >
                        {calculateAverageHealth(tunnel)}%
                      </div>
                    </div>
                    
                    <div className="d-flex justify-content-between mb-3">
                      <span>Critical</span>
                      <span>Warning</span>
                      <span>Normal</span>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="text-muted">Last Calibration</h6>
                      <p className="fs-6">{getRandomCalibrationDate()}</p>
                    </div>
                    
                    <div className="mt-3">
                      <h6 className="text-muted">Next Maintenance</h6>
                      <p className="fs-6">{getRandomMaintenanceDate()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Traffic Flow Sensors</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Entrance Sensor</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar ${getTrafficBarColor(tunnel.sensors.entrance)}`}
                    style={{ width: `${tunnel.sensors.entrance}%` }}
                  >
                    {tunnel.sensors.entrance}%
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Center Sensor</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar ${getTrafficBarColor(tunnel.sensors.center)}`}
                    style={{ width: `${tunnel.sensors.center}%` }}
                  >
                    {tunnel.sensors.center}%
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Exit Sensor</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar ${getTrafficBarColor(tunnel.sensors.exit)}`}
                    style={{ width: `${tunnel.sensors.exit}%` }}
                  >
                    {tunnel.sensors.exit}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 mb-3">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">Environmental Sensors</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Temperature</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar ${getTemperatureBarColor(tunnel.sensors.temperature)}`}
                    style={{ width: `${(tunnel.sensors.temperature / 50) * 100}%` }}
                  >
                    {tunnel.sensors.temperature}°C
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Humidity</h6>
                <div className="progress mb-2">
                  <div 
                    className={`progress-bar ${getHumidityBarColor(tunnel.sensors.humidity)}`}
                    style={{ width: `${tunnel.sensors.humidity}%` }}
                  >
                    {tunnel.sensors.humidity}%
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <h6>Air Quality</h6>
                <div className="progress mb-2">
                  <div 
                    className="progress-bar bg-success"
                    style={{ width: '65%' }}
                  >
                    Good (65%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        <Link to={`/tunnel/${tunnel.id}`}>
          <button className="btn btn-outline-secondary">Back to Tunnel Details</button>
        </Link>
        <button className="btn btn-primary">Download Sensor Report</button>
      </div>
    </div>
  );
};

// Helper function to format sensor names
const formatSensorName = (key: string): string => {
  // Capitalize first letter and add spaces before uppercase letters
  return key.charAt(0).toUpperCase() + 
    key.slice(1).replace(/([A-Z])/g, ' $1');
};

// Helper function to format sensor values
const formatSensorValue = (key: string, value: any): string => {
  if (key === 'temperature') return `${value}°C`;
  if (key === 'humidity') return `${value}%`;
  return `${value}%`;
};

// Helper function to render sensor status
const renderSensorStatus = (key: string, value: any): JSX.Element => {
  let status = 'Normal';
  let badgeClass = 'bg-success';

  if (key === 'temperature') {
    if (value > 30) {
      status = 'Critical';
      badgeClass = 'bg-danger';
    } else if (value > 25) {
      status = 'Warning';
      badgeClass = 'bg-warning text-dark';
    }
  } else if (key === 'humidity') {
    if (value > 80) {
      status = 'Critical';
      badgeClass = 'bg-danger';
    } else if (value > 70) {
      status = 'Warning';
      badgeClass = 'bg-warning text-dark';
    }
  } else {
    if (value > 75) {
      status = 'Critical';
      badgeClass = 'bg-danger';
    } else if (value > 50) {
      status = 'Warning';
      badgeClass = 'bg-warning text-dark';
    }
  }

  return <span className={`badge ${badgeClass}`}>{status}</span>;
};

// Helper function to get traffic bar color
const getTrafficBarColor = (value: number): string => {
  if (value >= 75) return 'bg-danger';
  if (value >= 50) return 'bg-warning';
  return 'bg-success';
};

// Helper function to get temperature bar color
const getTemperatureBarColor = (value: number): string => {
  if (value >= 30) return 'bg-danger';
  if (value >= 25) return 'bg-warning';
  return 'bg-success';
};

// Helper function to get humidity bar color
const getHumidityBarColor = (value: number): string => {
  if (value >= 80) return 'bg-danger';
  if (value >= 70) return 'bg-warning';
  return 'bg-success';
};

// Helper function to calculate average sensor health
const calculateAverageHealth = (tunnel: typeof mockTunnels[0]): number => {
  let totalHealth = 0;
  let sensorCount = 0;

  Object.entries(tunnel.sensors).forEach(([key, value]) => {
    let health = 0;
    
    if (key === 'temperature') {
      health = Math.max(0, 100 - Math.abs(value - 22) * 5);
    } else if (key === 'humidity') {
      health = Math.max(0, 100 - Math.abs(value - 60));
    } else {
      health = Math.max(0, 100 - value);
    }
    
    totalHealth += health;
    sensorCount++;
  });

  return Math.round(totalHealth / sensorCount);
};

// Helper function to get sensor health class
const getSensorHealthClass = (health: number): string => {
  if (health < 60) return 'bg-danger';
  if (health < 80) return 'bg-warning';
  return 'bg-success';
};

// Helper function to get random calibration date
const getRandomCalibrationDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toLocaleDateString();
};

// Helper function to get random maintenance date
const getRandomMaintenanceDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 60) + 30);
  return date.toLocaleDateString();
};

export default TunnelSensors; 