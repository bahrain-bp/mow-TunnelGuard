import React, { useState, useEffect } from 'react';
import { FaUserCog, FaUsers, FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { Button } from '../components/ui/button';
import { useUsers } from '../context/UserContext';
import PageWrapper from '../components/PageWrapper';

const CombinedUsersPage: React.FC = () => {
  const { users, loading, addUser, updateUser, deleteUser } = useUsers();
  const [activeTab, setActiveTab] = useState<'staff' | 'public'>('staff');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    role: activeTab === 'public' ? 'public' : 'user',
    status: 'active'
  });

  const filteredUsers = users.filter(user => {
    // Check if search query matches
    const matchesSearch = 
      (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    // Check if the tab matches based on user role
    const userRole = (user.role || '').toString().toLowerCase();
    const isPublicUser = userRole === 'public';
    
    const matchesTab = activeTab === 'staff' 
      ? !isPublicUser  // Staff tab should show non-public users
      : isPublicUser;  // Public tab should show only public users
    
    return matchesSearch && matchesTab;
  });

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (updatedUser: any) => {
    try {
      await updateUser(updatedUser.id, updatedUser);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(userId);
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };
  
  // Update the newUser role when the activeTab changes
  useEffect(() => {
    setNewUser(prevUser => ({
      ...prevUser,
      role: activeTab === 'public' ? 'public' : 'user'
    }));
  }, [activeTab]);

  return (
    <PageWrapper>
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">
            <FaUsers className="me-2" />
            User Management
          </h1>
        </div>

        <Button 
          className="btn btn-primary mb-4"
          onClick={() => setShowAddModal(true)}
        >
          <FaPlus className="me-2" />
          Add New User
        </Button>

        {/* Add User Modal */}
        <div className={`modal ${showAddModal ? 'show d-block' : ''}`} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newUser.fullName}
                      onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={newUser.phone}
                      onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Department</label>
                    <select
                      className="form-select"
                      value={newUser.department}
                      onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                    >
                      <option value="Public">Public</option>
                      <option value="Ministry of Works">Ministry of Works</option>
                      <option value="Traffic Department">Traffic Department</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role</label>
                    <select
                      className="form-select"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    >
                      {activeTab === 'public' ? (
                        <option value="public">Public</option>
                      ) : (
                        <>
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                          <option value="ministry">Ministry</option>
                          <option value="traffic">Traffic</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newUser.status}
                      onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Close</button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={async () => {
                    try {
                      await addUser(newUser);
                      setShowAddModal(false);
                      setNewUser({
                        username: '',
                        fullName: '',
                        email: '',
                        phone: '',
                        password: '',
                        department: '',
                        role: activeTab === 'public' ? 'public' : 'user',
                        status: 'active'
                      });
                    } catch (error) {
                      console.error('Failed to add user:', error);
                    }
                  }}
                >
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <FaUserCog className="me-2" />
              Staff
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'public' ? 'active' : ''}`}
              onClick={() => setActiveTab('public')}
            >
              <FaUsers className="me-2" />
              Public Users
            </button>
          </li>
        </ul>

        <div className="card mb-4">
          <div className="card-body">
            <div className="input-group">
              <span className="input-group-text">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
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
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.department}</td>
                      <td>{user.role}</td>
                      <td>{user.status}</td>
                      <td>
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditUser(user)}
                          >
                            <FaEdit className="me-1" /> Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <FaTrash className="me-1" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && selectedUser && (
          <div className="modal show d-block" tabIndex={-1}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Edit User</h5>
                  <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateUser(selectedUser);
                  }}>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={selectedUser.fullName}
                        onChange={(e) => setSelectedUser({...selectedUser, fullName: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={selectedUser.email}
                        onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={selectedUser.phone}
                        onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Department</label>
                      <select
                        className="form-select"
                        value={selectedUser.department}
                        onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                      >
                        <option value="Public">Public</option>
                        <option value="Ministry of Works">Ministry of Works</option>
                        <option value="Traffic Department">Traffic Department</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Role</label>
                      <select
                        className="form-select"
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={selectedUser.status}
                        onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="modal-footer">
                      <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CombinedUsersPage;