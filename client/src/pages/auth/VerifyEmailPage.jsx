import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Mail, Zap, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import { resendOtp } from '../../api/authApi';
import Button from '../../components/ui/Button';

const VerifyEmailPage = () => {
  const { verifyOtp } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [isEditingEmail, setIsEditingEmail] = useState(!emailParam);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // 60 second resend timer
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];

    // Handle pasting multi-digit string
    if (value.length > 1) {
      const pastedDigits = value.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedDigits[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance cursor to next input box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (fullOtp.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(email.trim(), fullOtp);
      toast.success('Email verified successfully! Welcome to StudyOS');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email.trim()) return;
    setResending(true);
    try {
      await resendOtp({ email: email.trim(), type: 'verification' });
      toast.success('A new 6-digit OTP code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend code. Please try again.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-950 text-text-primary">
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/15 to-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10 my-auto py-6">
        {/* Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300 border border-white/20">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-gradient">
              StudyOS
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-base-900/75 transition-all">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-400 shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              Enter the 6-digit code sent to your email to verify and activate your StudyOS account.
            </p>
          </div>

          {/* Email Display & Edit Pill */}
          <div className="mb-6 p-3 bg-base-950/80 border border-border/80 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Mail size={16} className="text-primary-400 shrink-0" />
              {isEditingEmail ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-transparent text-xs text-text-primary outline-none w-full border-b border-primary-500/50 pb-0.5"
                />
              ) : (
                <span className="text-xs font-semibold text-text-primary truncate">{email || 'No email specified'}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsEditingEmail(!isEditingEmail)}
              className="text-[11px] font-semibold text-primary-400 hover:text-primary-300 transition-colors shrink-0"
            >
              {isEditingEmail ? 'Done' : 'Change'}
            </button>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Individual OTP Boxes */}
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-base-950/80 text-text-primary border border-white/10 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none transition-all shadow-inner"
                  autoFocus={idx === 0}
                />
              ))}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading || otp.join('').length !== 6}
              className="py-3 text-sm font-bold shadow-lg shadow-primary-500/25 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? 'Verifying OTP...' : 'Verify & Activate Account'}
            </Button>
          </form>

          {/* Resend Code Section */}
          <div className="mt-6 text-center pt-4 border-t border-border/60">
            <p className="text-xs text-text-secondary">
              Didn&apos;t receive the code?{' '}
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={12} className={resending ? 'animate-spin' : ''} /> Resend OTP Code
                </button>
              ) : (
                <span className="text-text-muted font-medium">
                  Resend in <strong className="text-primary-400 font-bold">{countdown}s</strong>
                </span>
              )}
            </p>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
