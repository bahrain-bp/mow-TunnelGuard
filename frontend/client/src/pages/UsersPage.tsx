import React from 'react';
import { useLocation } from 'wouter';
import { Container, Table, Button, Badge, Card } from 'react-bootstrap';
import { FaEdit, FaPlus } from 'react-icons/fa';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useUsers } from '../context/UserContext';

const UsersPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { users, loading, error } = useUsers();
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'suspended':
        return 'danger';
      default:
        return 'primary';
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'manager':
        return 'warning';
      case 'user':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      <main className="flex-grow-1 bg-light">
        <Container className="py-4">
          <Card>
            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
              <h4 className="mb-0">User Management</h4>
              <Button 
                variant="success" 
                size="sm" 
                onClick={() => navigate('/users/add')}
              >
                <FaPlus className="me-1" /> Add User
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading users...</span>
                  </div>
                  <p className="mt-2">Loading users...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.fullName}</td>
                          <td>{user.email}</td>
                          <td>{user.phone}</td>
                          <td>{user.department}</td>
                          <td>
                            <Badge bg={getRoleBadgeVariant(user.role)}>
                              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={getBadgeVariant(user.status)}>
                              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                            </Badge>
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/user-management/${user.id}`)}
                            >
                              <FaEdit className="me-1" /> Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-3">
                          No users found. Add a user to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Container>
      </main>
      
      <Footer />
    </div>
  );
};

export default UsersPage;
