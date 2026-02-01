import React, { forwardRef } from 'react';
// ============================================================================
// SELECT
// ============================================================================
// Native select component styled to match shadcn/ui patterns.
// For a full Radix Select, install @radix-ui/react-select.
// ============================================================================
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';
export interface SelectProps extends
  React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Light mode styling */
  lightMode?: boolean;
  /** Options to render */
  options?: Array<{
    value: string;
    label: string;
  }>;
}
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, lightMode = false, options, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-7 w-full appearance-none rounded border pl-2.5 pr-8 text-[11px] transition-colors',
            'cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            lightMode ?
            'bg-white text-[#1f2937] border-gray-200 focus-visible:border-gray-300 focus-visible:ring-gray-300' :
            'bg-[#0f0f12] text-[#e8e8ed] border-[#2a2a32] focus-visible:border-[#3a3a44] focus-visible:ring-[#3a3a44]',
            className
          )}
          ref={ref}
          {...props}>

          {options ?
          options.map((opt) =>
          <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
          ) :
          children}
        </select>
        <ChevronDown
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none',
            lightMode ? 'text-gray-400' : 'text-[#5a5a66]'
          )} />

      </div>);

  }
);
Select.displayName = 'Select';
export { Select };