import React, { forwardRef } from 'react';
// ============================================================================
// TEXTAREA
// ============================================================================
// Textarea component following shadcn/ui patterns.
// ============================================================================
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Light mode styling */
  lightMode?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, lightMode = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[72px] w-full rounded border px-2.5 py-2 text-[11px] transition-colors',
          'placeholder:text-gray-400 dark:placeholder:text-[#5a5a66]',
          'focus-visible:outline-none focus-visible:ring-1',
          'disabled:cursor-not-allowed disabled:opacity-50',
          lightMode
            ? 'bg-white text-[#1f2937] border-gray-200 focus-visible:border-gray-300 focus-visible:ring-gray-300'
            : 'bg-[#0f0f12] text-[#e8e8ed] border-[#2a2a32] focus-visible:border-[#3a3a44] focus-visible:ring-[#3a3a44]',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
