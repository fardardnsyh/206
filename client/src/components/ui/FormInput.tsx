import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { FieldError } from 'react-hook-form';

export interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  name: string;
  error?: FieldError | undefined;
}

export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ label, name, className, error, ...props }, ref) => {
    const id = useId();

    return (
      <div className={`mb-4 min-w-sm ${className ?? ''}`}>
        {label ? (
          <label className="flex font-bold text-sm mb-1" htmlFor={id}>
            {label}
          </label>
        ) : null}
        <input
          className="flex w-full border-2 h-10 px-4 py-2 rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible ring-gray-400 autofill:bg-green-200"
          id={id}
          ref={ref}
          name={name}
          type="text"
          aria-invalid={!!error}
          {...props}
        />
        {error ? (
          <span role="alert" className="text-red-600 text-xs font-bold">
            {error.message}
          </span>
        ) : null}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

