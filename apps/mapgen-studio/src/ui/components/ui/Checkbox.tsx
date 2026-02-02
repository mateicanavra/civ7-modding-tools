import React, { forwardRef } from 'react';
// ============================================================================
// CHECKBOX
// ============================================================================
// Checkbox component following shadcn/ui patterns.
// For full Radix Checkbox, install @radix-ui/react-checkbox.
// ============================================================================
import { Check } from 'lucide-react';
import { cn } from '../../utils/cn';
export interface CheckboxProps extends
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Light mode styling */
  lightMode?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
  {
    className,
    lightMode = false,
    checked,
    onCheckedChange,
    onChange,
    ...props
  },
  ref) =>
  {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };
    return (
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props} />

        <div
          className={cn(
            'h-4 w-4 shrink-0 rounded border transition-colors cursor-pointer',
            'peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-gray-400',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            'flex items-center justify-center',
            lightMode ?
            'border-gray-300 bg-white peer-checked:bg-[#4b5563] peer-checked:border-[#4b5563]' :
            'border-[#3a3a44] bg-[#0f0f12] peer-checked:bg-[#4b5563] peer-checked:border-[#4b5563]',
            className
          )}
          onClick={() => {
            const input = ref && 'current' in ref ? ref.current : null;
            if (input) input.click();
          }}>

          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
      </div>);

  }
);
Checkbox.displayName = 'Checkbox';
export { Checkbox };