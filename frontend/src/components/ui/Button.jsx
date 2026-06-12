import { forwardRef } from 'react';

const variants = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  ghost:     'btn btn-ghost',
  danger:    'btn bg-red-600 text-white hover:bg-red-700 shadow-sm',
};
const sizes = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const Button = forwardRef(({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled}
    className={`${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''} ${className}`}
    {...props}
  >
    {children}
  </button>
));
Button.displayName = 'Button';
export default Button;
