const map = {
  green:  'badge badge-green',
  amber:  'badge badge-amber',
  red:    'badge badge-red',
  blue:   'badge badge-blue',
  gray:   'badge badge-gray',
  violet: 'badge badge-violet',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`${map[variant] ?? map.gray} ${className}`}>
      {children}
    </span>
  );
}
