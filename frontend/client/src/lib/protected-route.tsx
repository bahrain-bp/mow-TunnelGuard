import React, { useEffect } from 'react';
import { Route, useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/PageLayout';

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: string | string[]; // Optional role requirement for access
}

/**
 * ProtectedRoute - A route component that requires authentication
 * This component now includes the PageLayout to avoid duplicate headers
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  path, 
  component: Component,
  requiredRole = 'public' // Default to public access
}) => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  return (
    <Route path={path}>
      {(params) => {
        // Use useEffect for navigation in all cases to avoid hook order issues
        useEffect(() => {
          // Don't navigate if still loading
          if (isLoading) return;
          
          // Navigate to login if not authenticated
          if (!isAuthenticated) {
            navigate('/role-selection');
          }
        }, [isLoading, isAuthenticated, navigate]);
        
        // Check if still loading auth state
        if (isLoading) {
          return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          );
        }
        
        // If not authenticated, render nothing (redirect happens in useEffect)
        if (!isAuthenticated) {
          return null;
        }
        
        // Check if user has the required role permissions
        if (!hasPermission(requiredRole)) {
          return (
            <div className="container py-5 text-center">
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Access Denied</h4>
                <p>You don't have permission to access this page.</p>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/dashboard')}
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
        
        // User is authenticated and has permission - wrap with PageLayout
        return (
          <PageLayout>
            <Component params={params} />
          </PageLayout>
        );
      }}
    </Route>
  );
};

export default ProtectedRoute;
