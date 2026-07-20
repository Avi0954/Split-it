import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSuccess(true);
      showToast('If an account exists, a reset link has been sent.', 'success');
    } catch (err) {
      if (err.response?.status === 429) {
        showToast('Too many requests. Please try again later.', 'error');
      } else {
        // We still show success for security purposes on 404s, but if it's a real network error, it will show this.
        showToast('Something went wrong. Please try again.', 'error');
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
            Forgot your password?<br />No problem.
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-md">We'll send you a secure link to reset it and get you back to splitting bills.</p>
        </div>
        <div className="text-sm text-[#A1A1AA] font-medium">
          © 2026 SplitIt Inc.
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 mb-12">
          <div className="w-8 h-8 bg-[#A78BFA] rounded-lg flex items-center justify-center font-bold text-black shadow-[0_0_20px_rgba(167,139,250,0.15)]">S</div>
          <span className="text-xl font-bold text-[#EAEAF0]">SplitIt</span>
        </div>

        <div className="max-w-sm w-full mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Link to="/login" className="inline-flex items-center text-sm font-medium text-[#A1A1AA] hover:text-[#EAEAF0] mb-8 transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to login
          </Link>

          {isSuccess ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-[#34D399]/20 text-[#34D399] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#EAEAF0] mb-3">Check your email</h2>
              <p className="text-[#A1A1AA] text-sm mb-8">
                If an account exists for <span className="font-semibold text-white">{email}</span>, we've sent instructions to reset your password.
              </p>
              <button
                onClick={() => setIsSuccess(false)}
                className="text-[#A78BFA] text-sm font-semibold hover:text-[#C4B5FD] transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#EAEAF0] mb-2">Reset password</h2>
                <p className="text-[#A1A1AA] text-sm">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="btn-primary w-full mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : null}
                  <span>{isLoading ? 'Sending...' : 'Send reset link'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
