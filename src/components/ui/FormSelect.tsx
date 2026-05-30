import React from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label?: string;
    options: Option[];
    error?: string;
    placeholder?: string;
    tooltip?: string;
    onChange?: (
    e: React.ChangeEvent<HTMLSelectElement>
) => void;
}

/**
 * A generic select component that handles labels, required states,
 * and error messages consistently with FormInput.
 */
const FormSelect: React.FC<FormSelectProps> = ({
    label,
    name,
    value,
    onChange,
    options,
    placeholder,
    required = false,
    tooltip,
    error,
    className = '',
    disabled = false,
    ...props
}) => {
    const baseSelectClasses =
        'w-full bg-white dark:bg-gray-700 border rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed';
    
    const statusClasses = error
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600';

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-1.5">
                {label && (
                    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                {tooltip && (
                    <div className="group relative flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-400 cursor-help transition-colors hover:text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-lg z-50 pointer-events-none after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange as any}
                required={required}
                disabled={disabled}
                className={`${baseSelectClasses} ${statusClasses} ${className}`}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="text-red-500 text-xs mt-1">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormSelect;