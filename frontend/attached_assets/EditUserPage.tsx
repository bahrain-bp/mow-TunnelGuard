import React, { useEffect, useState } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '../context/UserContext';

const EditUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const { getUser, updateUser, deleteUser } = useUsers();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: '',
    status: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setError('User ID is missing');
        setLoading(false);
        return;
      }

      try {
        const user = await getUser(userId);
        if (!user) {
          setError('User not found');
          return;
        }

        setFormData({
          fullName: user.fullName,
          email: user.email,
          password: '',
          confirmPassword: '',
          phone: user.phone,
          role: user.role,
          status: user.status
        });
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, getUser]);

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
    
    // Only validate password if user is trying to change it
    if (formData.password) {
      if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userId) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      // Only include password if it was changed
      const userData = {
        id: userId,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        status: formData.status,
        ...(formData.password ? { password: formData.password } : {})
      };
      
      await updateUser(userData);
      navigate('/users');
    } catch (err) {
      setError('Failed to update user. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId || !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    
    setDeleting(true);
    setError(null);
    
    try {
      await deleteUser(userId);
      navigate('/users');
    } catch (err) {
      setError('Failed to delete user. Please try again.');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Edit User</h4>
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
                <Form.Label>New Password (leave blank to keep current)</Form.Label>
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
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!validationErrors.confirmPassword}
                  disabled={!formData.password}
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

            <div className="d-flex justify-content-between">
              <div>
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/users')}
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
              
              <div>
                {showDeleteConfirm ? (
                  <Alert variant="danger" className="d-flex align-items-center p-2 mb-0">
                    <span className="me-2">Are you sure?</span>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="me-2"
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting...' : 'Confirm'}
                    </Button>
                  </Alert>
                ) : (
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    Delete User
                  </Button>
                )}
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditUserPage; 