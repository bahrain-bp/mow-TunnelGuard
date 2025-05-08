import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaUserCog } from 'react-icons/fa';
import PageWrapper from '../components/PageWrapper';

const SimpleUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(4);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users from API');
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log('Fetched users:', data);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter out public users and then filter by search query
  // Make sure to handle case-insensitive comparison
  const staffUsers = users.filter(user => {
    // Exclude 'public' role - ensure string comparison
    const userRole = (user.role || '').toString().toLowerCase();
    const isPublicUser = userRole === 'public';
    return !isPublicUser;
  });
  
  // Filter users based on search query
  const filteredUsers = staffUsers.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    return status === 'Active' ? 'bg-success' : 'bg-secondary';
  };

  // Get role badge class
  const getRoleBadgeClass = (role: string) => {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case 'admin':
        return 'bg-danger';
      case 'ministry':
        return 'bg-warning text-dark';
      case 'traffic':
        return 'bg-primary';
      case 'public':
        return 'bg-info';
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">
            <FaUserCog className="me-2" />
            Staff Management
          </h1>
          
          <Link href="/users/add" className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" />
            Add New User
          </Link>
        </div>

        {/* Search Box */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-lg-6">
                <div className="position-relative">
                  <div className="position-absolute start-0 top-0 bottom-0 d-flex align-items-center ps-3">
                    <FaSearch className="text-muted" />
                  </div>
                  <input 
                    type="text" 
                    className="form-control ps-5" 
                    placeholder="Search users by name, email, role, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.id}</strong></td>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.department}</td>
                        <td>
                          <span className={`badge ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <div className="btn-group">
                            <Link href={`/users/edit/${user.id}`} className="btn btn-sm btn-outline-primary">
                              <FaEdit className="me-1" /> Edit
                            </Link>
                            <button className="btn btn-sm btn-outline-danger">
                              <FaTrash className="me-1" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-3">
                        No users found matching your search criteria.
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

export default SimpleUsersPage;