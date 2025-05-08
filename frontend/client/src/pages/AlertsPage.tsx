import React, { useState } from 'react';
import { FaExclamationTriangle, FaEye } from 'react-icons/fa';
import { Link } from 'wouter';
import PageWrapper from '../components/PageWrapper';

// Mock data for alerts
const mockAlerts = [
  {
    id: 'ALT001',
    createdAt: new Date('2024-06-10T14:25:30'),
    tunnelId: 'TUN001',
    alertType: 'High',
    sensorReading: '78%',
    sensorId: 'WL-SENSOR-001'
  },
  {
    id: 'ALT002',
    createdAt: new Date('2024-06-10T14:15:22'),
    tunnelId: 'TUN004',
    alertType: 'High',
    sensorReading: '85%',
    sensorId: 'WL-SENSOR-004'
  },
  {
    id: 'ALT003',
    createdAt: new Date('2024-06-10T13:55:43'),
    tunnelId: 'TUN002',
    alertType: 'Moderate',
    sensorReading: '45%',
    sensorId: 'WL-SENSOR-002'
  }
];

const AlertsPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter alerts based on search query
  const filteredAlerts = mockAlerts.filter(alert => 
    alert.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.tunnelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    alert.alertType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAlerts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAlerts = filteredAlerts.slice(indexOfFirstItem, indexOfLastItem);

  // Get alert badge class based on alert type
  const getAlertBadgeClass = (alertType: string) => {
    switch (alertType) {
      case 'High':
        return 'bg-danger';
      case 'Moderate':
        return 'bg-warning';
      case 'Low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  return (
    <PageWrapper>
      <div className="container py-4">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h4 className="mb-0">
              <FaExclamationTriangle className="me-2" />
              Alert Management
            </h4>
          </div>
          <div className="card-body">
            {/* Search Box */}
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="position-relative">
                  <div className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search text-muted" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                  </div>
                  <input 
                    type="text" 
                    className="form-control ps-5" 
                    placeholder="Search alerts by ID, tunnel, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Alerts Table */}
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="bg-primary text-light">
                  <tr>
                    <th>Alert ID</th>
                    <th>Created At</th>
                    <th>Tunnel ID</th>
                    <th>Alert Type</th>
                    <th>Sensor Reading</th>
                    <th>Sensor ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentAlerts.length > 0 ? (
                    currentAlerts.map(alert => (
                      <tr key={alert.id}>
                        <td><strong>{alert.id}</strong></td>
                        <td>{alert.createdAt.toLocaleString()}</td>
                        <td>{alert.tunnelId}</td>
                        <td>
                          <span className={`badge ${getAlertBadgeClass(alert.alertType)}`}>
                            {alert.alertType}
                          </span>
                        </td>
                        <td>{alert.sensorReading}</td>
                        <td>{alert.sensorId}</td>
                        <td>
                          <Link href={`/tunnel/${alert.tunnelId}`}>
                            <button className="btn btn-sm btn-primary">
                              <FaEye className="me-1" /> View Tunnel
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-3">
                        No alerts found matching your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="d-flex justify-content-center mt-4">
                <ul className="pagination">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      aria-label="Previous"
                    >
                      &laquo;
                    </button>
                  </li>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                    <li 
                      key={pageNumber} 
                      className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
                    >
                      <button 
                        className="page-link" 
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    </li>
                  ))}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      aria-label="Next"
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default AlertsPage;