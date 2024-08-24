import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import { FieldError } from 'react-hook-form';

export interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  name: string;
  error?: FieldError | undefined;
  options: [string, string][] | undefined;
}

export const Select = forwardRef<HTMLSelectElement, Props>(
  ({ label, name, className, error, options, ...props }, ref) => {
    const id = useId();

    return (
      <div className={`mb-4 min-w-sm ${className ?? ''}`}>
        {label && (
          <label htmlFor={id} className="flex font-bold text-sm mb-1">
            {label}
          </label>
        )}
        <select
          name={name}
          id={id}
          ref={ref}
          aria-invalid={!!error}
          {...props}
          className="flex w-full border-2 h-10 px-4 py-2 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible ring-gray-400 autofill:bg-green-200"
        >
          {options?.map((opt) => (
            <option key={opt[0]} value={opt[0]}>
              {opt[1]}
            </option>
          ))}
        </select>
        {error && (
          <span role="alert" className="text-red-600 text-xs font-bold">
            {error.message}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

