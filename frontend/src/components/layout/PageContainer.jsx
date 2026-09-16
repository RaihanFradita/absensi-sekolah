export default function PageContainer({ title, description, action, children, className = '' }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            {title && (
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={className}>{children}</div>
    </div>
  );
}
