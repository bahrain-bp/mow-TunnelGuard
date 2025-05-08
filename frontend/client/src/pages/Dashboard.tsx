
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { Dropdown } from 'react-bootstrap';

// Organized and grouped icons for better readability
import { 
  // UI & Navigation icons
  FaEye, FaEllipsisV, FaCaretDown, FaEdit, FaUser, FaSearch, FaShieldAlt, FaClock,
  
  // Status & Alert icons
  FaExclamationTriangle, FaTachometerAlt, 
  
  // Data & Statistics icons
  FaChartBar, FaChartLine, FaPercentage, 
  
  // Environment & Sensor icons
  FaWater, FaThermometerHalf, FaTemperatureHigh, FaCloud, FaRoad,
  
  // System Management icons
  FaUserCog, FaTools, FaServer, FaDatabase, FaDownload, FaCog, FaHistory,
  
  // Contact & Communication icons
  FaEnvelope, FaPhone
} from 'react-icons/fa';

// Context hooks
import { useTunnels } from '../context/TunnelContext';
import { useUsers } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import ClosureRequestsPanel from '../components/ClosureRequestsPanel';

// Component for the statistics panel
const StatisticsPanel: React.FC<{tunnels: any[]}> = ({ tunnels }) => {
  // Optimized utility functions using memoization
  const calculateAverage = React.useCallback((data: any[], key: string): string => {
    if (!data.length) return '0';
    const sum = data.reduce((acc, item) => acc + (item.sensors?.[key] || 0), 0);
    return (sum / data.length).toFixed(1);
  }, []);

  const getMaxValue = React.useCallback((data: any[], key: string): number => {
    if (!data.length) return 0;
    return Math.max(...data.map(item => item.sensors?.[key] || 0));
  }, []);

  // Cached barrier counts
  const openBarriers = tunnels.filter(t => t.barrierStatus === 'Open').length;
  const closedBarriers = tunnels.filter(t => t.barrierStatus === 'Closed').length;
  
  // Precomputed statistics for better performance
  const avgTemperature = calculateAverage(tunnels, 'temperature');
  const avgHumidity = calculateAverage(tunnels, 'humidity');
  const maxWaterLevel = getMaxValue(tunnels, 'center');
  
  // StatCard component for DRY code
  const StatCard = ({ 
    icon, 
    iconClass, 
    title, 
    value, 
    unit = '', 
    description 
  }: { 
    icon: React.ReactNode, 
    iconClass: string, 
    title: string, 
    value: string | number, 
    unit?: string, 
    description: string 
  }) => (
    <div className="col-lg-3 col-md-6">
      <div className="stat-card rounded-3 bg-white p-3 h-100 border">
        <div className="d-flex align-items-center mb-2">
          <div className={`rounded-circle ${iconClass} p-2 me-2`}>
            {icon}
          </div>
          <h5 className="mb-0 fw-semibold">{title}</h5>
        </div>
        <p className="display-6 fw-bold mb-0">{value}{unit}</p>
        <p className="text-muted mb-0 small">{description}</p>
      </div>
    </div>
  );
  
  return (
    <div className="statistics-panel rounded-4 p-4 mb-4" style={{
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 className="fw-bold mb-3 d-flex align-items-center">
        <FaChartBar className="text-primary me-2" /> 
        System Statistics
      </h3>
      
      <div className="row g-4">
        <StatCard 
          icon={<FaTemperatureHigh className="text-primary" />}
          iconClass="bg-primary-subtle"
          title="Temperature"
          value={avgTemperature}
          unit="°C"
          description="Avg across all tunnels"
        />
        
        <StatCard 
          icon={<FaCloud className="text-info" />}
          iconClass="bg-info-subtle"
          title="Humidity"
          value={avgHumidity}
          unit="%"
          description="Avg across all tunnels"
        />
        
        <StatCard 
          icon={<FaWater className="text-warning" />}
          iconClass="bg-warning-subtle"
          title="Water Level"
          value={maxWaterLevel}
          unit="mm"
          description="Highest level detected"
        />
        
        <div className="col-lg-3 col-md-6">
          <div className="stat-card rounded-3 bg-white p-3 h-100 border">
            <div className="d-flex align-items-center mb-2">
              <div className="rounded-circle bg-success-subtle p-2 me-2">
                <FaRoad className="text-success" />
              </div>
              <h5 className="mb-0 fw-semibold">Barriers</h5>
            </div>
            <div className="d-flex align-items-center">
              <div className="w-50 text-center">
                <p className="display-6 fw-bold mb-0 text-success">{openBarriers}</p>
                <p className="text-muted mb-0 small">Open</p>
              </div>
              <div className="w-50 text-center">
                <p className="display-6 fw-bold mb-0 text-danger">{closedBarriers}</p>
                <p className="text-muted mb-0 small">Closed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// AdminActionsDropdown was moved to header

// High Risk Tunnel Card component
const HighRiskTunnelCard: React.FC<{tunnel: any, toggleBarrier: Function}> = ({ tunnel, toggleBarrier }) => {
  const { hasPermission } = useAuth();
  const canControlBarrier = hasPermission(['admin', 'ministry', 'traffic']);

  return (
    <div className="card border-0 rounded-4 h-100 shadow-sm high-risk-card overflow-hidden">
      <div className="card-header bg-danger text-white py-3 d-flex justify-content-between align-items-center">
        <h3 className="h5 fw-bold mb-0 d-flex align-items-center">
          <FaExclamationTriangle className="me-2" />
          Tunnel {tunnel.id}
        </h3>
        <span className="badge bg-white text-danger fs-6 px-3 py-2 fw-semibold">High Risk</span>
      </div>
      <div className="card-body">
        <div className="mb-4">
          <div className="alert alert-danger py-2">
            <small className="fw-semibold d-flex align-items-center">
              <FaExclamationTriangle className="me-1" /> Immediate attention required!
            </small>
          </div>
          
          <div className="data-section mb-3">
            <h6 className="text-danger fw-bold mb-2 border-bottom pb-2 d-flex align-items-center">
              <FaWater className="me-2" /> Water Levels
            </h6>
            <div className="row g-2">
              <div className="col-4">
                <div className="p-2 bg-light content-bg rounded text-center">
                  <p className="mb-1 small">Entrance</p>
                  <p className="fw-bold mb-0">{tunnel.sensors?.entrance} mm</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-light content-bg rounded text-center">
                  <p className="mb-1 small">Center</p>
                  <p className="fw-bold mb-0">{tunnel.sensors?.center} mm</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 bg-light content-bg rounded text-center">
                  <p className="mb-1 small">Exit</p>
                  <p className="fw-bold mb-0">{tunnel.sensors?.exit} mm</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="data-section">
            <h6 className="text-danger fw-bold mb-2 border-bottom pb-2 d-flex align-items-center">
              <FaThermometerHalf className="me-2" /> Environment
            </h6>
            <div className="row g-2">
              <div className="col-6">
                <div className="p-2 bg-light content-bg rounded text-center">
                  <p className="mb-1 small">Temperature</p>
                  <p className="fw-bold mb-0">{tunnel.sensors?.temperature}°C</p>
                </div>
              </div>
              <div className="col-6">
                <div className="p-2 bg-light content-bg rounded text-center">
                  <p className="mb-1 small">Humidity</p>
                  <p className="fw-bold mb-0">{tunnel.sensors?.humidity}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2">
          {canControlBarrier ? (
            <button
              className="btn btn-danger w-100 d-flex align-items-center justify-content-center"
              onClick={() => toggleBarrier(tunnel.id)}
            >
              <FaRoad className="me-2" /> {tunnel.barrierStatus === 'Open' ? 'Close' : 'Open'} Barrier
            </button>
          ) : (
            <div className="alert alert-warning m-0 p-2 w-100 d-flex align-items-center">
              <FaExclamationTriangle className="me-2" /> Barrier is {tunnel.barrierStatus}
            </div>
          )}
          <Link href={`/tunnel/${tunnel.id}`}>
            <button className="btn btn-outline-secondary d-flex align-items-center">
              <FaEye className="me-1" /> View
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Standard Tunnel Card component
const TunnelCard: React.FC<{tunnel: any, toggleBarrier: Function}> = ({ tunnel, toggleBarrier }) => {
  const { hasPermission } = useAuth();
  const canControlBarrier = hasPermission(['admin', 'ministry', 'traffic']);
  
  const getBadgeColor = (risk: string) => {
    switch (risk) {
      case 'High': return 'danger';
      case 'Moderate': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };
  
  return (
    <div className="card border-0 rounded-4 h-100 shadow-sm tunnel-card overflow-hidden">
      <div className={`card-header bg-${getBadgeColor(tunnel.riskLevel)}-subtle py-3 d-flex justify-content-between align-items-center`}>
        <h3 className="h6 fw-bold mb-0">Tunnel {tunnel.id}</h3>
        <span className={`badge bg-${getBadgeColor(tunnel.riskLevel)} px-2 py-1`}>
          {tunnel.riskLevel} Risk
        </span>
      </div>
      <div className="card-body">
        <div className="position-relative mb-3">
          <div className="dropdown position-absolute top-0 end-0">
            <button className="btn btn-sm btn-outline-primary border-0 shadow-sm content-bg px-2 py-1" type="button" id={`tunnel-${tunnel.id}-actions`} data-bs-toggle="dropdown" aria-expanded="false">
              <FaEllipsisV size={14} />
            </button>
            <ul className="dropdown-menu shadow-sm border-0" aria-labelledby={`tunnel-${tunnel.id}-actions`}>
              <li><Link href={`/tunnel/${tunnel.id}`} className="dropdown-item">View Details</Link></li>
              <li><Link href={`/tunnel/${tunnel.id}/sensors`} className="dropdown-item">View Sensors</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="row g-3 mb-3">
          <div className="col-6">
            <div className="p-2 rounded bg-light content-bg">
              <div className="d-flex align-items-center mb-1">
                <FaWater className="text-primary me-1" size={12} />
                <span className="small fw-medium">Water</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="fs-5 fw-semibold">{tunnel.sensors?.center || 0} mm</span>
                <span className="badge bg-light text-secondary content-bg">Center</span>
              </div>
            </div>
          </div>
          
          <div className="col-6">
            <div className="p-2 rounded bg-light content-bg">
              <div className="d-flex align-items-center mb-1">
                <FaTemperatureHigh className="text-danger me-1" size={12} />
                <span className="small fw-medium">Temp</span>
              </div>
              <div className="d-flex align-items-center justify-content-between">
                <span className="fs-5 fw-semibold">{tunnel.sensors?.temperature || 0}°C</span>
                <span className="badge bg-light text-secondary content-bg">Now</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="d-flex gap-2 mt-auto">
          {canControlBarrier ? (
            <button
              className={`btn btn-sm flex-grow-1 ${tunnel.barrierStatus === 'Open' ? 'btn-outline-danger' : 'btn-outline-success'}`}
              onClick={() => toggleBarrier(tunnel.id)}
            >
              {tunnel.barrierStatus === 'Open' ? 'Close' : 'Open'} Barrier
            </button>
          ) : (
            <div className="badge bg-secondary flex-grow-1 d-flex align-items-center justify-content-center py-2">
              <FaRoad className="me-1" /> Barrier: {tunnel.barrierStatus}
            </div>
          )}
          <Link href={`/tunnel/${tunnel.id}`}>
            <button className="btn btn-sm btn-primary d-flex align-items-center">
              <FaEye /> 
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Risk Summary component
const RiskSummary: React.FC<{tunnels: any[]}> = ({ tunnels }) => {
  const countByRisk = (riskLevel: string) => {
    return tunnels.filter(tunnel => tunnel.riskLevel === riskLevel).length;
  };
  
  // Calculate total and percentages
  const totalTunnels = tunnels.length;
  const highCount = countByRisk('High');
  const moderateCount = countByRisk('Moderate');
  const lowCount = countByRisk('Low');
  
  const highPercent = totalTunnels ? Math.round((highCount / totalTunnels) * 100) : 0;
  const moderatePercent = totalTunnels ? Math.round((moderateCount / totalTunnels) * 100) : 0;
  const lowPercent = totalTunnels ? Math.round((lowCount / totalTunnels) * 100) : 0;
  
  return (
    <div className="risk-summary mb-4">
      <h3 className="h4 fw-bold mb-3 d-flex align-items-center">
        <FaChartBar className="text-primary me-2" /> 
        Risk Distribution
      </h3>
      
      <div className="card border-0 rounded-4 shadow-sm hover-shadow mb-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold">Tunnel Risk Summary</h5>
            <span className="badge bg-primary-subtle text-primary px-3 py-2">
              {totalTunnels} Total Tunnels
            </span>
          </div>
          
          {/* Risk progress bars */}
          <div className="risk-bars">
            <div className="risk-category mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <div className="pulse-dot bg-danger me-2"></div>
                  <span className="fw-medium">High Risk</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-danger-subtle text-danger me-2">{highCount}</span>
                  <span className="text-muted small">{highPercent}%</span>
                </div>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-danger" 
                  role="progressbar" 
                  style={{ width: `${highPercent}%` }}
                  aria-valuenow={highPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
            
            <div className="risk-category mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <div className="pulse-dot bg-warning me-2"></div>
                  <span className="fw-medium">Moderate Risk</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-warning-subtle text-warning me-2">{moderateCount}</span>
                  <span className="text-muted small">{moderatePercent}%</span>
                </div>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-warning" 
                  role="progressbar" 
                  style={{ width: `${moderatePercent}%` }}
                  aria-valuenow={moderatePercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
            
            <div className="risk-category mb-0">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <div className="d-flex align-items-center">
                  <div className="pulse-dot bg-success me-2"></div>
                  <span className="fw-medium">Low Risk</span>
                </div>
                <div className="d-flex align-items-center">
                  <span className="badge bg-success-subtle text-success me-2">{lowCount}</span>
                  <span className="text-muted small">{lowPercent}%</span>
                </div>
              </div>
              <div className="progress" style={{ height: '10px' }}>
                <div 
                  className="progress-bar bg-success" 
                  role="progressbar" 
                  style={{ width: `${lowPercent}%` }}
                  aria-valuenow={lowPercent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// User Profile Card Component
const ProfileCard: React.FC<{user: any}> = ({ user }) => {
  return (
    <div className="profile-card rounded-4 p-4 mb-4 bg-white content-bg shadow-sm border hover-shadow transition-all">
      <div className="d-flex align-items-center mb-3">
        <div className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
          {user?.fullName?.substring(0, 1)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h4 className="fw-bold mb-0">{user?.fullName || 'User'}</h4>
          <p className="text-muted mb-0 small">{user?.role || 'No Role'}</p>
        </div>
      </div>
      
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <div className="contact-detail p-2 rounded-3 bg-light content-bg hover-shadow transition-all cursor-pointer">
            <p className="mb-1 small text-muted">Department</p>
            <div className="d-flex align-items-center">
              <FaUserCog className="me-2 text-primary" size={14} />
              <span className="fw-medium">{user?.department || 'Not Specified'}</span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="contact-detail p-2 rounded-3 bg-light content-bg hover-shadow transition-all cursor-pointer">
            <p className="mb-1 small text-muted">Email</p>
            <div className="d-flex align-items-center">
              <FaEnvelope className="me-2 text-primary" size={14} />
              <span className="fw-medium">{user?.email || 'No Email'}</span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="contact-detail p-2 rounded-3 bg-light content-bg hover-shadow transition-all cursor-pointer">
            <p className="mb-1 small text-muted">Phone</p>
            <div className="d-flex align-items-center">
              <FaPhone className="me-2 text-primary" size={14} />
              <span className="fw-medium">{user?.phone || 'No Phone'}</span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="contact-detail p-2 rounded-3 bg-light content-bg hover-shadow transition-all cursor-pointer">
            <p className="mb-1 small text-muted">Username</p>
            <div className="d-flex align-items-center">
              <FaUserCog className="me-2 text-primary" size={14} />
              <span className="fw-medium">{user?.username || 'No Username'}</span>
            </div>
          </div>
        </div>
      </div>
      
      <button className="btn btn-sm btn-outline-primary w-100 d-flex align-items-center justify-content-center">
        <FaEdit className="me-2" /> Edit Profile
      </button>
    </div>
  );
};

// Main Dashboard component
const Dashboard: React.FC = () => {
  const { tunnels, loading, error, toggleBarrier } = useTunnels();
  const { users } = useUsers();
  const { user, hasPermission, userRole } = useAuth();
  const [sortOption, setSortOption] = useState<'risk' | 'water'>('risk'); // Default sort by risk level
  // showProfile state removed (now in Header)
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'id' | 'risk' | 'water'>('risk');

  // Get current user for profile display
  const currentUser = user;
  
  // Check if user is traffic department
  const isTrafficDepartment = user?.role === 'traffic';
  
  // Calculate total counts for open and closed tunnels
  const openTunnelsCount = tunnels.filter(t => t.barrierStatus === 'Open').length;
  const closedTunnelsCount = tunnels.filter(t => t.barrierStatus === 'Closed').length;

  // Pre-compute sensor data for more reliable sorting and display
  const processedTunnels = tunnels.map(tunnel => {
    // Ensure sensors object exists
    const sensors = tunnel.sensors || {};
    
    // Calculate the average water level across all points
    const waterLevel = [sensors.entrance || 0, sensors.center || 0, sensors.exit || 0].reduce(
      (sum, val) => sum + val, 0
    ) / 3;
    
    return {
      ...tunnel,
      // Ensure sensors object exists for display
      sensors: sensors,
      // Add calculated water level for sorting
      calculatedWaterLevel: waterLevel
    };
  });
  
  // Filter tunnels based on search criteria
  const filteredTunnels = processedTunnels
    .filter(tunnel => 
      tunnel.id.toLowerCase().includes(search.toLowerCase()) ||
      (tunnel.name && tunnel.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortKey === 'risk') {
        const riskOrder: Record<string, number> = { High: 3, Moderate: 2, Low: 1 };
        return (riskOrder[b.riskLevel] || 0) - (riskOrder[a.riskLevel] || 0);
      } else if (sortKey === 'water') {
        return b.calculatedWaterLevel - a.calculatedWaterLevel;
      }
      return a.id.localeCompare(b.id);
    });

  // Always separate high-risk tunnels to display them first
  const highRiskTunnels = filteredTunnels.filter(tunnel => tunnel.riskLevel === 'High');
  const otherTunnels = filteredTunnels.filter(tunnel => tunnel.riskLevel !== 'High');
  
  return (
    <div className="dashboard content-bg p-3 p-lg-4">
      {/* Dashboard title section (consistent with Tunnel Management) */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0 text-dark">System Dashboard</h1>
      </div>
      {/* Dashboard overview cards */}
      <div className="row g-4 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm hover-shadow h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-semibold">Tunnel Status</h5>
                <div className="rounded-circle bg-primary bg-opacity-25 p-2">
                  <FaTachometerAlt className="text-primary" size={16} />
                </div>
              </div>
              <div className="d-flex gap-3 mt-3">
                <div className="d-flex align-items-center gap-2 badge bg-success-subtle text-success fs-6 py-2 px-3 border border-success-subtle shadow-sm">
                  <div className="pulse-dot bg-success"></div>
                  {openTunnelsCount} Open
                </div>
                <div className="d-flex align-items-center gap-2 badge bg-danger-subtle text-danger fs-6 py-2 px-3 border border-danger-subtle shadow-sm">
                  <div className="pulse-dot bg-danger"></div>
                  {closedTunnelsCount} Closed
                </div>
              </div>
              <p className="text-muted mt-3 mb-0 small">
                Monitoring {tunnels.length} tunnels and {users.length} registered users
              </p>
            </div>
          </div>
        </div>
        
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm hover-shadow h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-semibold">Quick Search</h5>
                <div className="rounded-circle bg-primary bg-opacity-25 p-2">
                  <FaSearch className="text-primary" size={16} />
                </div>
              </div>
              <div className="position-relative mt-3">
                <FaSearch className="position-absolute start-0 top-50 translate-middle-y ms-3 text-muted" />
                <input
                  type="text"
                  className="form-control ps-5 shadow-sm border"
                  placeholder="Search tunnels by ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-xl-6 col-md-12">
          <div className="card border-0 shadow-sm hover-shadow h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-semibold">Maintenance Schedule</h5>
                <div className="rounded-circle bg-primary bg-opacity-25 p-2">
                  <FaTools className="text-primary" size={16} />
                </div>
              </div>
              <div className="position-relative">
                <div className="d-flex flex-column">
                  <div className="d-flex justify-content-between p-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="badge bg-warning text-dark me-2">Pending</div>
                      <span>Al Fateh Tunnel (TUN001) - Monthly inspection</span>
                    </div>
                    <div className="text-muted">Tomorrow, 09:00 AM</div>
                  </div>
                  <div className="d-flex justify-content-between p-2 border-bottom">
                    <div className="d-flex align-items-center">
                      <div className="badge bg-success text-white me-2">Scheduled</div>
                      <span>Central Underpass (TUN003) - Sensor calibration</span>
                    </div>
                    <div className="text-muted">May 3, 2025</div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted small">View full schedule for more details</span>
                    <button className="btn btn-sm btn-outline-primary">Schedule Maintenance</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        {/* User Profile Section removed - now accessible from header */}
        
        {/* Statistics Panel */}
        <StatisticsPanel tunnels={tunnels} />
        
        {/* Risk Summary */}
        <RiskSummary tunnels={tunnels} />
        
        {/* Closure Requests Panel - Only for Traffic Department users */}
        {isTrafficDepartment && (
          <section className="mb-5">
            <ClosureRequestsPanel />
          </section>
        )}
        
        {/* High Risk Tunnels Section */}
        {highRiskTunnels.length > 0 && (
          <section className="mb-5">
            <h2 className="h4 fw-bold mb-3 d-flex align-items-center">
              <FaExclamationTriangle className="text-danger me-2" />
              High Risk Tunnels - Immediate Attention Required
            </h2>
            <div className="row g-4">
              {highRiskTunnels.map(tunnel => (
                <div key={tunnel.id} className="col-lg-4 col-md-6">
                  <HighRiskTunnelCard tunnel={tunnel} toggleBarrier={toggleBarrier} />
                </div>
              ))}
            </div>
          </section>
        )}
        
        {/* All Other Tunnels Grid */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold mb-0 d-flex align-items-center">
              <FaRoad className="text-primary me-2" /> All Monitored Tunnels
            </h2>
            <div>
              <select
                className="form-select form-select-sm"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'id' | 'risk' | 'water')}
              >
                <option value="id">Sort by ID</option>
                <option value="risk">Sort by Risk Level</option>
                <option value="water">Sort by Water Level (High to Low)</option>
              </select>
            </div>
          </div>
          
          <div className="row g-4">
            {/* Display other tunnels when there are no high-risk ones or in addition to them */}
            {otherTunnels.length > 0 && otherTunnels.map(tunnel => (
              <div key={tunnel.id} className="col-xl-3 col-lg-4 col-md-6">
                <TunnelCard tunnel={tunnel} toggleBarrier={toggleBarrier} />
              </div>
            ))}
            
            {/* If no tunnels match the filter criteria */}
            {filteredTunnels.length === 0 && (
              <div className="col-12">
                <div className="alert alert-info">
                  No tunnels match your search criteria.
                </div>
              </div>
            )}
            
            {/* If tunnels exist but none match the filter */}
            {tunnels.length > 0 && filteredTunnels.length === 0 && (
              <div className="col-12">
                <div className="alert alert-warning">
                  <FaSearch className="me-2" /> 
                  No tunnels match your search term "{search}". Try a different search term or clear the search field.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* System Activity Logs */}
        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h4 fw-bold mb-0 d-flex align-items-center">
              <FaHistory className="text-primary me-2" /> System Activity Log
            </h2>
            <button className="btn btn-sm btn-outline-primary d-flex align-items-center">
              <FaDownload className="me-2" /> Export Logs
            </button>
          </div>
          
          <div className="card border-0 rounded-4 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-dark text-light">
                    <tr>
                      <th>Time</th>
                      <th>Tunnel</th>
                      <th>Event</th>
                      <th>User</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="text-nowrap">{new Date().toLocaleTimeString()}</td>
                      <td>Al Fateh Tunnel (TUN001)</td>
                      <td>Barrier Closed</td>
                      <td>Admin</td>
                      <td><span className="badge bg-success">Success</span></td>
                    </tr>
                    <tr>
                      <td className="text-nowrap">{new Date(Date.now() - 1200000).toLocaleTimeString()}</td>
                      <td>Central Underpass (TUN003)</td>
                      <td>Water Level Alert</td>
                      <td>System</td>
                      <td><span className="badge bg-warning">Warning</span></td>
                    </tr>
                    <tr>
                      <td className="text-nowrap">{new Date(Date.now() - 3600000).toLocaleTimeString()}</td>
                      <td>North Bridge (TUN007)</td>
                      <td>Sensor Calibration</td>
                      <td>Maintenance Team</td>
                      <td><span className="badge bg-info">Info</span></td>
                    </tr>
                    <tr>
                      <td className="text-nowrap">{new Date(Date.now() - 7200000).toLocaleTimeString()}</td>
                      <td>South Highway (TUN004)</td>
                      <td>Traffic Alert</td>
                      <td>Traffic Dept</td>
                      <td><span className="badge bg-warning">Warning</span></td>
                    </tr>
                    <tr>
                      <td className="text-nowrap">{new Date(Date.now() - 10800000).toLocaleTimeString()}</td>
                      <td>East Tunnel (TUN002)</td>
                      <td>Barrier Opened</td>
                      <td>Admin</td>
                      <td><span className="badge bg-success">Success</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-3 bg-light border-top d-flex justify-content-between align-items-center">
                <span className="text-muted small">Showing recent 5 events</span>
                <button className="btn btn-sm btn-link">View Full Log</button>
              </div>
            </div>
          </div>
        </section>
        
        {/* System Status Footer */}
        <div className="system-status-footer p-3 rounded-3 bg-light content-bg">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <FaServer className="text-success me-2" />
              <span className="text-muted">System Status: </span>
              <span className="text-success fw-semibold ms-1">Operational</span>
            </div>
            <div className="text-muted small">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;
