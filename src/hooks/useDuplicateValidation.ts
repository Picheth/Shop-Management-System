import { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';

/**
 * A reusable hook to check for duplicate field values in the database.
 * 
 * @param tableName The name of the database table to check against in Supabase.
 * @param columnName The name of the column to check for uniqueness.
 * @param value The current value of the field being validated.
 * @param editingId The ID of the item currently being edited (to exclude it from the check).
 * @returns An object containing the validation function and a loading state.
 */
export function useDuplicateValidation(
    tableName: string,
    columnName: string,
    value: string,
    editingId: string | null
) {
    const [isValidating, setIsValidating] = useState(false);
    const [isDuplicate, setIsDuplicate] = useState(false);

    useEffect(() => {
        const trimmedValue = value?.trim();
        if (!trimmedValue) {
            setIsDuplicate(false);
            return;
        }

        const checkUniqueness = async () => {
            setIsValidating(true);
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('id')
                    .eq(columnName, trimmedValue)
                    .maybeSingle();

                if (error) throw error;
                setIsDuplicate(!!(data && data.id !== editingId));
            } catch (err) {
                console.error(`Validation error for ${tableName}.${columnName}:`, err);
            } finally {
                setIsValidating(false);
            }
        };

        const timeoutId = setTimeout(checkUniqueness, 500);
        return () => clearTimeout(timeoutId);
    }, [value, tableName, columnName, editingId]);

    return { isDuplicate, isValidating };
}