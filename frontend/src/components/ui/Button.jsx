import { forwardRef } from 'react';

const variantClasses = {
  primary:
    'inline-flex items-center justify-center gap-2 font-semibold text-white ' +
    'bg-gradient-to-r from-blue-600 to-indigo-600 ' +
    'hover:from-blue-500 hover:to-indigo-500 ' +
    'shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 ' +
    'rounded-xl transition-all duration-200 active:scale-[0.97] hover:-translate-y-px',
  secondary:
    'inline-flex items-center justify-center gap-2 font-semibold text-slate-700 ' +
    'bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-700 ' +
    'shadow-sm hover:shadow-md rounded-xl transition-all duration-200',
  ghost:
    'inline-flex items-center justify-center gap-2 font-medium text-slate-600 ' +
    'hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-all duration-200',
  danger:
    'inline-flex items-center justify-center gap-2 font-semibold text-white ' +
    'bg-gradient-to-r from-rose-500 to-red-500 ' +
    'hover:from-rose-400 hover:to-red-400 ' +
    'shadow-md shadow-rose-500/25 rounded-xl transition-all duration-200',
};

const sizeClasses = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-sm',
};

const Button = forwardRef(({ className = '', variant = 'primary', size = 'md', children, disabled, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled}
    className={`
      ${variantClasses[variant] || variantClasses.primary}
      ${sizeClasses[size] || sizeClasses.md}
      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
      disabled:active:scale-100 disabled:hover:translate-y-0
      ${className}
    `}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'Button';
export default Button;
