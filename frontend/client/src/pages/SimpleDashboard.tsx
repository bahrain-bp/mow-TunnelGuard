import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { FaUserAlt, FaHardHat, FaTrafficLight, FaUserShield } from 'react-icons/fa';

const SimpleDashboard = () => {
  const { user, userRole, hasPermission } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'risk'>('id');
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Set welcome message and role-specific information
  useEffect(() => {
    if (userRole) {
      switch(userRole) {
        case 'public':
          setWelcomeMessage('Welcome to TunnelGuard Public Dashboard. Stay informed about tunnel conditions in your area.');
          break;
        case 'ministry':
          setWelcomeMessage('Welcome to the Ministry of Works Dashboard. Monitor tunnel infrastructure and maintenance needs.');
          break;
        case 'traffic':
          setWelcomeMessage('Welcome to the Traffic Department Dashboard. Manage traffic flow and safety protocols.');
          break;
        case 'admin':
          setWelcomeMessage('Welcome, Administrator. Full system access granted.');
          break;
        default:
          setWelcomeMessage('Welcome to TunnelGuard.');
      }
    }
  }, [userRole]);

  // Role-specific icons
  const roleIcons = {
    public: FaUserAlt,
    ministry: FaHardHat,
    traffic: FaTrafficLight,
    admin: FaUserShield
  };

  // Role-specific colors
  const roleColors = {
    public: 'info',
    ministry: 'warning',
    traffic: 'success',
    admin: 'danger'
  };

  const notifications = [
    { message: "Tunnel 1 reported high water level at Sensor 2.", time: "10:32 AM" },
    { message: "Tunnel 2 barrier closed due to flood risk.", time: "9:58 AM" },
  ];

  const tunnels = [
    {
      id: 'TUN001',
      name: 'Al Fateh Tunnel',
      riskLevel: 'High',
      sensors: { entrance: 65, center: 85, exit: 55, temperature: 28, humidity: 72 },
      barrierStatus: 'Closed'
    },
    {
      id: 'TUN002',
      name: 'Diplomatic Tunnel',
      riskLevel: 'Moderate',
      sensors: { entrance: 45, center: 60, exit: 50, temperature: 26, humidity: 60 },
      barrierStatus: 'Open'
    },
  ];

  const highRiskTunnels = tunnels.filter(t => t.riskLevel === 'High');
  const filteredTunnels = tunnels.filter(
    tunnel =>
      tunnel.id.toLowerCase().includes(search.toLowerCase()) ||
      tunnel.name.toLowerCase().includes(search.toLowerCase())
  );

  filteredTunnels.sort((a, b) => {
    if (sortKey === 'id') return a.id.localeCompare(b.id);
    if (sortKey === 'risk') {
      // Use a type-safe approach for sorting by risk level
      const getRiskValue = (risk: string): number => {
        if (risk === 'High') return 3;
        if (risk === 'Moderate') return 2;
        if (risk === 'Low') return 1;
        return 0;
      };
      return getRiskValue(b.riskLevel) - getRiskValue(a.riskLevel);
    }
    return 0;
  });

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light py-4">
        <div className="container">
          {/* Role Banner */}
          {userRole && (
            <section className="mb-4">
              <div className={`card bg-${roleColors[userRole as keyof typeof roleColors]}`}>
                <div className="card-body text-white">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      {React.createElement(roleIcons[userRole as keyof typeof roleIcons], { size: 24 })}
                    </div>
                    <div>
                      <h5 className="card-title mb-0">{welcomeMessage}</h5>
                      <p className="card-text mb-0">
                        {user?.fullName ? `Logged in as: ${user.fullName}` : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
          
          {/* Quick Access Buttons - Different for each role */}
          <section className="mb-4">
            <div className="row">
              {userRole === 'public' && (
                <>
                  <div className="col-md-4 mb-3">
                    <Link href="/tunnels">
                      <div className="card h-100 border-info cursor-pointer">
                        <div className="card-body text-center">
                          <h5>View All Tunnels</h5>
                          <p>Check status of all tunnels in your area</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100 border-info">
                      <div className="card-body text-center">
                        <h5>Subscribe to Alerts</h5>
                        <p>Get notifications about flooding risks</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100 border-info">
                      <div className="card-body text-center">
                        <h5>Report an Issue</h5>
                        <p>Submit feedback about tunnel conditions</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {hasPermission('ministry') && (
                <>
                  <div className="col-md-4 mb-3">
                    <Link href="/tunnels">
                      <div className="card h-100 border-warning cursor-pointer">
                        <div className="card-body text-center">
                          <h5>Manage Tunnels</h5>
                          <p>View and manage tunnel infrastructure</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4 mb-3">
                    <Link href="/tunnel/TUN001/sensors">
                      <div className="card h-100 border-warning cursor-pointer">
                        <div className="card-body text-center">
                          <h5>Sensor Dashboard</h5>
                          <p>Monitor sensor status and alerts</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100 border-warning">
                      <div className="card-body text-center">
                        <h5>Maintenance Reports</h5>
                        <p>View scheduled maintenance activities</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {hasPermission('traffic') && (
                <>
                  <div className="col-md-4 mb-3">
                    <Link href="/alerts">
                      <div className="card h-100 border-success cursor-pointer">
                        <div className="card-body text-center">
                          <h5>Closure Requests</h5>
                          <p>Manage tunnel closure requests</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100 border-success">
                      <div className="card-body text-center">
                        <h5>Traffic Flow</h5>
                        <p>Monitor real-time traffic conditions</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="card h-100 border-success">
                      <div className="card-body text-center">
                        <h5>Emergency Response</h5>
                        <p>Coordinate emergency protocols</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {hasPermission('admin') && (
                <>
                  <div className="col-md-3 mb-3">
                    <Link href="/users">
                      <div className="card h-100 border-danger cursor-pointer">
                        <div className="card-body text-center">
                          <h5>User Management</h5>
                          <p>Manage system users and roles</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card h-100 border-danger">
                      <div className="card-body text-center">
                        <h5>System Logs</h5>
                        <p>View system activity and logs</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card h-100 border-danger">
                      <div className="card-body text-center">
                        <h5>System Configuration</h5>
                        <p>Configure system settings</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card h-100 border-danger">
                      <div className="card-body text-center">
                        <h5>System Backup</h5>
                        <p>Manage system backups</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
          
          {/* High Risk Tunnels Section - visible to all roles */}
          <section>
            <h2>High Risk Tunnels</h2>
            <div className="row">
              {highRiskTunnels.map(tunnel => (
                <div className="col-md-6" key={tunnel.id}>
                  <div className="card border-danger mb-3">
                    <div className="card-body">
                      <h5 className="card-title">{tunnel.name}</h5>
                      <h6 className="card-subtitle mb-2 text-muted">Sensors</h6>
                      <p className="card-text">
                        Entrance: {tunnel.sensors.entrance}% | Center: {tunnel.sensors.center}% | Exit: {tunnel.sensors.exit}%
                      </p>
                      <p>Temperature: {tunnel.sensors.temperature}°C</p>
                      <p>Humidity: {tunnel.sensors.humidity}%</p>
                      <button className="btn btn-secondary me-2">Open Barrier</button>
                      <button className="btn btn-secondary">Close Barrier</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <hr />
          </section>

          <section className="mb-4">
            <h2>Risk Summary</h2>
            <div className="d-flex justify-content-around">
              <div>🔴 {tunnels.filter(t => t.riskLevel === 'High').length} High Risk</div>
              <div>🟠 {tunnels.filter(t => t.riskLevel === 'Moderate').length} Moderate Risk</div>
              <div>🟢 {tunnels.filter(t => t.riskLevel === 'Low').length} Low Risk</div>
            </div>
            <div className="mt-3">AWS Services Operational | Last update: {new Date().toLocaleTimeString()}</div>
          </section>

          <section>
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="Search by ID" value={search} onChange={e => setSearch(e.target.value)} />
              <select className="form-select" value={sortKey} onChange={e => setSortKey(e.target.value as 'id' | 'risk')}>
                <option value="id">Sort by ID</option>
                <option value="risk">Sort by Risk</option>
              </select>
            </div>
            <div className="row">
              {filteredTunnels.map(tunnel => (
                <div className="col-md-4" key={tunnel.id}>
                  <div className="card mb-3 h-100">
                    <div className="card-body">
                      <h5 className="card-title">{tunnel.name}</h5>
                      <p>
                        <span className={`badge bg-${tunnel.riskLevel === 'High' ? 'danger' : tunnel.riskLevel === 'Moderate' ? 'warning' : 'success'}`}>
                          {tunnel.riskLevel} Risk
                        </span>
                      </p>
                      <p>Entrance: {tunnel.sensors.entrance}% | Center: {tunnel.sensors.center}% | Exit: {tunnel.sensors.exit}%</p>
                      <p>Temperature: {tunnel.sensors.temperature}°C | Humidity: {tunnel.sensors.humidity}%</p>
                      <div className="d-flex">
                        <button className="btn btn-secondary me-2">Open Barrier</button>
                        <button className="btn btn-secondary">Close Barrier</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SimpleDashboard;