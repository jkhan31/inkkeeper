// Filename: app/utils/cn.ts
// Directory: app/utils/
// Purpose: Utility function to conditionally combine Tailwind CSS classes using clsx and tailwind-merge.
// This ensures that conflicting classes are resolved correctly (e.g., 'p-4' and 'p-8').

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Conditionally combines class names, resolving Tailwind conflicts.
 * This is the standard utility for clean NativeWind/Tailwind usage.
 * @param inputs - An array of class names to merge.
 * @returns A single, clean string of optimized Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}