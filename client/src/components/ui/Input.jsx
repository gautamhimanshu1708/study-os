import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  hint,
  type = 'text',
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  id,
  required,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none transition-colors">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`
            w-full bg-surface-secondary border text-text-primary placeholder:text-text-muted
            rounded-xl px-4 py-2.5 text-sm
            transition-all duration-200
            caret-primary-400
            focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
            ${error
              ? 'border-danger focus:ring-danger/30 focus:border-danger'
              : 'border-border hover:border-border-hover'
            }
            ${leftIcon  ? 'pl-10'  : ''}
            ${isPassword || rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />

        {/* Right icon / password toggle */}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        ) : rightIcon ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary">
            {rightIcon}
          </div>
        ) : null}
      </div>

      {/* Error / Hint */}
      {error && (
        <p className="form-error flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-muted mt-1">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
