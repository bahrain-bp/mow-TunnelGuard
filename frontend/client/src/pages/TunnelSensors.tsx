import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { FaArrowLeft, FaPlus, FaEdit, FaTrash, FaWater, FaTemperatureLow, FaEye, FaDownload, FaSave, FaTimes, FaFileExport, FaCloudRain, FaTachometerAlt } from 'react-icons/fa';
import PageWrapper from '../components/PageWrapper';

// Define types for sensors and tunnels
interface Sensor {
  id: number;
  tunnelId: string;
  type: 'water_level' | 'air_quality' | 'temperature' | 'structural' | 'traffic' | 'rainfall' | 'rainfall_intensity';
  location: string;
  status: 'active' | 'maintenance' | 'offline';
  lastReading: number;
  unit: string;
  lastUpdate: Date;
  alertThreshold?: number;
  description?: string;
  rainfallDuration?: string;
}

interface Tunnel {
  id: string;
  name: string;
  riskLevel: 'High' | 'Moderate' | 'Low';
  waterLevel: number;
  barrierStatus: 'Open' | 'Closed';
  lastUpdate: Date;
  location?: string;
  length?: number;
  capacity?: number;
  description?: string;
}

const TunnelSensors: React.FC = () => {
  const [, params] = useRoute<{ tunnelId: string }>('/tunnel/:tunnelId/sensors');
  const tunnelId = params?.tunnelId || '';
  
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [tunnel, setTunnel] = useState<Tunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentSensor, setCurrentSensor] = useState<Sensor | null>(null);
  const [formData, setFormData] = useState<Partial<Sensor>>({
    type: 'water_level',
    location: '',
    status: 'active',
    lastReading: 0,
    unit: 'mm',
    alertThreshold: 70,
    description: ''
  });
  
  // Fetch sensors for the selected tunnel
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tunnel data
        const tunnelResponse = await fetch(`/api/tunnels/${tunnelId}`);
        if (!tunnelResponse.ok) {
          throw new Error('Tunnel not found');
        }
        const tunnelData: Tunnel = await tunnelResponse.json();
        setTunnel(tunnelData);
        
        // Fetch sensors for the tunnel
        const sensorsResponse = await fetch(`/api/tunnels/${tunnelId}/sensors`);
        if (!sensorsResponse.ok) {
          throw new Error('Failed to fetch sensors');
        }
        const sensorsData: Sensor[] = await sensorsResponse.json();
        setSensors(sensorsData);
        
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tunnelId]);
  
  const handleEdit = (sensor: Sensor) => {
    setCurrentSensor(sensor);
    setFormData({
      type: sensor.type,
      location: sensor.location,
      status: sensor.status,
      lastReading: sensor.lastReading,
      unit: sensor.unit,
      alertThreshold: sensor.alertThreshold || 70,
      description: sensor.description || ''
    });
    setShowEditModal(true);
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this sensor?')) {
      try {
        const response = await fetch(`/api/sensors/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete sensor');
        }
        
        // Remove the sensor from the state
        setSensors(sensors.filter(sensor => sensor.id !== id));
      } catch (err) {
        alert(err instanceof Error ? err.message : 'An unknown error occurred');
      }
    }
  };
  
  const handleAddSensor = () => {
    setFormData({
      type: 'water_level',
      location: '',
      status: 'active',
      lastReading: 0,
      unit: 'mm',
      alertThreshold: 70,
      description: ''
    });
    setShowAddModal(true);
  };
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'lastReading' || name === 'alertThreshold' ? parseFloat(value) : value
    }));
  };
  
  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newSensor: Sensor = {
        ...formData as any,
        id: 0, // Will be assigned by the server
        tunnelId,
        lastUpdate: new Date()
      };
      
      const response = await fetch('/api/sensors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSensor)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add sensor');
      }
      
      const addedSensor = await response.json();
      setSensors([...sensors, addedSensor]);
      setShowAddModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSensor) return;
    
    try {
      const updatedSensor = {
        ...formData,
        id: currentSensor.id,
        tunnelId: currentSensor.tunnelId,
        lastUpdate: new Date()
      };
      
      const response = await fetch(`/api/sensors/${currentSensor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedSensor)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update sensor');
      }
      
      const updated = await response.json();
      
      // Update the sensors array with the updated sensor
      setSensors(sensors.map(s => s.id === updated.id ? updated : s));
      setShowEditModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  const exportData = () => {
    const dataStr = JSON.stringify(sensors, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `sensors_${tunnelId}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'water_level': return 'Water Level';
      case 'air_quality': return 'Air Quality';
      case 'temperature': return 'Temperature';
      case 'structural': return 'Structural';
      case 'traffic': return 'Traffic';
      case 'rainfall': return 'Rainfall';
      case 'rainfall_intensity': return 'Rainfall Intensity';
      default: return type;
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'maintenance': return 'bg-warning text-dark';
      case 'offline': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };
  
  const getTypeIconClass = (type: string) => {
    switch (type) {
      case 'water_level': return <FaWater className="text-primary" />;
      case 'temperature': return <FaTemperatureLow className="text-danger" />;
      case 'rainfall': return <FaCloudRain className="text-info" />;
      case 'rainfall_intensity': return <FaTachometerAlt className="text-primary" />;
      default: return null;
    }
  };
  
  if (loading) {
    return (
      <PageWrapper>
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }
  
  return (
    <PageWrapper>
      <div className="py-4">
        {/* Header and Breadcrumb */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <div className="d-flex align-items-center mb-3">
              <Link href={`/tunnel/${tunnelId}`}>
                <button className="btn btn-outline-primary me-3">
                  <FaArrowLeft className="me-2" /> Back to Tunnel
                </button>
              </Link>
              <h2 className="mb-0">{tunnel?.name} - Sensors</h2>
            </div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link href="/">Dashboard</Link></li>
                <li className="breadcrumb-item"><Link href="/tunnels">Tunnels</Link></li>
                <li className="breadcrumb-item"><Link href={`/tunnel/${tunnelId}`}>{tunnel?.name || tunnelId}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">Sensors</li>
              </ol>
            </nav>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button className="btn btn-outline-secondary" onClick={exportData}>
              <FaFileExport className="me-2" /> Export Data
            </button>
            <button className="btn btn-primary" onClick={handleAddSensor}>
              <FaPlus className="me-2" /> Add Sensor
            </button>
          </div>
        </div>
        
        {error ? (
          <div className="alert alert-danger">
            {error}
          </div>
        ) : sensors.length === 0 ? (
          <div className="alert alert-info">
            No sensors found for this tunnel. Click "Add Sensor" to add a new sensor.
          </div>
        ) : (
          <div className="row g-4">
            {sensors.map(sensor => (
              <div key={sensor.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <span className="me-2">{getTypeIconClass(sensor.type)}</span>
                      <h5 className="mb-0">{getTypeLabel(sensor.type)}</h5>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(sensor.status)}`}>
                      {sensor.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="text-muted small">ID: {sensor.id}</p>
                    <p className="card-text mb-2">
                      <strong>Location:</strong> {sensor.location}
                    </p>
                    <p className="card-text mb-2">
                      <strong>Last Reading:</strong> {sensor.lastReading} {sensor.unit}
                    </p>
                    <p className="card-text mb-2">
                      <strong>Alert Threshold:</strong> {sensor.alertThreshold || 'N/A'} {sensor.unit}
                    </p>
                    <p className="card-text mb-2">
                      <strong>Last Update:</strong> {new Date(sensor.lastUpdate).toLocaleString()}
                    </p>
                    {sensor.description && (
                      <p className="card-text">
                        <strong>Description:</strong> {sensor.description}
                      </p>
                    )}
                    {sensor.type === 'rainfall' && sensor.rainfallDuration && (
                      <p className="card-text">
                        <strong>Rainfall Duration:</strong> {sensor.rainfallDuration}
                      </p>
                    )}
                  </div>
                  <div className="card-footer d-flex justify-content-between">
                    <button 
                      className="btn btn-outline-primary btn-sm" 
                      onClick={() => handleEdit(sensor)}
                    >
                      <FaEdit className="me-1" /> Edit
                    </button>
                    <button 
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(sensor.id)}
                    >
                      <FaTrash className="me-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Sensor Modal */}
      {showEditModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Sensor</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitEdit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Sensor Type</label>
                    <select 
                      className="form-select" 
                      id="type" 
                      name="type" 
                      value={formData.type} 
                      onChange={handleFormChange}
                    >
                      <option value="water_level">Water Level</option>
                      <option value="air_quality">Air Quality</option>
                      <option value="temperature">Temperature</option>
                      <option value="structural">Structural</option>
                      <option value="traffic">Traffic</option>
                      <option value="rainfall">Rainfall</option>
                      <option value="rainfall_intensity">Rainfall Intensity</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="location" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select 
                      className="form-select" 
                      id="status" 
                      name="status" 
                      value={formData.status} 
                      onChange={handleFormChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="lastReading" className="form-label">Last Reading</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="lastReading" 
                      name="lastReading" 
                      value={formData.lastReading} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">Unit</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="unit" 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="alertThreshold" className="form-label">Alert Threshold</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="alertThreshold" 
                      name="alertThreshold" 
                      value={formData.alertThreshold} 
                      onChange={handleFormChange}
                    />
                  </div>
                  {formData.type === 'rainfall' && (
                    <div className="mb-3">
                      <label htmlFor="rainfallDuration" className="form-label">Rainfall Duration</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="rainfallDuration" 
                        name="rainfallDuration" 
                        value={formData.rainfallDuration || ''} 
                        onChange={handleFormChange}
                        placeholder="e.g. 24h"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="description" 
                      name="description" 
                      value={formData.description || ''} 
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                    <FaTimes className="me-2" /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaSave className="me-2" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Sensor Modal */}
      {showAddModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Sensor</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitAdd}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="type" className="form-label">Sensor Type</label>
                    <select 
                      className="form-select" 
                      id="type" 
                      name="type" 
                      value={formData.type} 
                      onChange={handleFormChange}
                    >
                      <option value="water_level">Water Level</option>
                      <option value="air_quality">Air Quality</option>
                      <option value="temperature">Temperature</option>
                      <option value="structural">Structural</option>
                      <option value="traffic">Traffic</option>
                      <option value="rainfall">Rainfall</option>
                      <option value="rainfall_intensity">Rainfall Intensity</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="location" 
                      name="location" 
                      value={formData.location} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select 
                      className="form-select" 
                      id="status" 
                      name="status" 
                      value={formData.status} 
                      onChange={handleFormChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="offline">Offline</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="lastReading" className="form-label">Last Reading</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="lastReading" 
                      name="lastReading" 
                      value={formData.lastReading} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="unit" className="form-label">Unit</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="unit" 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleFormChange} 
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="alertThreshold" className="form-label">Alert Threshold</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      id="alertThreshold" 
                      name="alertThreshold" 
                      value={formData.alertThreshold} 
                      onChange={handleFormChange}
                    />
                  </div>
                  {formData.type === 'rainfall' && (
                    <div className="mb-3">
                      <label htmlFor="rainfallDuration" className="form-label">Rainfall Duration</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        id="rainfallDuration" 
                        name="rainfallDuration" 
                        value={formData.rainfallDuration || ''} 
                        onChange={handleFormChange}
                        placeholder="e.g. 24h"
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">Description</label>
                    <textarea 
                      className="form-control" 
                      id="description" 
                      name="description" 
                      value={formData.description || ''} 
                      onChange={handleFormChange}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    <FaTimes className="me-2" /> Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <FaSave className="me-2" /> Add Sensor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default TunnelSensors;