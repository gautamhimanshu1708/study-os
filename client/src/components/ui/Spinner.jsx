import { Loader2 } from 'lucide-react';

const sizeMap = {
  sm:  { wrapper: 'w-8 h-8',   icon: 16 },
  md:  { wrapper: 'w-12 h-12', icon: 24 },
  lg:  { wrapper: 'w-16 h-16', icon: 32 },
};

const Spinner = ({ size = 'md', className = '', label = 'Loading...' }) => {
  const { wrapper, icon } = sizeMap[size] || sizeMap.md;
  return (
    <div
      role="status"
      aria-label={label}
      className={`flex items-center justify-center ${wrapper} ${className}`}
    >
      <Loader2 size={icon} className="animate-spin text-primary-400" />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export const FullPageSpinner = () => (
  <div className="fixed inset-0 bg-base-900/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-text-secondary text-sm animate-pulse-slow">Loading StudyOS...</p>
    </div>
  </div>
);

export default Spinner;
