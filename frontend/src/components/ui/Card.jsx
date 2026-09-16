export default function Card({ children, className = '', padding = 'p-5', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-slate-200 bg-white shadow-card dark:border-slate-800 dark:bg-slate-900 ${padding} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`mb-4 flex items-start justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
