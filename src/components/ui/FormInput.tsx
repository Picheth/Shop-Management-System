import React from 'react';

export const PHONE_REGEX = /^[0-9+\s-()]{8,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    label?: string;
    isTextArea?: boolean;
    isValidating?: boolean;
    isDuplicate?: boolean;
    error?: string;
    tooltip?: string;
    rows?: number;
    onChange?: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => void;
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
    maxLength,
    tooltip,
    error,
    className = '',
    ...props
}) => {
    const phoneError = (type === 'tel' && value && !PHONE_REGEX.test(String(value)))
        ? 'Invalid phone number format.'
        : undefined;

    const emailError = (type === 'email' && value && !EMAIL_REGEX.test(String(value)))
        ? 'Invalid email address format.'
        : undefined;

    const baseInputClasses =
        'w-full bg-white dark:bg-gray-700 border rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors shadow-sm';
    
    const statusClasses = (isDuplicate || error || phoneError || emailError)
        ? 'border-red-500 focus:ring-red-500' 
        : 'border-gray-300 dark:border-gray-600';

    const displayError = isDuplicate 
        ? `This ${label || 'value'} already exists.` 
        : (error || phoneError || emailError);

    const renderInput = () => {
        const commonProps = {
            id: name,
            name,
            value,
            onChange: onChange as any,
            required,
            maxLength,
            className: `${baseInputClasses} ${statusClasses} ${className}`,
            ...props as any
        };

        if (isTextArea) {
            return <textarea placeholder={placeholder} {...commonProps} />;
        }
        return <input type={type} placeholder={placeholder} {...commonProps} />;
    };

    const currentLength = String(value ?? '').length;

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

            <div className="flex justify-between items-start gap-2 px-0.5">
                <div className="flex-1 min-h-[1.25rem]">
                    {displayError && (
                        <p className="text-red-500 text-xs">
                            {displayError}
                        </p>
                    )}
                </div>
                {maxLength && (
                    <span className={`text-[10px] tabular-nums whitespace-nowrap mt-0.5 ${currentLength > maxLength ? 'text-red-500 font-medium' : 'text-gray-400 dark:text-gray-500'}`}>
                        {currentLength} / {maxLength}
                    </span>
                )}
            </div>
        </div>
    );
};

export default FormInput;