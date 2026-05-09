import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }

    setIsLoading(true);
    try {
      await api.post('/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      showToast('Registration successful! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Registration failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#09090B]">

      {/* Left Side: Branding */}
      <div className="hidden md:flex flex-1 bg-[#12121A] border-r border-[#1F1F2B] p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(167,139,250,0.15)]">S</div>
          <span className="text-xl font-bold text-[#EAEAF0]">SplitIt</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-[#EAEAF0] tracking-tight mb-4 leading-tight">
            Join the easiest way<br />to manage shared<br />expenses.
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-md">No more awkward conversations or complex spreadsheets. Settle up in seconds.</p>
        </div>
        <div className="text-sm text-[#A1A1AA] font-medium">
          © 2026 SplitIt Inc.
        </div>
      </div>

      {/* Right Side: Signup Form */}
      <div className="flex-[1.2] flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(167,139,250,0.15)]">S</div>
          <span className="text-xl font-bold text-[#EAEAF0]">SplitIt</span>
        </div>

        <div className="max-w-md w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#EAEAF0] mb-2">Create an account</h2>
            <p className="text-[#A1A1AA] text-sm">Sign up to start tracking your expenses.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                <input
                  type="text"
                  name="name"
                  required
                  disabled={isLoading}
                  className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Email address</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                <input
                  type="email"
                  name="email"
                  required
                  disabled={isLoading}
                  className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                  <input
                    type="password"
                    name="password"
                    required
                    disabled={isLoading}
                    minLength={6}
                    className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    disabled={isLoading}
                    className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full mt-4"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : null}
              <span>{isLoading ? 'Creating account...' : 'Create account'}</span>
            </button>
          </form>

          <p className="mt-8 text-center text-[#A1A1AA] text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-[#A78BFA] font-semibold hover:text-[#C4B5FD] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
