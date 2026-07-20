import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../api/axiosInstance';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const [email, setEmail]         = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading]     = useState(false);
  const [sent, setSent]           = useState(false);

  const validate = () => {
    if (!email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setEmailError(err); return; }
    setEmailError('');
    setLoading(true);

    try {
      await axiosInstance.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset instructions sent!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">StudyOS</span>
        </div>

        <div className="auth-card border-gradient">
          {!sent ? (
            <>
              <div className="mb-8 text-center">
                <div className="w-14 h-14 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={24} className="text-primary-400" />
                </div>
                <h1 className="text-2xl font-bold text-text-primary mb-1.5">
                  Forgot password?
                </h1>
                <p className="text-sm text-text-secondary">
                  No worries — enter your email and we&apos;ll send you reset instructions.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  error={emailError}
                  leftIcon={<Mail size={16} />}
                  required
                  autoComplete="email"
                />

                <Button type="submit" fullWidth size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
            </>
          ) : (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-success/15 border border-success/25 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle size={28} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-2">Check your email</h2>
              <p className="text-sm text-text-secondary mb-2">
                We&apos;ve sent password reset instructions to:
              </p>
              <p className="text-sm font-semibold text-primary-400 mb-6 break-all">{email}</p>
              <p className="text-xs text-text-muted mb-6">
                Didn&apos;t receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSent(false); }}
                  className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
                >
                  <RefreshCw size={11} />
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="divider-text my-5" />

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
