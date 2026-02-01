import React, { useState } from 'react';
// ============================================================================
// TOOLTIP
// ============================================================================
// Simple tooltip component following shadcn/ui patterns.
// For full Radix Tooltip, install @radix-ui/react-tooltip.
// ============================================================================
import { cn } from '../../utils/cn';
export interface TooltipProps {
  /** Content to show in tooltip */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Side to show tooltip */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Light mode styling */
  lightMode?: boolean;
  /** Additional class names */
  className?: string;
}
const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  lightMode = false,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };
  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}>

      {children}
      {isVisible &&
      <div
        role="tooltip"
        className={cn(
          'absolute z-50 px-2 py-1 text-[10px] font-medium rounded shadow-md whitespace-nowrap',
          'animate-in fade-in-0 zoom-in-95',
          positionClasses[side],
          lightMode ?
          'bg-gray-900 text-white' :
          'bg-[#e8e8ed] text-[#0f0f12]',
          className
        )}>

          {content}
        </div>
      }
    </div>);

};
export { Tooltip };