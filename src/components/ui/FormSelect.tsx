import React from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: Option[];
    error?: string;
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
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <select
                id={name}
                name={name}
                value={value}
                onChange={onChange}
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