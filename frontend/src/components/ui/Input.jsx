import { forwardRef, useId } from 'react';

const Input = forwardRef(function Input(
  { label, error, hint, icon: Icon, endAdornment, className = '', ...props },
  ref
) {
  const generatedId = useId();
  const inputId = props.id || generatedId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 dark:bg-slate-900 dark:text-slate-100 ${
            Icon ? 'pl-9' : ''
          } ${endAdornment ? 'pr-10' : ''} ${
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-300 dark:border-slate-700'
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAdornment}</div>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

export default Input;
