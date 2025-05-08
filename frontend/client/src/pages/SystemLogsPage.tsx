import React, { useState, useEffect } from 'react';
import { FaSearch, FaCalendarAlt, FaFilter, FaDownload, FaTrash, FaExclamationTriangle, FaInfoCircle, FaBug, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';

interface LogEntry {
  id: number;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'debug';
  source: string;
  message: string;
  details?: string;
}

const SystemLogsPage: React.FC = () => {
  const { hasPermission } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const logsPerPage = 15;
  
  // Sample log data - in a real app, this would come from an API
  useEffect(() => {
    // Mock logs data for demonstration
    const mockLogs: LogEntry[] = [
      {
        id: 1,
        timestamp: new Date('2024-04-28T08:30:15'),
        level: 'info',
        source: 'system',
        message: 'System started successfully',
        details: 'All system modules initialized. Database connection established.'
      },
      {
        id: 2,
        timestamp: new Date('2024-04-28T09:15:22'),
        level: 'warning',
        source: 'sensors',
        message: 'Sensor TUN001-S03 reporting delayed readings',
        details: 'Latency increased to 2500ms. Network conditions may be affecting sensor connectivity.'
      },
      {
        id: 3,
        timestamp: new Date('2024-04-28T10:22:48'),
        level: 'error',
        source: 'database',
        message: 'Failed to update user record',
        details: 'Error: Duplicate entry for key \'PRIMARY\'. Transaction rolled back.'
      },
      {
        id: 4,
        timestamp: new Date('2024-04-28T11:05:33'),
        level: 'debug',
        source: 'api',
        message: 'API request received: GET /api/tunnels',
        details: 'Request params: { filter: \'active\', sort: \'name\' }. Response time: 125ms.'
      },
      {
        id: 5,
        timestamp: new Date('2024-04-28T11:30:19'),
        level: 'info',
        source: 'users',
        message: 'New user registered: john.doe@example.com',
        details: 'User ID: 1052. Registration completed through web interface.'
      },
      {
        id: 6,
        timestamp: new Date('2024-04-28T13:12:45'),
        level: 'error',
        source: 'sensors',
        message: 'Sensor TUN002-S07 connection lost',
        details: 'Connection timeout after 30 seconds. Sensor status changed to OFFLINE.'
      },
      {
        id: 7,
        timestamp: new Date('2024-04-28T14:00:11'),
        level: 'warning',
        source: 'system',
        message: 'High CPU usage detected',
        details: 'CPU usage at 87% for more than 5 minutes. Background tasks throttled.'
      },
      {
        id: 8,
        timestamp: new Date('2024-04-28T14:30:22'),
        level: 'info',
        source: 'alerts',
        message: 'Water level alert triggered for TUN001',
        details: 'Water level reached 75%. Alert notifications sent to Traffic Department.'
      },
      {
        id: 9,
        timestamp: new Date('2024-04-28T15:45:55'),
        level: 'debug',
        source: 'api',
        message: 'API request completed: POST /api/tunnels/TUN003/sensors',
        details: 'Request body: { type: "water_level", reading: 42 }. Response status: 201.'
      },
      {
        id: 10,
        timestamp: new Date('2024-04-28T16:20:30'),
        level: 'info',
        source: 'system',
        message: 'Scheduled system backup completed',
        details: 'Backup size: 256MB. Stored in cloud storage. Retention: 30 days.'
      },
      {
        id: 11,
        timestamp: new Date('2024-04-28T17:05:12'),
        level: 'warning',
        source: 'database',
        message: 'Database approaching storage limit',
        details: 'Current usage: 85% of allocated storage. Consider cleanup or expansion.'
      },
      {
        id: 12,
        timestamp: new Date('2024-04-28T18:30:45'),
        level: 'info',
        source: 'users',
        message: 'User password reset: admin@tunnelguard.gov',
        details: 'Password reset through admin interface. IP: 192.168.1.145'
      },
      {
        id: 13,
        timestamp: new Date('2024-04-28T19:15:22'),
        level: 'error',
        source: 'api',
        message: 'API rate limit exceeded: 195.244.102.33',
        details: 'Client IP reached 1000 requests in 1 minute. Rate limiting applied for 15 minutes.'
      },
      {
        id: 14,
        timestamp: new Date('2024-04-28T20:00:18'),
        level: 'debug',
        source: 'sensors',
        message: 'Sensor calibration check completed',
        details: 'All sensors within acceptable parameters. Next check scheduled in 24 hours.'
      },
      {
        id: 15,
        timestamp: new Date('2024-04-28T21:10:05'),
        level: 'info',
        source: 'alerts',
        message: 'TUN002 barrier status changed to CLOSED',
        details: 'Action performed by user ID 1005 (traffic_manager). Reason: High water level.'
      },
      {
        id: 16,
        timestamp: new Date('2024-04-28T22:30:11'),
        level: 'error',
        source: 'system',
        message: 'Failed to send email notifications',
        details: 'SMTP connection error. Alerts queued for retry in 15 minutes.'
      },
      {
        id: 17,
        timestamp: new Date('2024-04-28T23:45:33'),
        level: 'warning',
        source: 'database',
        message: 'Slow database query detected',
        details: 'Query execution time: 8.5 seconds. Query ID: 58712. Consider optimization.'
      },
      {
        id: 18,
        timestamp: new Date('2024-04-29T00:15:20'),
        level: 'info',
        source: 'system',
        message: 'Daily system health check completed',
        details: 'All services operational. Database integrity verified.'
      },
      {
        id: 19,
        timestamp: new Date('2024-04-29T07:30:45'),
        level: 'debug',
        source: 'api',
        message: 'API authentication token refreshed',
        details: 'New token issued for service account tunnelguard-sensors. Expires in 24 hours.'
      },
      {
        id: 20,
        timestamp: new Date('2024-04-29T08:00:12'),
        level: 'info',
        source: 'users',
        message: 'User logged in: ministry_admin',
        details: 'Login from IP 192.168.10.55. Browser: Chrome 112. OS: Windows 11.'
      }
    ];
    
    // Sort logs by timestamp (most recent first)
    const sortedLogs = [...mockLogs].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
    
    setLogs(sortedLogs);
    setFilteredLogs(sortedLogs);
  }, []);
  
  // Apply filters when any filter changes
  useEffect(() => {
    let result = [...logs];
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(log => 
        log.message.toLowerCase().includes(query) || 
        log.source.toLowerCase().includes(query) ||
        (log.details && log.details.toLowerCase().includes(query))
      );
    }
    
    // Apply level filter
    if (levelFilter !== 'all') {
      result = result.filter(log => log.level === levelFilter);
    }
    
    // Apply source filter
    if (sourceFilter !== 'all') {
      result = result.filter(log => log.source === sourceFilter);
    }
    
    // Apply date filter
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      result = result.filter(log => 
        log.timestamp.getDate() === filterDate.getDate() &&
        log.timestamp.getMonth() === filterDate.getMonth() &&
        log.timestamp.getFullYear() === filterDate.getFullYear()
      );
    }
    
    setFilteredLogs(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [logs, searchQuery, levelFilter, sourceFilter, dateFilter]);
  
  // Get current logs for pagination
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  
  // Get unique sources for filter dropdown
  const sources = ['all', ...Array.from(new Set(logs.map(log => log.source)))];
  
  // Handle log level icons and colors
  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'info': return <FaInfoCircle className="text-primary" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaTimesCircle className="text-danger" />;
      case 'debug': return <FaBug className="text-secondary" />;
      default: return <FaInfoCircle className="text-primary" />;
    }
  };
  
  const getLevelBadgeClass = (level: string) => {
    switch(level) {
      case 'info': return 'bg-primary';
      case 'warning': return 'bg-warning text-dark';
      case 'error': return 'bg-danger';
      case 'debug': return 'bg-secondary';
      default: return 'bg-primary';
    }
  };
  
  // Download logs as CSV
  const downloadLogs = () => {
    // Create CSV content
    const headers = ['Timestamp', 'Level', 'Source', 'Message', 'Details'];
    const csvRows = [
      headers.join(','),
      ...filteredLogs.map(log => [
        log.timestamp.toISOString(),
        log.level,
        log.source,
        `"${log.message.replace(/"/g, '""')}"`,
        `"${(log.details || '').replace(/"/g, '""')}"`
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Create download link and trigger click
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `system-logs-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // View log details
  const viewLogDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setShowDetails(true);
  };
  
  // Clear logs (would need server-side implementation in real app)
  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
      // In a real app, you would make an API call to clear logs
      setLogs([]);
      setFilteredLogs([]);
    }
  };
  
  // Pagination controls
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <h1 className="mb-3 mb-md-0">System Logs</h1>
        
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary" 
            onClick={downloadLogs}
            title="Download Logs as CSV"
          >
            <FaDownload className="me-2" /> Export
          </button>
          
          {hasPermission('admin') && (
            <button 
              className="btn btn-outline-danger"
              onClick={clearLogs}
              title="Clear All Logs"
            >
              <FaTrash className="me-2" /> Clear Logs
            </button>
          )}
        </div>
      </div>
      
      {/* Filters */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <FaSearch className="text-primary" />
                </div>
                <input 
                  type="text" 
                  className="form-control ps-5" 
                  placeholder="Search logs..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <FaFilter className="text-primary" />
                </div>
                <select 
                  className="form-select ps-5" 
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <FaFilter className="text-primary" />
                </div>
                <select 
                  className="form-select ps-5" 
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                >
                  {sources.map(source => (
                    <option key={source} value={source}>
                      {source === 'all' ? 'All Sources' : source.charAt(0).toUpperCase() + source.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="position-relative">
                <div className="position-absolute top-50 start-0 translate-middle-y ps-3">
                  <FaCalendarAlt className="text-primary" />
                </div>
                <input
                  type="date"
                  className="form-control ps-5"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="card shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Level</th>
                  <th scope="col">Source</th>
                  <th scope="col">Message</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.length > 0 ? (
                  currentLogs.map(log => (
                    <tr key={log.id} onClick={() => viewLogDetails(log)} style={{ cursor: 'pointer' }}>
                      <td className="text-nowrap">{log.timestamp.toLocaleString()}</td>
                      <td>
                        <span className={`badge ${getLevelBadgeClass(log.level)} py-2 px-3`}>
                          {getLevelIcon(log.level)} {log.level.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-capitalize">{log.source}</td>
                      <td className="text-truncate" style={{ maxWidth: '300px' }}>
                        {log.message}
                      </td>
                      <td className="text-end">
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewLogDetails(log);
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No logs found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center py-3">
              <nav aria-label="Logs pagination">
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
            </div>
          )}
        </div>
      </div>
      
      {/* Log Details Modal */}
      {showDetails && selectedLog && (
        <div className="modal fade show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Log Entry Details</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowDetails(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Timestamp:</strong> {selectedLog.timestamp.toLocaleString()}
                </div>
                <div className="mb-3">
                  <strong>Level:</strong>{' '}
                  <span className={`badge ${getLevelBadgeClass(selectedLog.level)} py-2 px-3`}>
                    {getLevelIcon(selectedLog.level)} {selectedLog.level.toUpperCase()}
                  </span>
                </div>
                <div className="mb-3">
                  <strong>Source:</strong> <span className="text-capitalize">{selectedLog.source}</span>
                </div>
                <div className="mb-3">
                  <strong>Message:</strong>
                  <p className="mt-1">{selectedLog.message}</p>
                </div>
                <div className="mb-0">
                  <strong>Details:</strong>
                  <div className="p-3 bg-light rounded mt-2">
                    <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{selectedLog.details || 'No additional details available.'}</pre>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogsPage;