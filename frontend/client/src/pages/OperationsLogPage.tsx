import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Form, Button, Spinner, Alert, Tab, Tabs } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/PageLayout';
import HardwareImpactPanel from '../components/HardwareImpactPanel';
import { Clock, Filter, User, Database, AlertTriangle, Activity, Tag, Info } from 'lucide-react';

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
  hardwareImpact: any;
  ipAddress: string | null;
  userAgent: string | null;
}

const OperationsLogPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [activeTab, setActiveTab] = useState('logs');

  // Check if user has permission to view operations logs
  const canViewLogs = hasPermission(['admin', 'traffic', 'ministry']);

  // Fetch operations logs
  const { data: operationsLogs, isLoading, error } = useQuery<OperationsLog[]>({
    queryKey: ['/api/operations-logs'],
    queryFn: async () => {
      const response = await fetch('/api/operations-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch operations logs');
      }
      return response.json();
    },
    enabled: canViewLogs
  });

  // Fetch users for filter dropdown
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return response.json();
    },
    enabled: canViewLogs
  });

  // Filter logs based on user selections
  const filteredLogs = React.useMemo(() => {
    if (!operationsLogs) return [];
    
    return operationsLogs.filter(log => {
      // Filter by category if selected
      if (categoryFilter && log.category !== categoryFilter) {
        return false;
      }
      
      // Filter by user if selected
      if (userFilter && log.userId.toString() !== userFilter) {
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
      
      return true;
    });
  }, [operationsLogs, categoryFilter, userFilter, dateRange]);

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    if (!operationsLogs) return [];
    const uniqueCategories = new Set<string>();
    operationsLogs?.forEach(log => {
      if (log.category) uniqueCategories.add(log.category);
    });
    return Array.from(uniqueCategories);
  }, [operationsLogs]);

  if (!canViewLogs) {
    return (
      <Container fluid className="py-4">
        <Alert variant="warning">
          <AlertTriangle className="me-2" size={20} />
          You don't have permission to view operations logs.
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <h1 className="h3 mb-4">System Operations Logs</h1>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'logs')}
        className="mb-4"
      >
        <Tab eventKey="logs" title="Operations Logs">
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <div className="d-flex align-items-center">
                <Activity className="me-2 text-primary" />
                <h5 className="mb-0">System Activity Logs</h5>
              </div>
            </Card.Header>
            
            <Card.Body>
              {/* Filters section */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center mb-2">
                  <Filter size={18} className="me-2 text-secondary" />
                  <h6 className="mb-0">Filter Logs</h6>
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
                      <Form.Label>User</Form.Label>
                      <Form.Select 
                        value={userFilter} 
                        onChange={(e) => setUserFilter(e.target.value)}
                      >
                        <option value="">All Users</option>
                        {users?.map((user: { id: number, fullName: string }) => (
                          <option key={user.id} value={user.id}>{user.fullName}</option>
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
                </div>
              </div>
              
              {isLoading ? (
                <div className="d-flex justify-content-center my-5">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </div>
              ) : error ? (
                <Alert variant="danger">
                  <AlertTriangle className="me-2" size={20} />
                  Error loading operations logs: {(error as Error).message}
                </Alert>
              ) : filteredLogs.length > 0 ? (
                <Table responsive hover className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Category</th>
                      <th>Entity ID</th>
                      <th>Hardware Impact</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => {
                      // Find user name
                      const userName = users?.find((u: { id: number, fullName: string }) => u.id === log.userId)?.fullName || 'Unknown User';
                      
                      // Format date
                      const date = new Date(log.timestamp);
                      const formattedDate = date.toLocaleString();
                      
                      // Determine hardware impact
                      const impactLevel = log.hardwareImpact?.impactLevel;
                      const hasHardwareImpact = impactLevel && Object.keys(log.hardwareImpact).length > 0;
                      
                      return (
                        <tr key={log.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <Clock size={16} className="me-1 text-muted" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <User size={16} className="me-1 text-muted" />
                              <span>{userName}</span>
                            </div>
                          </td>
                          <td>{log.action}</td>
                          <td>
                            <Badge bg={
                              log.category === 'user' ? 'info' :
                              log.category === 'tunnel' ? 'primary' :
                              log.category === 'sensor' ? 'warning' :
                              log.category === 'closure' ? 'danger' : 'secondary'
                            }>
                              {log.category}
                            </Badge>
                          </td>
                          <td>
                            {log.entityId ? (
                              <div className="d-flex align-items-center">
                                <Database size={16} className="me-1 text-muted" />
                                <span>{log.entityId}</span>
                              </div>
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                          <td>
                            {hasHardwareImpact ? (
                              <Badge bg={
                                impactLevel === 'critical' ? 'danger' :
                                impactLevel === 'high' ? 'warning' :
                                impactLevel === 'medium' ? 'info' : 'success'
                              }>
                                {impactLevel}
                              </Badge>
                            ) : (
                              <span className="text-muted">None</span>
                            )}
                          </td>
                          <td>
                            <Button size="sm" variant="outline-secondary">
                              <Info size={14} className="me-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info">
                  No operations logs found with the selected filters.
                </Alert>
              )}
              </Card.Body>
            </Card>
          </Tab>
          
          <Tab eventKey="hardware" title="Hardware Impact Monitoring">
            <HardwareImpactPanel />
          </Tab>
        </Tabs>
      </Container>
  );
};

export default OperationsLogPage;