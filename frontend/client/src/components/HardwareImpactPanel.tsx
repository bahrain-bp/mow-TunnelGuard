import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Table, Badge, Button, Form } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, Filter, AlertTriangle, Activity, Cpu, Clock, Calendar } from 'lucide-react';

// Define type for hardware impact data
interface HardwareImpact {
  deviceId?: string;
  componentName?: string;
  impactLevel?: 'low' | 'medium' | 'high' | 'critical';
  wearPercentage?: number;
  estimatedLifespan?: string;
  maintenanceRecommendation?: string;
  lastMaintenance?: string;
  nextScheduledMaintenance?: string;
  operationCount?: number;
}

interface OperationsLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  category: string;
  details: any;
  entityId: string | null;
  timestamp: Date;
  environmentData: any;
  hardwareImpact: HardwareImpact;
  ipAddress: string | null;
  userAgent: string | null;
}

// Hardware Impact Panel Component
const HardwareImpactPanel: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [showOnlyHighImpact, setShowOnlyHighImpact] = useState(false);

  // Check if user has permission to view the hardware impact panel
  const canViewHardwareImpact = hasPermission(['admin', 'traffic', 'ministry']);

  // Fetch operations logs with hardware impact data
  const { data: operationsLogs, isLoading, error } = useQuery<OperationsLog[]>({
    queryKey: ['/api/operations-logs'],
    queryFn: async () => {
      const response = await fetch('/api/operations-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch operations logs');
      }
      return response.json();
    },
    enabled: canViewHardwareImpact
  });

  // Filter logs based on user selections
  const filteredLogs = React.useMemo(() => {
    if (!operationsLogs) return [];
    
    return operationsLogs.filter(log => {
      // Filter by category if selected
      if (categoryFilter && log.category !== categoryFilter) {
        return false;
      }
      
      // Filter by date range if provided
      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate);
        const logDate = new Date(log.timestamp);
        if (logDate < startDate) return false;
      }
      
      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate);
        const logDate = new Date(log.timestamp);
        if (logDate > endDate) return false;
      }
      
      // Filter by impact level if selected
      if (showOnlyHighImpact) {
        const impactLevel = log.hardwareImpact?.impactLevel;
        if (!impactLevel || (impactLevel !== 'high' && impactLevel !== 'critical')) {
          return false;
        }
      }
      
      // Only include logs that have hardware impact data
      return !!log.hardwareImpact && Object.keys(log.hardwareImpact).length > 0;
    });
  }, [operationsLogs, categoryFilter, dateRange, showOnlyHighImpact]);

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    if (!operationsLogs) return [];
    const uniqueCategories = new Set<string>();
    operationsLogs.forEach(log => {
      if (log.category) uniqueCategories.add(log.category);
    });
    return Array.from(uniqueCategories);
  }, [operationsLogs]);

  if (!canViewHardwareImpact) {
    return (
      <Alert variant="warning">
        <AlertTriangle className="me-2" size={20} />
        You don't have permission to view hardware impact data.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <AlertTriangle className="me-2" size={20} />
        Error loading hardware impact data: {(error as Error).message}
      </Alert>
    );
  }

  // Calculate the hardware component with the highest impact for preemptive maintenance alert
  const criticalComponents = filteredLogs.filter(
    log => log.hardwareImpact?.impactLevel === 'critical'
  );

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <Cpu className="me-2 text-primary" />
          <h5 className="mb-0">Hardware Impact Monitoring</h5>
        </div>
        {criticalComponents.length > 0 && (
          <Badge bg="danger" className="py-2 px-3">
            <AlertTriangle size={14} className="me-1" /> 
            {criticalComponents.length} Critical Item{criticalComponents.length > 1 ? 's' : ''}
          </Badge>
        )}
      </Card.Header>
      
      <Card.Body>
        {/* Filters section */}
        <div className="mb-4 p-3 bg-light rounded">
          <div className="d-flex align-items-center mb-2">
            <Filter size={18} className="me-2 text-secondary" />
            <h6 className="mb-0">Filter Hardware Impact Data</h6>
          </div>
          <div className="row g-3">
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  value={categoryFilter} 
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                />
              </Form.Group>
            </div>
            <div className="col-md-3">
              <Form.Group className="h-100 d-flex align-items-end">
                <Form.Check 
                  type="switch"
                  id="highImpactSwitch"
                  label="Show only high/critical impact"
                  checked={showOnlyHighImpact}
                  onChange={(e) => setShowOnlyHighImpact(e.target.checked)}
                  className="mt-2"
                />
              </Form.Group>
            </div>
          </div>
        </div>
        
        {/* Preemptive maintenance alerts */}
        {criticalComponents.length > 0 && (
          <Alert variant="danger" className="mb-4">
            <div className="d-flex align-items-start">
              <AlertTriangle size={24} className="me-3 mt-1" />
              <div>
                <h6 className="fw-bold mb-2">Preemptive Maintenance Required</h6>
                <p className="mb-2">The following components require immediate attention:</p>
                <ul className="mb-0">
                  {criticalComponents.slice(0, 3).map(log => (
                    <li key={log.id}>
                      <strong>{log.hardwareImpact.componentName || 'Unknown Component'}</strong>: 
                      {log.hardwareImpact.maintenanceRecommendation || ' Maintenance required'}
                      {log.hardwareImpact.wearPercentage && 
                        ` (${log.hardwareImpact.wearPercentage}% wear)`}
                    </li>
                  ))}
                  {criticalComponents.length > 3 && (
                    <li>...and {criticalComponents.length - 3} more component(s)</li>
                  )}
                </ul>
              </div>
            </div>
          </Alert>
        )}
        
        {/* Hardware impact table */}
        {filteredLogs.length > 0 ? (
          <Table responsive hover className="align-middle">
            <thead className="bg-light">
              <tr>
                <th>Component</th>
                <th>Action</th>
                <th>Impact Level</th>
                <th>Wear %</th>
                <th>Maintenance</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td>
                    <div className="fw-medium">{log.hardwareImpact.componentName || 'N/A'}</div>
                    <div className="text-muted small">{log.hardwareImpact.deviceId || ''}</div>
                  </td>
                  <td>{log.action}</td>
                  <td>
                    <Badge bg={
                      log.hardwareImpact.impactLevel === 'critical' ? 'danger' :
                      log.hardwareImpact.impactLevel === 'high' ? 'warning' :
                      log.hardwareImpact.impactLevel === 'medium' ? 'info' : 'success'
                    } className="py-2 px-3">
                      {log.hardwareImpact.impactLevel || 'low'}
                    </Badge>
                  </td>
                  <td>
                    {log.hardwareImpact.wearPercentage ? (
                      <div className="d-flex align-items-center">
                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                          <div 
                            className={`progress-bar ${
                              log.hardwareImpact.wearPercentage > 75 ? 'bg-danger' :
                              log.hardwareImpact.wearPercentage > 50 ? 'bg-warning' : 'bg-success'
                            }`}
                            style={{ width: `${log.hardwareImpact.wearPercentage}%` }}
                          />
                        </div>
                        <span className="ms-2 small">{log.hardwareImpact.wearPercentage}%</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {log.hardwareImpact.nextScheduledMaintenance ? (
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="me-1 text-muted" />
                        <span>{new Date(log.hardwareImpact.nextScheduledMaintenance).toLocaleDateString()}</span>
                      </div>
                    ) : (
                      'Not scheduled'
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Clock size={16} className="me-1 text-muted" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <Button size="sm" variant="outline-primary">
                      <Activity size={14} className="me-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <Alert variant="info">
            No hardware impact data found with the selected filters.
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default HardwareImpactPanel;