import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly = false }) => {
  const { session, role, isLoading, isGuest } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin relative z-10" />
        </div>
        <p className="mt-8 text-[10px] font-black text-blue-900/40 uppercase tracking-[0.3em] animate-pulse">Initializing Secure Environment</p>
      </div>
    );
  }

  if (!session && !isGuest) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
