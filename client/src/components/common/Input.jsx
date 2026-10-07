import { useId } from 'react';

function Input({ label, error, hint, id, className = '', ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={messageId}
        className={`min-h-11 w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${error ? 'border-red-300' : 'border-slate-200'} ${className}`}
        {...props}
      />
      {error && <p id={messageId} className="text-sm text-red-600">{error}</p>}
      {!error && hint && <p id={messageId} className="text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

export default Input;