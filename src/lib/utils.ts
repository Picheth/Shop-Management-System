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