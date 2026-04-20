
import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
