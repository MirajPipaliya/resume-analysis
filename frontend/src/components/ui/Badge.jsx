const variants = {
  gray:   'bg-slate-100 text-slate-600 border-slate-200',
  blue:   'bg-blue-50 text-blue-700 border-blue-100',
  green:  'bg-emerald-50 text-emerald-700 border-emerald-100',
  red:    'bg-rose-50 text-rose-600 border-rose-100',
  amber:  'bg-amber-50 text-amber-700 border-amber-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  const base = 'inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-0.5 text-xs tracking-wide border';
  return (
    <span className={`${base} ${variants[variant] || variants.gray} ${className}`}>
      {children}
    </span>
  );
}
