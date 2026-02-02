import React, { forwardRef } from 'react';
// ============================================================================
// BUTTON
// ============================================================================
// Flexible button component with variants following shadcn/ui patterns.
// ============================================================================
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
        'bg-[#4b5563] text-white border border-[#4b5563] hover:bg-[#374151] active:bg-[#1f2937]',
        destructive:
        'bg-red-500 text-white border border-red-600 hover:bg-red-600',
        outline:
        'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 dark:border-[#2a2a32] dark:bg-[#1a1a1f] dark:text-[#e8e8ed] dark:hover:bg-[#222228] dark:active:bg-[#2a2a32]',
        secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-[#222228] dark:text-[#e8e8ed] dark:hover:bg-[#2a2a32]',
        ghost:
        'hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-[#1a1a1f] dark:hover:text-[#e8e8ed]',
        link: 'text-gray-900 underline-offset-4 hover:underline dark:text-[#e8e8ed]'
      },
      size: {
        default: 'h-8 px-3 py-2',
        sm: 'h-7 px-2.5 text-xs',
        lg: 'h-9 px-4',
        icon: 'h-7 w-7'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);
export interface ButtonProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonVariants({
            variant,
            size,
            className
          })
        )}
        ref={ref}
        {...props} />);


  }
);
Button.displayName = 'Button';
export { Button, buttonVariants };