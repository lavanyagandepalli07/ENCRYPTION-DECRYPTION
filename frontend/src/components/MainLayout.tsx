
import React from 'react';
import Navbar from './Navbar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white text-blue-950 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-200/20 blur-[100px] rounded-full animate-float"></div>
        <div className="absolute inset-0 bg-mesh opacity-40"></div>
        <div className="absolute inset-0 noise"></div>
      </div>

      <Navbar />
      
      <main className="relative z-10 flex-grow pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Subtle Footer */}
      <footer className="relative z-10 py-8 text-center text-blue-900/40 text-xs border-t border-blue-100 bg-white/40 backdrop-blur-sm mt-auto">
        <p className="tracking-widest uppercase font-medium">&copy; {new Date().getFullYear()} SecureVault &bull; Advanced Security Suite</p>
      </footer>
    </div>
  );
};

export default MainLayout;
