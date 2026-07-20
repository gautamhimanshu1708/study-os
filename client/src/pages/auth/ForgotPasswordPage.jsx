import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowLeft, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/authApi';
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
      await forgotPassword(email);
      setSent(true);
      toast.success('Reset instructions sent!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-950 text-text-primary">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/15 to-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10 my-auto py-6">
        {/* StudyOS SaaS Header Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group focus:outline-none mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:scale-105 transition-transform duration-300 border border-white/20">
              <Zap size={24} className="text-white fill-white" />
            </div>
            <span className="text-3xl font-black tracking-tight text-gradient">
              StudyOS
            </span>
          </Link>
          <p className="text-xs font-medium text-text-muted uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-primary-400" /> Account Recovery
          </p>
        </div>

        {/* Glassmorphic Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-base-900/75 transition-all">
          {!sent ? (
            <>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Mail size={22} className="text-primary-400" />
                </div>
                <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
                  Forgot password?
                </h1>
                <p className="text-xs text-text-secondary mt-1.5">
                  Enter your email address and we&apos;ll send you password recovery instructions.
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
                  {loading ? 'Sending Instructions...' : 'Send Reset Link'}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-14 h-14 bg-success/15 border border-success/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={26} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary mb-1.5">Check your inbox</h2>
              <p className="text-xs text-text-secondary mb-2">
                We&apos;ve sent reset instructions to:
              </p>
              <p className="text-xs font-semibold text-primary-400 mb-6 break-all px-3 py-1.5 rounded-lg bg-base-800 border border-border inline-block">
                {email}
              </p>
              <p className="text-[11px] text-text-muted mb-6">
                Didn&apos;t receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-primary-400 hover:text-primary-300 inline-flex items-center gap-1 font-semibold transition-colors"
                >
                  <RefreshCw size={11} /> try again
                </button>
              </p>
            </div>
          )}

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/80" />
            </div>
          </div>

          <div className="text-center">
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
