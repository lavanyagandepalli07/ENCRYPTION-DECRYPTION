
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, LogOut, LayoutDashboard, Settings, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, signOut, role, isGuest } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="w-full bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-blue-600/20 rounded-lg group-hover:bg-blue-600/30 transition-colors">
              <ShieldAlert className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              SecureVault
            </span>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Admin link removed from main navbar to keep interface clean, still available in profile dropdown for admins */}


            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center text-white">
                  <UserIcon className="w-5 h-5" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-300 px-1">
                  {isGuest ? 'Guest' : (user?.email?.split('@')[0])}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-black border border-white/10 rounded-2xl shadow-2xl py-2 z-20 animate-scale-in">
                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-medium text-gray-300 truncate">
                        {isGuest ? 'Guest Session' : user?.email}
                      </p>
                    </div>
                    
                    {isGuest ? (
                      <>
                        <Link
                          to="/login"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-900 transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          Log In
                        </Link>
                        <Link
                          to="/signup"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-400 hover:bg-zinc-900 transition-colors font-medium"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <ShieldAlert className="w-4 h-4 text-blue-500" />
                          Sign Up
                        </Link>
                      </>
                    ) : role === 'admin' && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-zinc-900 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-500" />
                        Admin Dashboard
                      </Link>
                    )}
 
                    <button
                      onClick={handleLogout}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                        isGuest ? 'text-gray-400 hover:bg-zinc-900' : 'text-red-400 hover:bg-red-500/10'
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
