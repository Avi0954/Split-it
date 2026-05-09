import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2 } from 'lucide-react';
import api from '../services/api';
import { setToken } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.access_token);
      showToast('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Invalid email or password. Please try again.', 'error');
      } else {
        showToast(err.response?.data?.detail || 'Login failed. Please check your connection.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#09090B]">

      {/* Left Side: Branding / Marketing */}
      <div className="hidden md:flex flex-1 bg-[#12121A] border-r border-[#1F1F2B] p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(167,139,250,0.15)]">S</div>
          <span className="text-xl font-bold text-[#EAEAF0]">SplitIt</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#EAEAF0] tracking-tight mb-4 leading-tight">
            Share expenses<br />with friends,<br />hassle-free.
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-md">The simplest way to track your shared expenses, balances, and who owes who.</p>
        </div>
        <div className="text-sm text-[#A1A1AA] font-medium">
          © 2026 SplitIt Inc.
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(167,139,250,0.15)]">S</div>
          <span className="text-xl font-bold text-[#EAEAF0]">SplitIt</span>
        </div>

        <div className="max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#EAEAF0] mb-2">Welcome back</h2>
            <p className="text-[#A1A1AA] text-sm">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 px-1">
                <label className="block text-sm font-medium text-[#A1A1AA]">Password</label>
                <Link to="#" className="text-xs font-semibold text-[#A78BFA] hover:text-[#C4B5FD] transition-colors">Forgot password?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                <input
                  type="password"
                  required
                  disabled={isLoading}
                  className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : null}
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>

          <p className="mt-8 text-center text-[#A1A1AA] text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#A78BFA] font-semibold hover:text-[#C4B5FD] transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
