const variantClasses = {
  gray:   'bg-slate-100 text-slate-600',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-emerald-100 text-emerald-700',
  red:    'bg-rose-100 text-rose-600',
  amber:  'bg-amber-100 text-amber-700',
  violet: 'bg-violet-100 text-violet-700',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  const base = 'inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-0.5 text-xs tracking-wide';
  return (
    <span className={`${base} ${variantClasses[variant] || variantClasses.gray} ${className}`}>
      {children}
    </span>
  );
}
