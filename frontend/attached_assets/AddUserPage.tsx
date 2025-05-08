import React, { useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../context/UserContext';

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { addUser } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'user',
    status: 'active'
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const newUser = {
        id: Date.now().toString(),
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        createdAt: new Date().toISOString()
      };
      
      await addUser(newUser);
      navigate('/users');
    } catch (err) {
      setError('Failed to create user. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Add New User</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col} md="6">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.fullName}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.fullName}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md="6">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.password}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.password}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md="6">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.confirmPassword}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.confirmPassword}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md="6">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group as={Col} md="6">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mb-4">
              <Form.Group as={Col} md="6">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Form.Select>
              </Form.Group>
            </Row>

            <div className="d-flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/users')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddUserPage; 