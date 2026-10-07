import { LoaderCircle } from 'lucide-react';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-blue-500',
  subtle: 'text-slate-600 hover:bg-slate-100 focus-visible:ring-blue-500',
};

function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant] ?? variants.primary} ${className}`}
      {...props}
    >
      {loading && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}

export default Button;