import React from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface InlineFormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: Option[];
    error?: string;
    placeholder?: string;
    onChange?: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
}

/**
 * A compact select component designed for use in tables or dense grids.
 */
const InlineFormSelect: React.FC<InlineFormSelectProps> = ({ 
    options, 
    className = '', 
    error, 
    placeholder,
    onChange,
    ...props 
}) => {
    const baseClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors cursor-pointer";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
    
    return (
        <div className="w-full">
            <select 
                className={`${baseClasses} ${errorClasses} ${className}`}
                onChange={onChange as any}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
        </div>
    );
};

export default InlineFormSelect;