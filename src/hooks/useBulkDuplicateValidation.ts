import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabase/supabase'; // Assuming supabase client is available

interface UseBulkDuplicateValidationResult {
  duplicates: string[];
  isValidating: boolean;
}

/**
 * Custom hook to validate a bulk list of identifiers (serials/IMEIs) against a Supabase table.
 * It debounces the input and batches the database query for efficiency.
 *
 * @param tableName The name of the Supabase table to check (e.g., 'product_units').
 * @param columnName The name of the column to check for duplicates (e.g., 'serial_number', 'imei').
 * @param identifiers An array of unique identifiers to check.
 * @param excludeId An optional ID to exclude from the duplicate check (for update scenarios).
 * @param debounceTimeMs The debounce time in milliseconds before triggering the API call.
 * @param batchSize The maximum number of identifiers to send in a single database query.
 * @returns An object containing `duplicates` (array of found duplicates) and `isValidating` (boolean).
 */
export const useBulkDuplicateValidation = (
  tableName: string,
  columnName: string,
  identifiers: string[], // Changed to accept string[] directly
  excludeId: string | null = null,
  debounceTimeMs: number = 500,
  batchSize: number = 1000 // PostgreSQL IN clause limit can be large, but 1000 is a safe bet
): UseBulkDuplicateValidationResult => {
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [debouncedIdentifiers, setDebouncedIdentifiers] = useState<string[]>([]);

  // Step 1: Debounce the input array
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedIdentifiers(identifiers);
    }, debounceTimeMs);

    return () => {
      clearTimeout(handler);
    };
  }, [identifiers, debounceTimeMs]);

  // Step 2: Perform bulk validation against the database using the debounced identifiers
  useEffect(() => {
    const validate = async () => {
      if (debouncedIdentifiers.length === 0) {
        setDuplicates([]);
        setIsValidating(false);
        return;
      }

      setIsValidating(true);
      try {
        const foundDuplicates: string[] = [];

        // Chunking for very large batches
        for (let i = 0; i < debouncedIdentifiers.length; i += batchSize) {
          const chunk = debouncedIdentifiers.slice(i, i + batchSize);
          
          let query = supabase
            .from(tableName)
            .select(columnName)
            .in(columnName, chunk); // Use 'in' for bulk check

          if (excludeId) {
            query = query.neq('id', excludeId); // Exclude current item if updating
          }

          const { data, error } = await query;

          if (error) {
            console.error(`Error checking for duplicate ${columnName} in ${tableName}:`, error);
            continue; 
          }

          if (data && data.length > 0) {
            data.forEach((row: any) => {
              const value = row[columnName];
              if (value && debouncedIdentifiers.includes(value)) { // Ensure it's one of the identifiers we're checking
                foundDuplicates.push(value);
              }
            });
          }
        }
        setDuplicates(Array.from(new Set(foundDuplicates))); // Deduplicate found duplicates
      } catch (error) {
        console.error('Bulk duplicate validation failed:', error);
        setDuplicates([]); // On error, assume no duplicates or handle as per app logic
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [tableName, columnName, debouncedIdentifiers, excludeId, batchSize]);

  return { duplicates, isValidating };
};