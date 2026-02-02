import React, { forwardRef } from 'react';
// ============================================================================
// SWITCH
// ============================================================================
// Toggle switch component following shadcn/ui patterns.
// For full Radix Switch, install @radix-ui/react-switch.
// ============================================================================
import { cn } from '../../utils/cn';
export interface SwitchProps extends
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Light mode styling */
  lightMode?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}
const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          {...props} />

        <div
          className={cn(
            'h-5 w-9 rounded-full transition-colors',
            'peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-gray-400 peer-focus-visible:ring-offset-2',
            'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
            'after:content-[""] after:absolute after:top-0.5 after:start-[2px]',
            'after:h-4 after:w-4 after:rounded-full after:transition-all',
            'peer-checked:after:translate-x-full',
            lightMode ?
            'bg-gray-200 peer-checked:bg-[#4b5563] after:bg-white after:border-gray-300 after:border' :
            'bg-[#2a2a32] peer-checked:bg-[#4b5563] after:bg-[#e8e8ed] after:border-[#3a3a44] after:border',
            className
          )} />

      </label>);

  }
);
Switch.displayName = 'Switch';
export { Switch };