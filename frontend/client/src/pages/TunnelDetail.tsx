import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { Modal, Button, Form } from 'react-bootstrap';
import { 
  FaMapMarkerAlt, FaWater, FaTemperatureHigh, FaCalendarAlt, 
  FaShieldAlt, FaMicrochip, FaEdit, FaTrashAlt, FaArrowLeft, 
  FaExclamationTriangle, FaTint, FaThermometerHalf, FaCar, FaRoad, 
  FaLock, FaLockOpen, FaInfoCircle, FaHistory, FaBell, FaSignal,
  FaCloudRain, FaVial, FaStopwatch, FaTachometerAlt
} from 'react-icons/fa';
import { useTunnels } from '../context/TunnelContext';
import { useAuth } from '../context/AuthContext';
import GuidanceDisplayPanel from '../components/GuidanceDisplayPanel';

// Tunnel locations with descriptions
const tunnelLocations: Record<string, {name: string}> = {
  'TUN001': { name: 'Manama, Al Fateh Highway' },
  'TUN002': { name: 'Busaiteen, Diplomatic Area' },
  'TUN003': { name: 'Tubli Bay, Central Region' },
  'TUN004': { name: 'North Manama, King Faisal Highway' },
  'TUN005': { name: 'Muharraq Island, Eastern Coast' },
  'TUN006': { name: 'Sitra Island, Causeway Entrance' },
  'TUN007': { name: 'Manama Bay, Coastal Highway' },
};

// Define flood thresholds for each tunnel
const floodThresholds: Record<string, string> = {
  'TUN001': '85% water level',
  'TUN002': '75% water level',
  'TUN003': '80% water level',
  'TUN004': '70% water level',
  'TUN005': '90% water level',
  'TUN006': '60% water level',
  'TUN007': '65% water level',
};

const TunnelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { getTunnel, deleteTunnel, updateTunnel, toggleBarrier } = useTunnels();
  const { userRole, hasPermission } = useAuth();

  const [tunnel, setTunnel] = useState(getTunnel(id));
  const [isEditing, setIsEditing] = useState(false);
  const [tunnelName, setTunnelName] = useState(tunnel?.name || '');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [showCloseRequestModal, setShowCloseRequestModal] = useState(false);
  const [closeRequestMessage, setCloseRequestMessage] = useState('');

  // State variables for the component

  const tunnelNotFound = (
    <div className="container py-5 text-center">
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Tunnel Not Found</h4>
        <p>The tunnel with ID {id} could not be found.</p>
      </div>
      <Link href="/tunnels">
        <button className="btn btn-primary">
          <FaArrowLeft className="me-2" /> Return to Tunnels
        </button>
      </Link>
    </div>
  );

  useEffect(() => {
    setTunnel(getTunnel(id));
    if (tunnel) {
      setTunnelName(tunnel.name);
    }
  }, [id, getTunnel, tunnel]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteTunnel(id);
      navigate('/tunnels');
    } catch (error) {
      console.error('Error deleting tunnel:', error);
    }
  }, [id, deleteTunnel, navigate]);

  const saveName = useCallback(async () => {
    if (!tunnel) return;
    try {
      await updateTunnel(id, { name: tunnelName });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating tunnel name:', error);
    }
  }, [id, tunnelName, updateTunnel, tunnel]);

  const handleToggleBarrier = useCallback(async () => {
    try {
      await toggleBarrier(id);
    } catch (error) {
      console.error('Error toggling barrier status:', error);
    }
  }, [id, toggleBarrier]);

  const { user } = useAuth();

  const handleCloseRequest = useCallback(async () => {
    if (!tunnel || !closeRequestMessage.trim() || !user) return;

    try {
      const response = await fetch('/api/closure-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tunnelId: tunnel.id,
          requestedById: user.id,
          message: closeRequestMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit closure request');
      }

      // Success message
      alert(`Your request to close ${tunnel.name} has been submitted and will be reviewed by the Traffic Department.`);

      // Reset form and close modal
      setShowCloseRequestModal(false);
      setCloseRequestMessage('');
    } catch (error) {
      console.error('Error submitting tunnel closure request:', error);
      alert(`Failed to submit request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [tunnel, closeRequestMessage, user]);

  const getRiskLevelBadgeClass = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-danger';
      case 'Moderate': return 'bg-warning text-dark';
      case 'Low': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  const renderRiskLabelClass = (risk: string) => {
    switch (risk) {
      case 'High': return 'text-danger';
      case 'Moderate': return 'text-warning';
      case 'Low': return 'text-success';
      default: return 'text-secondary';
    }
  };

  const getBarrierStatusClass = (status: string) => {
    return status === 'Open' ? 'text-success' : 'text-danger';
  };

  const handleCloseRequestModalOpen = () => {
    setShowCloseRequestModal(true);
  };

  const handleCloseRequestModalClose = () => {
    setShowCloseRequestModal(false);
    setCloseRequestMessage('');
  };

  return (
    !tunnel ? (
      tunnelNotFound
    ) : (
      <>
        <div className="tunnel-header mb-5 rounded-4 p-4 position-relative overflow-hidden" 
          style={{ 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}>
          <div className="position-absolute tunnel-bg-pattern"></div>

          <div className="row align-items-center position-relative z-index-1">
            <div className="col-lg-8">
              {isEditing ? (
                <div className="d-flex gap-2 align-items-center w-100">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    value={tunnelName}
                    onChange={(e) => setTunnelName(e.target.value)}
                  />
                  <button className="btn btn-success px-4" onClick={saveName}>Save</button>
                  <button className="btn btn-light px-3" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  <h1 className="display-5 text-white fw-bold mb-2 d-flex align-items-center">
                    <FaRoad className="me-3" /> {tunnel.name}
                    {hasPermission(['admin', 'ministry', 'traffic']) && (
                      <button 
                        className="btn btn-sm btn-light ms-3 d-flex align-items-center" 
                        onClick={() => setIsEditing(true)}
                        title="Edit Tunnel Name"
                      >
                        <FaEdit className="me-1" /> Edit
                      </button>
                    )}
                  </h1>
                  <p className="text-white opacity-75 lead mb-0">
                    <FaMapMarkerAlt className="me-2" />
                    {tunnelLocations[tunnel.id]?.name || 'Unknown Location'}
                  </p>
                </>
              )}
            </div>
            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <div className={`risk-level-indicator rounded-pill px-4 py-3 d-inline-flex align-items-center ${getRiskLevelBadgeClass(tunnel.riskLevel)}`}>
                <FaExclamationTriangle className="me-2" size={20} />
                <span className="fw-semibold fs-5">{tunnel.riskLevel} Risk Level</span>
              </div>
              <div className="mt-3">
                {hasPermission(['admin', 'ministry', 'traffic']) ? (
                  <button 
                    className={`btn ${tunnel.barrierStatus === 'Open' ? 'btn-success' : 'btn-danger'} px-4 py-2 fw-semibold`}
                    onClick={handleToggleBarrier}
                  >
                    {tunnel.barrierStatus === 'Open' ? (
                      <><FaLockOpen className="me-2" /> Barrier Open</>
                    ) : (
                      <><FaLock className="me-2" /> Barrier Closed</>
                    )}
                  </button>
                ) : (
                  <div className={`barrier-status-indicator px-4 py-2 rounded-pill d-inline-flex align-items-center ${tunnel.barrierStatus === 'Open' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                    {tunnel.barrierStatus === 'Open' ? (
                      <><FaLockOpen className="me-2" /> Barrier Status: Open</>
                    ) : (
                      <><FaLock className="me-2" /> Barrier Status: Closed</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column - Details and Map */}
          <div className="col-lg-8">
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden mb-4">
              <div className="card-header bg-primary text-white p-3 d-flex align-items-center">
                <FaInfoCircle className="me-2" size={18} />
                <h4 className="mb-0 fw-bold">Tunnel Details</h4>
              </div>
              <div className="card-body p-4">
                <div className="row g-4 mb-4">
                  <div className="col-md-6">
                    <div className="tunnel-detail-card border rounded-4 p-3 h-100 d-flex align-items-center">
                      <div className="tunnel-detail-icon rounded-circle fs-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center me-3">
                        <FaShieldAlt />
                      </div>
                      <div>
                        <h6 className="text-muted fs-6 mb-1">ID</h6>
                        <p className="fs-5 fw-bold mb-0">{tunnel.id}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tunnel-detail-card border rounded-4 p-3 h-100 d-flex align-items-center">
                      <div className="tunnel-detail-icon rounded-circle fs-3 bg-warning-subtle text-warning d-flex align-items-center justify-content-center me-3">
                        <FaWater />
                      </div>
                      <div>
                        <h6 className="text-muted fs-6 mb-1">Flood Threshold</h6>
                        <p className="fs-5 fw-bold mb-0">{floodThresholds[tunnel.id]}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tunnel-detail-card border rounded-4 p-3 h-100 d-flex align-items-center">
                      <div className="tunnel-detail-icon rounded-circle fs-3 bg-success-subtle text-success d-flex align-items-center justify-content-center me-3">
                        <FaCalendarAlt />
                      </div>
                      <div>
                        <h6 className="text-muted fs-6 mb-1">Last Updated</h6>
                        <p className="fs-5 fw-bold mb-0">{new Date(tunnel.lastUpdate).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="tunnel-detail-card border rounded-4 p-3 h-100 d-flex align-items-center">
                      <div className="tunnel-detail-icon rounded-circle fs-3 bg-info-subtle text-info d-flex align-items-center justify-content-center me-3">
                        <FaMicrochip />
                      </div>
                      <div>
                        <h6 className="text-muted fs-6 mb-1">Sensor Count</h6>
                        <p className="fs-5 fw-bold mb-0">{tunnel.sensors ? Object.keys(tunnel.sensors).length : 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <h5 className="fw-bold mb-3">Tunnel Location</h5>
                <div className="tunnel-map-container rounded-4 overflow-hidden mb-4">
                  {tunnel.mapEmbedHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: tunnel.mapEmbedHtml }} />
                  ) : (
                    <div className="alert alert-secondary p-4 text-center">
                      <FaMapMarkerAlt className="fs-2 mb-3" />
                      <h5>No location map available</h5>
                      <p className="mb-0">Map location for this tunnel has not been provided.</p>
                    </div>
                  )}
                </div>

                <div className="d-flex justify-content-between mt-5 gap-3">
                  <Link href={`/tunnel/${tunnel.id}/sensors`}>
                    <button className="btn btn-gradient-primary px-4 py-2 fw-semibold d-flex align-items-center">
                      <FaMicrochip className="me-2" /> View Sensors
                    </button>
                  </Link>
                  {hasPermission(['admin']) && (
                    <button 
                      className="btn btn-outline-danger px-4 py-2 fw-semibold d-flex align-items-center" 
                      onClick={() => setShowConfirmDelete(true)}
                    >
                      <FaTrashAlt className="me-2" /> Delete Tunnel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Actions */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            {/* Quick Stats Card */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden">
              <div className="card-header bg-info text-white p-3 d-flex align-items-center">
                <FaHistory className="me-2" size={18} />
                <h4 className="mb-0 fw-bold">Live Statistics</h4>
              </div>
              <div className="card-body p-4">
                {tunnel.sensors && (
                  <>
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaTemperatureHigh className="text-danger me-2" /> Temperature
                        </h6>
                        <span className="fw-bold fs-5">{tunnel.sensors.temperature || 0}°C</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-danger rounded-pill" 
                          style={{ width: `${((tunnel.sensors.temperature || 0) / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaTint className="text-primary me-2" /> Humidity
                        </h6>
                        <span className="fw-bold fs-5">{tunnel.sensors.humidity || 0}%</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-primary rounded-pill" 
                          style={{ width: `${tunnel.sensors.humidity || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaCloudRain className="text-info me-2" /> Rainfall
                        </h6>
                        <span className="fw-bold fs-5">{tunnel.sensors.rainfall || 0} mm <small>({tunnel.sensors.rainfallDuration || '00:00:00'})</small></span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-info rounded-pill" 
                          style={{ width: `${((tunnel.sensors.rainfall || 0) / 20) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaTachometerAlt className="text-primary me-2" /> Rainfall Intensity
                        </h6>
                        <span className="fw-bold fs-5">{tunnel.sensors.rainfallIntensity || 0} mm/hr</span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div 
                          className="progress-bar bg-primary rounded-pill" 
                          style={{ width: `${((tunnel.sensors.rainfallIntensity || 0) / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-0">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0 d-flex align-items-center">
                          <FaWater className="text-warning me-2" /> Water Level
                        </h6>
                        <span className={`fw-bold fs-5 ${
                          (tunnel.sensors.waterLevel || 0) > 750 ? 'text-danger' : 
                          (tunnel.sensors.waterLevel || 0) > 400 ? 'text-warning' : 'text-success'
                        }`}>
                          {tunnel.sensors.waterLevel || 0} mm
                        </span>
                      </div>
                      <div className="progress rounded-pill" style={{ height: '10px' }}>
                        <div 
                          className={`progress-bar rounded-pill ${
                            (tunnel.sensors.waterLevel || 0) > 750 ? 'bg-danger' : 
                            (tunnel.sensors.waterLevel || 0) > 400 ? 'bg-warning' : 'bg-success'
                          }`}
                          style={{ width: `${Math.min(((tunnel.sensors.waterLevel || 0) / 1500) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Traffic Guidance Display - Only visible to Traffic Officers */}
            {hasPermission(['admin', 'traffic']) && (
              <GuidanceDisplayPanel tunnelId={id} userId={user?.id || 1} />
            )}

            {/* Request Close Button Card */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden">
              <div className="card-header bg-danger text-white p-3 d-flex align-items-center">
                <FaBell className="me-2" size={18} />
                <h4 className="mb-0 fw-bold">Emergency Actions</h4>
              </div>
              <div className="card-body p-4">
                <p className="mb-4">
                  If you observe dangerous conditions in this tunnel, you can request an immediate closure. 
                  Your request will be reviewed by the Traffic Department.
                </p>
                <button 
                  className="btn btn-danger w-100 py-3 fw-semibold d-flex align-items-center justify-content-center"
                  onClick={handleCloseRequestModalOpen}
                >
                  <FaLock className="me-2" /> Request to Close Tunnel
                </button>
              </div>
            </div>

            {/* Back to List Card */}
            <div className="card border-0 rounded-4 shadow-sm overflow-hidden">
              <div className="card-body p-4">
                <Link href="/tunnels">
                  <button className="btn btn-outline-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center">
                    <FaArrowLeft className="me-2" /> Back to Tunnel List
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaExclamationTriangle className="me-2" /> Delete Tunnel
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Are you sure you want to delete <strong>{tunnel.name}</strong>?</p>
            <p className="mb-0">This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Tunnel
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Close Request Modal */}
        <Modal show={showCloseRequestModal} onHide={handleCloseRequestModalClose} centered>
          <Modal.Header closeButton>
            <Modal.Title className="text-danger">
              <FaLock className="me-2" /> Request Tunnel Closure
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>You are requesting the closure of <strong>{tunnel.name}</strong> due to safety concerns.</p>
            <Form.Group className="mb-3">
              <Form.Label>Please describe the emergency situation:</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4} 
                value={closeRequestMessage}
                onChange={(e) => setCloseRequestMessage(e.target.value)}
                placeholder="E.g., Heavy flooding near the tunnel entrance, visibility issues due to smoke, etc."
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseRequestModalClose}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleCloseRequest}>
              Submit Request
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    )
  );
};

export default TunnelDetail;