import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Zap, ArrowLeft, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]     = useState(false);

  const validate = () => {
    if (!email.trim()) return 'Email address is required';
    if (!/\S+@\S+\.\S+/.test(email.trim())) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setLoading(true);

    try {
      await forgotPassword(email.trim());
      toast.success('Password reset OTP sent to your email!');
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
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
            <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-400">
              <KeyRound size={26} />
            </div>
            <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
              Forgot Password?
            </h1>
            <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
              Enter your email address below and we&apos;ll send you a 6-digit OTP code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="forgot-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              error={emailError}
              leftIcon={<Mail size={16} />}
              required
              disabled={loading}
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={loading}
              disabled={loading}
              className="mt-2 py-3 text-sm font-bold shadow-lg shadow-primary-500/25 rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {loading ? 'Sending OTP Code...' : 'Send Reset OTP'}
            </Button>
          </form>

          <div className="text-center mt-6 pt-5 border-t border-border/60">
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

export default ForgotPasswordPage;
