import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
    label?: string;
    isTextArea?: boolean;
    isValidating?: boolean;
    isDuplicate?: boolean;
    error?: string;
}

/**
 * A generic input component that handles labels, validation states,
 * duplication checks, and error messages consistently.
 */
const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    value,
    onChange,
    placeholder,
    type = 'text',
    required = false,
    isTextArea = false,
    isValidating = false,
    isDuplicate = false,
    error,
    className = '',
    ...props
}) => {
    const baseInputClasses =
        'w-full bg-white dark:bg-gray-700 border rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors shadow-sm';
    
    const statusClasses = (isDuplicate || error)
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600';

    const displayError = isDuplicate 
        ? `This ${label || 'value'} already exists.` 
        : error;

    const renderInput = () => {
        const commonProps = {
            id: name,
            name,
            value,
            onChange,
            placeholder,
            required,
            className: `${baseInputClasses} ${statusClasses} ${className}`,
            ...props as any
        };

        if (isTextArea) {
            return <textarea {...commonProps} />;
        }
        return <input type={type} {...commonProps} />;
    };

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div className="relative">
                {renderInput()}
                
                {/* Validation Spinner for Text Inputs */}
                {isValidating && !isTextArea && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="animate-spin h-4 w-4 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>

            {displayError && (
                <p className="text-red-500 text-xs mt-1">
                    {displayError}
                </p>
            )}
        </div>
    );
};

export default FormInput;