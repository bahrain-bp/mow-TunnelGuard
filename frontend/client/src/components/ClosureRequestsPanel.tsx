import React, { useState, useEffect } from 'react';
import { Button, Card, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaLock, FaCheck, FaTimes, FaBell, FaInfoCircle, FaUserCircle, FaCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// Define interface for closure request objects
interface ClosureRequest {
  id: number;
  tunnelId: string;
  tunnelName?: string; // We'll fetch this separately
  requestedById: number;
  requesterName?: string; // We'll fetch this separately
  message: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reviewedById: number | null;
  reviewNotes: string | null;
}

const ClosureRequestsPanel: React.FC = () => {
  const [pendingRequests, setPendingRequests] = useState<ClosureRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClosureRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  
  const { user } = useAuth();

  // Fetch pending closure requests
  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch pending closure requests
      const response = await fetch('/api/closure-requests/pending');
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending closure requests');
      }
      
      const requests = await response.json();
      
      // Fetch tunnel names and requester names for each request
      const enhancedRequests = await Promise.all(
        requests.map(async (request: ClosureRequest) => {
          // Fetch tunnel details
          const tunnelResponse = await fetch(`/api/tunnels/${request.tunnelId}`);
          const tunnel = tunnelResponse.ok ? await tunnelResponse.json() : null;
          
          // Fetch requester details
          const requesterResponse = await fetch(`/api/users/${request.requestedById}`);
          const requester = requesterResponse.ok ? await requesterResponse.json() : null;
          
          return {
            ...request,
            tunnelName: tunnel?.name || 'Unknown Tunnel',
            requesterName: requester?.fullName || 'Unknown User'
          };
        })
      );
      
      setPendingRequests(enhancedRequests);
    } catch (error) {
      console.error('Error fetching pending closure requests:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
    
    // Set up polling to refresh requests every 30 seconds
    const intervalId = setInterval(fetchPendingRequests, 30000);
    
    // Clean up interval
    return () => clearInterval(intervalId);
  }, []);

  const handleReviewRequest = (request: ClosureRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedRequest || !reviewAction || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/closure-requests/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewAction === 'approve' ? 'approved' : 'rejected',
          reviewedById: user.id,
          reviewNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${reviewAction} request`);
      }
      
      // Success! Close modal and refresh requests
      setShowReviewModal(false);
      setReviewNotes('');
      setReviewAction(null);
      
      // Fetch updated pending requests
      fetchPendingRequests();
      
    } catch (error) {
      console.error(`Error ${reviewAction}ing request:`, error);
      alert(`Failed to ${reviewAction} request: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowReviewModal(false);
    setReviewNotes('');
    setReviewAction(null);
  };

  if (isLoading && pendingRequests.length === 0) {
    return (
      <div className="d-flex justify-content-center p-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="alert alert-danger">
            <FaInfoCircle className="me-2" />
            Error: {error}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Header className="bg-danger text-white p-3 d-flex align-items-center">
          <FaBell className="me-2" size={18} />
          <h4 className="mb-0 fw-bold">Pending Tunnel Closure Requests</h4>
          <Badge 
            bg="light" 
            text="danger" 
            className="ms-auto rounded-pill px-3 py-2"
          >
            {pendingRequests.length} Requests
          </Badge>
        </Card.Header>
        <Card.Body className="p-4">
          {pendingRequests.length === 0 ? (
            <div className="alert alert-success">
              <FaCheck className="me-2" />
              There are no pending tunnel closure requests.
            </div>
          ) : (
            <div className="closure-requests-list">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="closure-request-item border rounded-4 p-3 mb-3 bg-light-hover"
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0 fw-bold text-danger d-flex align-items-center">
                      <FaLock className="me-2" />
                      {request.tunnelName} ({request.tunnelId})
                    </h5>
                    <Badge 
                      bg="danger" 
                      className="rounded-pill px-3 py-2"
                    >
                      Urgent
                    </Badge>
                  </div>
                  
                  <div className="d-flex mb-3 flex-wrap text-muted">
                    <span className="me-3 d-flex align-items-center mb-2">
                      <FaUserCircle className="me-1" /> Requested by: {request.requesterName}
                    </span>
                    <span className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="me-1" /> {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="p-3 mb-3 bg-light rounded-3">
                    <strong>Reason:</strong>
                    <p className="mb-0 mt-1">{request.message}</p>
                  </div>
                  
                  <div className="d-flex justify-content-end gap-2">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="d-flex align-items-center"
                      onClick={() => handleReviewRequest(request, 'reject')}
                    >
                      <FaTimes className="me-1" /> Dismiss
                    </Button>
                    <Button 
                      variant="success" 
                      size="sm" 
                      className="d-flex align-items-center"
                      onClick={() => handleReviewRequest(request, 'approve')}
                    >
                      <FaCheck className="me-1" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title className={reviewAction === 'approve' ? 'text-success' : 'text-danger'}>
            {reviewAction === 'approve' ? (
              <><FaCheck className="me-2" /> Approve Tunnel Closure</>
            ) : (
              <><FaTimes className="me-2" /> Dismiss Tunnel Closure</>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRequest && (
            <>
              <p>
                You are about to <strong>{reviewAction === 'approve' ? 'approve' : 'dismiss'}</strong> the 
                closure request for <strong>{selectedRequest.tunnelName}</strong>.
              </p>
              
              {reviewAction === 'approve' && (
                <div className="alert alert-warning">
                  <FaInfoCircle className="me-2" />
                  Approving this request will automatically close the tunnel barrier 
                  and notify all relevant departments.
                </div>
              )}
              
              <Form.Group className="mb-3">
                <Form.Label>Review Notes:</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={reviewAction === 'approve' 
                    ? "Add any additional instruction for the response team..." 
                    : "Provide a reason for dismissing this request..."}
                  required
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            variant={reviewAction === 'approve' ? 'success' : 'danger'} 
            onClick={submitReview}
            disabled={isSubmitting || !reviewNotes.trim()}
          >
            {isSubmitting ? (
              <><Spinner size="sm" animation="border" className="me-2" /> Processing...</>
            ) : reviewAction === 'approve' ? (
              <><FaCheck className="me-2" /> Approve Closure</>
            ) : (
              <><FaTimes className="me-2" /> Dismiss Request</>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ClosureRequestsPanel;