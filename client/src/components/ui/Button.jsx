import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: `
    bg-primary-500 hover:bg-primary-600 active:bg-primary-700
    text-white shadow-glow-sm hover:shadow-glow
    border border-primary-400/30
  `,
  secondary: `
    bg-base-500 hover:bg-base-400 active:bg-base-300
    text-text-primary border border-border hover:border-border-hover
  `,
  ghost: `
    bg-transparent hover:bg-base-500
    text-text-secondary hover:text-text-primary border border-transparent
  `,
  danger: `
    bg-danger/90 hover:bg-danger text-white border border-danger/30
  `,
  outline: `
    bg-transparent border border-primary-500/50 hover:border-primary-500
    text-primary-400 hover:text-primary-300 hover:bg-primary-500/10
  `,
};

const sizes = {
  sm:  'px-3 py-1.5 text-xs rounded-lg',
  md:  'px-4 py-2.5 text-sm rounded-xl',
  lg:  'px-6 py-3 text-base rounded-xl',
  xl:  'px-8 py-4 text-base rounded-2xl',
};

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold
        transition-all duration-200 select-none
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-base-900
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
