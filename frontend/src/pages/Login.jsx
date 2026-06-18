import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Bot, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // authService.login calls POST /login, stores token, calls GET /users/me, and stores user details
      await authService.login(email, password);
      
      navigate('/chat');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="w-full max-w-md bg-slate-900/40 border border-slate-900 p-8 rounded-3xl shadow-2xl relative">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center space-x-2 mb-4 bg-indigo-600 p-2.5 rounded-2xl text-white">
            <Bot className="w-6 h-6" />
          </Link>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
          <p className="text-xs text-slate-500 mt-2">
            Log in to manage and query your documents
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="flex items-center space-x-2 mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-450 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Email address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-indigo-500/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none text-slate-200 placeholder:text-slate-650"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-400">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-indigo-500/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none text-slate-200 placeholder:text-slate-650"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/15 active:scale-[0.99] cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Navigation Link */}
        <div className="text-center mt-6 text-xs text-slate-550">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
