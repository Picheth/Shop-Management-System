import React from 'react';

interface InlineFormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    isTextArea?: boolean;
    error?: string;
    rows?: number;
    onChange?: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
}

/**
 * A compact input component designed for use in tables or dense grids
 * where labels are handled by headers.
 */
const InlineFormInput: React.FC<InlineFormInputProps> = ({ 
    isTextArea, 
    className = '', 
    error, 
    onChange,
    ...props 
}) => {
    const baseClasses = "w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
    
    if (isTextArea) {
        return (
            <div className="w-full">
                <textarea 
                    className={`${baseClasses} ${errorClasses} ${className}`}
                    onChange={onChange as any}
                    {...props as any}
                />
                {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
            </div>
        );
    }

    return (
        <div className="w-full">
            <input 
                className={`${baseClasses} ${errorClasses} ${className}`}
                onChange={onChange as any}
                {...props}
            />
            {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
        </div>
    );
};

export default InlineFormInput;