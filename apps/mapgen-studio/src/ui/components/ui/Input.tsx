import React, { forwardRef } from 'react';
// ============================================================================
// INPUT
// ============================================================================
// Text input component following shadcn/ui patterns.
// ============================================================================
import { cn } from '../../utils/cn';
export interface InputProps extends
  React.InputHTMLAttributes<HTMLInputElement> {
  /** Light mode styling */
  lightMode?: boolean;
}
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, lightMode = false, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-7 w-full rounded border px-2.5 text-[11px] transition-colors',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-400 dark:placeholder:text-[#5a5a66]',
          'focus-visible:outline-none focus-visible:ring-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          lightMode ?
          'bg-white text-[#1f2937] border-gray-200 focus-visible:border-gray-300 focus-visible:ring-gray-300' :
          'bg-[#0f0f12] text-[#e8e8ed] border-[#2a2a32] focus-visible:border-[#3a3a44] focus-visible:ring-[#3a3a44]',
          className
        )}
        ref={ref}
        {...props} />);


  }
);
Input.displayName = 'Input';
export { Input };