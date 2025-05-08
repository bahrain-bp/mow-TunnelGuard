import React from 'react';
import Header from './Header';

interface PageLayoutProps {
  children: React.ReactNode;
  skipAuth?: boolean;
}

/**
 * PageLayout Component - Main layout structure with header and content area
 */
const PageLayout: React.FC<PageLayoutProps> = ({ 
  children, 
  skipAuth = false
}) => {
  return (
    <div className="app-container">
      {/* Fixed header at the top */}
      <Header />
      
      {/* Main layout with content */}
      <div className="app-layout">
        {/* Main content area */}
        <main className="content-wrapper">
          <div className="container-fluid py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PageLayout;