import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          className={`peer w-full rounded-xl border bg-white px-4 pb-2 pt-5 text-sm font-medium text-ink-900 outline-none transition-all placeholder:text-transparent focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 ${
            error ? 'border-error-500' : 'border-ink-200'
          } ${className}`}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="pointer-events-none absolute left-4 top-4 text-sm font-medium text-ink-400 transition-all peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-accent-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold"
        >
          {label}
        </label>
        {error && (
          <p className="mt-1 text-xs font-medium text-error-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  options: string[];
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className = '', id, ...props }, ref) => {
    const selectId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={`peer w-full appearance-none rounded-xl border bg-white px-4 pb-2 pt-5 text-sm font-medium text-ink-900 outline-none transition-all focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 border-ink-200 ${className}`}
          {...props}
        >
          <option value="">Select {label}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <label
          htmlFor={selectId}
          className="pointer-events-none absolute left-4 top-1.5 text-xs font-semibold text-ink-400"
        >
          {label}
        </label>
      </div>
    );
  }
);

Select.displayName = 'Select';
