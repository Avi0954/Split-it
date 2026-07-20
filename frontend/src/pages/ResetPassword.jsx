import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../services/auth';
import { useToast } from '../contexts/ToastContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!token) {
      showToast('Invalid or missing reset token.', 'error');
      navigate('/login');
    }
  }, [token, navigate, showToast]);

  const calculateStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', color: 'bg-[#1F1F2B]' };
    if (pwd.length > 8) score += 1;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) score += 1;
    if (pwd.match(/\d/)) score += 1;
    if (pwd.match(/[^a-zA-Z\d]/)) score += 1;
    
    if (score < 2) return { score, label: 'Weak', color: 'bg-rose-500' };
    if (score < 3) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = calculateStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 8) {
      return showToast('Password must be at least 8 characters long.', 'error');
    }
    
    if (password !== confirmPassword) {
      return showToast('Passwords do not match.', 'error');
    }
    
    setIsLoading(true);

    try {
      await resetPassword(token, password);
      setIsSuccess(true);
      showToast('Password reset successfully!', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset password. Token may be expired.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) return null;

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
            Secure your<br />account.
          </h1>
          <p className="text-[#A1A1AA] text-lg max-w-md">Choose a strong password to keep your financial data safe and secure.</p>
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
          {isSuccess ? (
            <div className="text-center animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 bg-[#34D399]/20 text-[#34D399] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-bold text-[#EAEAF0] mb-3">Password reset!</h2>
              <p className="text-[#A1A1AA] text-sm mb-8">
                Your password has been successfully changed. Redirecting you to login...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#EAEAF0] mb-2">Create new password</h2>
                <p className="text-[#A1A1AA] text-sm">Your new password must be different from previously used passwords.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      className="input-field w-full pl-10 pr-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#EAEAF0] transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  
                  {/* Strength Indicator */}
                  {password && (
                    <div className="mt-3 flex items-center gap-2 px-1">
                      <div className="flex-1 flex gap-1 h-1.5">
                        <div className={`flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-[#1F1F2B]'}`} />
                        <div className={`flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-[#1F1F2B]'}`} />
                        <div className={`flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-[#1F1F2B]'}`} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        strength.score < 2 ? 'text-rose-500' : strength.score < 3 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {strength.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#A1A1AA] mb-1.5 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA] group-focus-within:text-[#A78BFA] transition-colors" size={18} />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                      className="input-field w-full pl-10 focus:ring-[#A78BFA] focus:border-[#A78BFA] transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !password || !confirmPassword}
                  className="btn-primary w-full mt-4"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : null}
                  <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
