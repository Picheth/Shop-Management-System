import { useMemo } from 'react';
import { PHONE_REGEX, EMAIL_REGEX } from '../ui/FormInput';

interface ValidationConfig {
    required?: string[];
    phone?: string[];
    email?: string[];
    patterns?: Record<string, RegExp>;
    minMax?: Record<string, { min?: number; max?: number }>;
    maxLength?: Record<string, number>;
    labels?: Record<string, string>;
}

/**
 * A reusable hook to centralize basic form validation (required, phone, email).
 * 
 * @param form The current form state object.
 * @param config Configuration defining which fields are required or need format validation.
 * @returns An object containing a map of errors and an isInvalid boolean.
 */
export function useFormValidation(form: Record<string, any>, config: ValidationConfig) {
    return useMemo(() => {
        const errors: Record<string, string> = {};

        const getLabel = (field: string) => config.labels?.[field] || 'This field';

        // Check Required Fields
        if (config.required) {
            for (const field of config.required) {
                const val = form[field];
                const isEmpty = val === undefined || val === null || (typeof val === 'string' && !val.trim());
                if (isEmpty) {
                    errors[field] = `${getLabel(field)} is required.`;
                }
            }
        }

        // Check Phone Format
        if (config.phone) {
            for (const field of config.phone) {
                if (errors[field]) continue;
                const val = form[field];
                if (val && !PHONE_REGEX.test(String(val))) {
                    errors[field] = `Invalid ${getLabel(field).toLowerCase()} format.`;
                }
            }
        }

        // Check Email Format
        if (config.email) {
            for (const field of config.email) {
                if (errors[field]) continue;
                const val = form[field];
                if (val && !EMAIL_REGEX.test(String(val))) {
                    errors[field] = `Invalid ${getLabel(field).toLowerCase()} format.`;
                }
            }
        }

        // Check Custom Regex Patterns
        if (config.patterns) {
            for (const [field, regex] of Object.entries(config.patterns)) {
                if (errors[field]) continue;
                const val = form[field];
                if (val && !regex.test(String(val))) {
                    errors[field] = `Invalid ${getLabel(field).toLowerCase()} format.`;
                }
            }
        }

        // Check Min/Max Numeric Ranges
        if (config.minMax) {
            for (const [field, range] of Object.entries(config.minMax)) {
                if (errors[field]) continue;
                const label = getLabel(field);
                const val = Number(form[field]);
                if (!isNaN(val)) {
                    const { min, max } = range;
                    if (min !== undefined && val < min) {
                        errors[field] = `${label} must be at least ${min}.`;
                    } else if (max !== undefined && val > max) {
                        errors[field] = `${label} cannot exceed ${max}.`;
                    }
                }
            }
        }

        // Check Max Length
        if (config.maxLength) {
            for (const [field, limit] of Object.entries(config.maxLength)) {
                if (errors[field]) continue;
                const val = form[field];
                if (val && String(val).length > limit) {
                    errors[field] = `${getLabel(field)} cannot exceed ${limit} characters.`;
                }
            }
        }

        return {
            errors,
            isInvalid: Object.keys(errors).length > 0
        };
        // Stringify config to keep dependency array stable if literal is passed
    }, [form, JSON.stringify(config, (key, value) => 
        value instanceof RegExp ? value.toString() : value
    )]);
}