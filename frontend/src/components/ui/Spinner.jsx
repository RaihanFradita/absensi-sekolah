import { Loader2 } from 'lucide-react';

export default function Spinner({ size = 20, className = '' }) {
  return (
    <Loader2
      className={`animate-spin text-brand-600 dark:text-brand-400 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
