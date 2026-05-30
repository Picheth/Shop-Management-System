import React from 'react';

interface SettingsFormProps {
    title: string;
    isEditing: boolean;
    onCancel: () => void;
    onSubmit: (e: React.FormEvent) => void;
    isValidating?: boolean;
    isDuplicate?: boolean;
    isDisabled?: boolean;
    submitLabel?: string;
    children: React.ReactNode;
    className?: string;
}

const SettingsForm: React.FC<SettingsFormProps> = ({
    title,
    isEditing,
    onCancel,
    onSubmit,
    isValidating = false,
    isDuplicate = false,
    isDisabled = false,
    submitLabel,
    children,
    className = "",
}) => {
    const defaultSubmitLabel = isEditing ? 'Update' : 'Add';
    
    const displaySubmitLabel = isValidating 
        ? 'Checking...' 
        : isDuplicate 
            ? 'Code Exists' 
            : (submitLabel || defaultSubmitLabel);

    return (
        <form
            onSubmit={onSubmit}
            className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 ${className}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                </h2>

                {isEditing && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-sm text-red-500 hover:text-red-600"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {children}

            <div className="flex justify-end mt-4">
                <button
                    type="submit"
                    disabled={isValidating || isDuplicate || isDisabled}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md disabled:opacity-50 transition-colors"
                >
                    {displaySubmitLabel}
                </button>
            </div>
        </form>
    );
};

export default SettingsForm;