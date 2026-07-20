import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
      if (msg.toLowerCase().includes('password')) {
        setErrors({ password: msg });
      } else {
        setErrors({ email: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-glow pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-gradient">StudyOS</span>
        </div>

        <div className="auth-card border-gradient">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-text-primary mb-1.5">
              Welcome back
            </h1>
            <p className="text-sm text-text-secondary">
              Sign in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              id="login-email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
              autoComplete="email"
            />

            <Input
              id="login-password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              required
              autoComplete="current-password"
            />

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <Link
                to="/forgot-password"
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              className="mt-2"
            >
              Sign In
            </Button>
          </form>

          <div className="divider-text my-6">or</div>

          <p className="text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
            >
              Sign up for free
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-muted">
          By continuing, you agree to StudyOS&apos;s{' '}
          <span className="text-primary-400 cursor-pointer hover:underline">Terms of Service</span>
          {' '}and{' '}
          <span className="text-primary-400 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
