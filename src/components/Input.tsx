import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, className, id, ...rest }) => {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'w-full border rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-400 transition',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-300 focus:ring-brand-500',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
      {hint && !error && <p id={`${inputId}-hint`} className="text-sm text-gray-500">{hint}</p>}
      {error && <p id={`${inputId}-error`} className="text-sm text-red-600" role="alert">{error}</p>}
    </div>
  );
};
