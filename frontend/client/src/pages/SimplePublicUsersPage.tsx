import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { FaSearch, FaPlus, FaUsers, FaEnvelope, FaPhoneAlt, FaMedal } from 'react-icons/fa';
import PageWrapper from '../components/PageWrapper';

const SimplePublicUsersPage: React.FC = () => {
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
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        
        // Filter to only public users
        const publicUsers = data.filter((user: any) => user.role === 'public');
        
        // Add placeholder data for new fields
        const enhancedUsers = publicUsers.map((user: any) => ({
          ...user,
          joinDate: new Date(user.createdAt || Date.now() - Math.random() * 10000000000),
          alertContributions: Math.floor(Math.random() * 15) // Random number for demo
        }));
        
        setUsers(enhancedUsers);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // First filter to get only public users, then apply search query
  const publicUsers = users.filter(user => {
    // Only include 'public' role - ensure string comparison
    const userRole = (user.role || '').toString().toLowerCase();
    const isPublicUser = userRole === 'public';
    return isPublicUser;
  });
  
  // Then filter by search query
  const filteredUsers = publicUsers.filter(user => 
    user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

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
            <FaUsers className="me-2" />
            Public Contributors
          </h1>
          
          <Link href="/register" className="btn btn-primary d-flex align-items-center">
            <FaPlus className="me-2" />
            Become a Contributor
          </Link>
        </div>

        <div className="alert alert-info mb-4">
          <p className="mb-0">
            Public contributors help TunnelGuard by reporting tunnel conditions and verifying alerts in their area.
            Their contributions are crucial for keeping our community safe.
          </p>
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
                    placeholder="Search contributors by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Public Users Table */}
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Member Since</th>
                    <th>Contributions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                              <span className="text-primary fw-bold">
                                {user.fullName && user.fullName.split(' ').map((part: string) => part[0] || '').join('')}
                              </span>
                            </div>
                            <div>
                              <div className="fw-medium">{user.fullName}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex flex-column">
                            <div className="d-flex align-items-center mb-1">
                              <FaEnvelope className="text-muted me-2" size={14} />
                              <a href={`mailto:${user.email}`} className="text-decoration-none text-muted">
                                {user.email}
                              </a>
                            </div>
                            <div className="d-flex align-items-center">
                              <FaPhoneAlt className="text-muted me-2" size={14} />
                              <span className="text-muted">{user.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {user.joinDate ? user.joinDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : new Date().toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FaMedal 
                              className={
                                (user.alertContributions || 0) > 10 
                                  ? 'text-warning' 
                                  : (user.alertContributions || 0) > 5 
                                    ? 'text-primary' 
                                    : 'text-secondary'
                              } 
                              size={18} 
                              title={
                                (user.alertContributions || 0) > 10 
                                  ? 'Gold Contributor' 
                                  : (user.alertContributions || 0) > 5 
                                    ? 'Silver Contributor' 
                                    : 'Bronze Contributor'
                              }
                            />
                            <span className="ms-2">
                              {user.alertContributions || 0} alerts
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-3">
                        No public contributors found matching your search criteria.
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

export default SimplePublicUsersPage;