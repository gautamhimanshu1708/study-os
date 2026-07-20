import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Zap, ArrowLeft, ShieldCheck, HelpCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { getSecurityQuestion, resetPasswordWithSecurityAnswer } from '../../api/authApi';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  // Step 1 = Enter email; Step 2 = Answer security question & enter new password; Step 3 = Success
  const [step, setStep] = useState(1);

  const [email, setEmail]                         = useState('');
  const [securityQuestion, setSecurityQuestion]   = useState('');
  const [securityAnswer, setSecurityAnswer]       = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');

  const [emailError, setEmailError]               = useState('');
  const [answerError, setAnswerError]             = useState('');
  const [passwordError, setPasswordError]         = useState('');
  const [confirmError, setConfirmError]           = useState('');

  const [loading, setLoading]                     = useState(false);

  // Step 1: Submit email to get security question
  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    setLoading(true);

    try {
      const res = await getSecurityQuestion(email.trim());
      setSecurityQuestion(res.securityQuestion);
      setStep(2);
      toast.success('Security question retrieved!');
    } catch (err) {
      const msg = err.response?.data?.message || 'No account found with this email address';
      toast.error(msg);
      setEmailError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify answer and set new password
  const handleStep2Submit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!securityAnswer.trim()) {
      setAnswerError('Security answer is required');
      valid = false;
    } else {
      setAnswerError('');
    }

    if (!newPassword) {
      setPasswordError('New password is required');
      valid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password');
      valid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      valid = false;
    } else {
      setConfirmError('');
    }

    if (!valid) return;

    setLoading(true);
    try {
      await resetPasswordWithSecurityAnswer({
        email: email.trim(),
        securityAnswer: securityAnswer.trim(),
        newPassword,
      });
      setStep(3);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Incorrect security answer or reset failed';
      toast.error(msg);
      setAnswerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-base-950 text-text-primary">
      {/* Background Ambient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-600/15 to-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in relative z-10 my-auto py-6">
        {/* StudyOS Logo Header */}
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

        {/* Glassmorphic Auth Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-base-900/75 transition-all">
          {step === 1 && (
            <>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-400">
                  <Mail size={22} />
                </div>
                <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
                  Reset Password
                </h1>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                  Enter your registered email address to retrieve your security question.
                </p>
              </div>

              <form onSubmit={handleStep1Submit} noValidate className="space-y-4">
                <Input
                  id="forgot-email"
                  name="email"
                  type="email"
                  label="Email address"
                  placeholder="alex@example.com"
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
                  {loading ? 'Finding Account...' : 'Continue'}
                  {!loading && <ArrowRight size={16} className="ml-2" />}
                </Button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <div className="mb-6 text-center">
                <div className="w-12 h-12 bg-primary-500/15 border border-primary-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary-400">
                  <ShieldCheck size={24} />
                </div>
                <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">
                  Security Check
                </h1>
                <p className="text-xs text-text-secondary mt-1.5">
                  Answer your security question to set a new password.
                </p>
              </div>

              {/* Display Security Question Box */}
              <div className="mb-4 p-3.5 bg-base-950/80 border border-primary-500/30 rounded-xl">
                <div className="flex items-start gap-2.5">
                  <HelpCircle size={18} className="text-primary-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-primary-400 uppercase tracking-wider">
                      Your Security Question
                    </p>
                    <p className="text-xs font-semibold text-text-primary mt-0.5">
                      {securityQuestion}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleStep2Submit} noValidate className="space-y-4">
                <Input
                  id="security-answer-input"
                  name="securityAnswer"
                  type="text"
                  label="Security Answer"
                  placeholder="Enter your security answer"
                  value={securityAnswer}
                  onChange={(e) => {
                    setSecurityAnswer(e.target.value);
                    if (answerError) setAnswerError('');
                  }}
                  error={answerError}
                  leftIcon={<ShieldCheck size={16} />}
                  required
                  disabled={loading}
                  autoFocus
                />

                <Input
                  id="new-password-input"
                  name="newPassword"
                  type="password"
                  label="New Password"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  error={passwordError}
                  leftIcon={<Lock size={16} />}
                  required
                  disabled={loading}
                />

                <Input
                  id="confirm-password-input"
                  name="confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError('');
                  }}
                  error={confirmError}
                  leftIcon={<Lock size={16} />}
                  required
                  disabled={loading}
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
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </Button>
              </form>
            </>
          )}

          {step === 3 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-success/15 border border-success/25 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 size={28} className="text-success" />
              </div>
              <h2 className="text-xl font-bold text-text-primary">Password Reset Complete!</h2>
              <p className="text-xs text-text-secondary">
                Your password has been updated successfully. Redirecting you to sign in...
              </p>
              <Link
                to="/login"
                className="btn-primary inline-flex items-center justify-center w-full py-3 text-sm font-bold rounded-xl mt-2"
              >
                Sign In Now
              </Link>
            </div>
          )}

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
