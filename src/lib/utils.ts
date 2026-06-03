/**
 * Formats a numeric value into a standard currency string.
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

/**
 * Safely parses a JSON string from localStorage.
 */
export const getStorageItem = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error parsing localStorage key "${key}":`, error);
        return null;
    }
};

/**
 * Generates a standard timestamp for internal logging.
 */
export const getTimestamp = (): string => {
    return new Date().toISOString();
};

/**
 * Sanitizes a string for CSV export to prevent injection attacks.
 * Prefixes values starting with '=', '+', '-', or '@' with a single quote.
 */
export const sanitizeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '';
    const strValue = String(value);
    if (strValue.startsWith('=') || strValue.startsWith('+') || strValue.startsWith('-') || strValue.startsWith('@')) {
        return `'${strValue}`;
    }
    return strValue;
};