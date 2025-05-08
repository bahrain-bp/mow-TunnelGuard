import React, { ReactNode } from 'react';
import Footer from './Footer';

interface PageWrapperProps {
  children: ReactNode;
  skipAuth?: boolean;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children, skipAuth = false }) => {
  // Use content-bg class that will automatically adapt to dark mode
  if (skipAuth) {
    return (
      <div className="min-vh-100 d-flex flex-column">
        <div className="flex-grow-1 content-bg">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column">
      <main className="flex-grow-1 content-bg">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageWrapper;