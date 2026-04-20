
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { Lock, Mail, ShieldAlert, Loader2, AlertCircle, CheckCircle, UserCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { continueAsGuest } = useAuth();

  const handleGuestMode = () => {
    continueAsGuest();
    navigate('/');
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { role: role } }
      });

      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError('An account with this email already exists.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 5000);
      
    } catch (err: any) {
      setError(err.message || 'Account creation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 text-blue-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-mesh opacity-30"></div>
        <div className="absolute inset-0 noise opacity-10"></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-scale-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="relative p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 group-hover:bg-blue-600/20 transition-all duration-300">
              <ShieldAlert className="w-8 h-8 text-blue-600 group-hover:text-blue-500" />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold tracking-tight text-blue-950 leading-none">SecureVault</h2>
              <p className="text-[10px] uppercase tracking-[0.2em] text-blue-900/40 font-bold mt-1">Cryptography Suite</p>
            </div>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight text-blue-950 mb-3">Initialize Profile</h1>
          <p className="text-blue-900/60 font-medium">Begin your journey into secure communication.</p>
        </div>

        <div className="glass rounded-[2.5rem] p-10 border-blue-100 shadow-2xl backdrop-blur-3xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-br-[5rem] -ml-8 -mt-8 transition-transform group-hover:scale-110"></div>
          
          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start text-red-400 animate-slide-up">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {success ? (
            <div className="py-8 flex flex-col items-center text-center animate-scale-in">
              <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center border border-emerald-500/30 mb-6 shadow-xl shadow-emerald-500/10">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold text-blue-950 mb-3">Profile Created!</h3>
              <p className="text-blue-900/60 mb-8 font-medium">Please check your inbox to activate your credentials.</p>
              <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full animate-[progress_5s_linear_forwards]" style={{ width: '100%' }}></div>
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-4 font-bold">Automatic Redirection Active</p>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-widest ml-1">Email Identity</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600">
                    <Mail className="w-5 h-5 text-blue-300 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-4 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all placeholder-blue-900/20 font-medium"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-widest ml-1">Create Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600">
                    <Lock className="w-5 h-5 text-blue-300 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-4 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all placeholder-blue-900/20 font-medium"
                    placeholder="Min. 8 characters"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-blue-900/40 uppercase tracking-widest ml-1">Confirm Key</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-600">
                    <Lock className="w-5 h-5 text-blue-300 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-2xl pl-12 pr-4 py-4 text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:bg-white transition-all placeholder-blue-900/20 font-medium"
                    placeholder="Re-type your key"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email || !password || !confirmPassword}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center disabled:opacity-50 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 group active:scale-[0.98] mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Profile <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-3 text-blue-900/40">Protocol Alternative</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGuestMode}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-4 rounded-2xl border border-blue-100 transition-all flex items-center justify-center active:scale-[0.98]"
              >
                <UserCircle className="w-5 h-5 mr-2 opacity-60" />
                Continue as Guest
              </button>
            </form>
          )}

          <div className="mt-10 text-center text-sm font-medium">
            <span className="text-blue-900/40">Known identity?</span>{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors ml-1">
              Access existing vault
            </Link>
          </div>
        </div>

        <p className="mt-8 text-center text-[10px] text-gray-600 uppercase tracking-[0.3em] font-bold">
          Military-Grade Initialization
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
