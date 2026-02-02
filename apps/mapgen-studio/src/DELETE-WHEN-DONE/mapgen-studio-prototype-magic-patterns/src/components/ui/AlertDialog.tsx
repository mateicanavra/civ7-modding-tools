import React, { createContext, useContext } from 'react';
// ============================================================================
// ALERT DIALOG
// ============================================================================
// Confirmation dialog following shadcn/ui patterns.
// For full Radix AlertDialog, install @radix-ui/react-alert-dialog.
// ============================================================================
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';
// ============================================================================
// Context
// ============================================================================
interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lightMode: boolean;
}
const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);
const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog');
  }
  return context;
};
// ============================================================================
// Root
// ============================================================================
export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  lightMode?: boolean;
  children: React.ReactNode;
}
const AlertDialog: React.FC<AlertDialogProps> = ({
  open = false,
  onOpenChange = () => {},
  lightMode = false,
  children
}) => {
  return (
    <AlertDialogContext.Provider
      value={{
        open,
        onOpenChange,
        lightMode
      }}>

      {children}
    </AlertDialogContext.Provider>);

};
// ============================================================================
// Trigger
// ============================================================================
export interface AlertDialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}
const AlertDialogTrigger: React.FC<AlertDialogTriggerProps> = ({
  children
}) => {
  const { onOpenChange } = useAlertDialog();
  return (
    <span onClick={() => onOpenChange(true)} className="cursor-pointer">
      {children}
    </span>);

};
// ============================================================================
// Portal + Overlay + Content
// ============================================================================
export interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}
const AlertDialogContent: React.FC<AlertDialogContentProps> = ({
  children,
  className
}) => {
  const { open, onOpenChange, lightMode } = useAlertDialog();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 transition-opacity',
          lightMode ? 'bg-black/20' : 'bg-black/50'
        )}
        onClick={() => onOpenChange(false)} />


      {/* Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          className={cn(
            'relative w-full max-w-[320px] rounded-lg border p-5 shadow-xl',
            'animate-in fade-in-0 zoom-in-95',
            lightMode ?
            'bg-white border-gray-200 text-[#1f2937]' :
            'bg-[#141418] border-[#2a2a32] text-[#e8e8ed]',
            className
          )}
          onClick={(e) => e.stopPropagation()}>

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className={cn(
              'absolute right-3 top-3 p-1 rounded transition-colors',
              lightMode ?
              'text-gray-400 hover:text-gray-600 hover:bg-gray-100' :
              'text-[#5a5a66] hover:text-[#8a8a96] hover:bg-[#1a1a1f]'
            )}>

            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      </div>
    </div>);

};
// ============================================================================
// Header
// ============================================================================
export interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}
const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex flex-col gap-1.5 pr-6', className)}>
      {children}
    </div>);

};
// ============================================================================
// Title
// ============================================================================
export interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}
const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({
  children,
  className,
  icon
}) => {
  const { lightMode } = useAlertDialog();
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {icon &&
      <span className={lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]'}>
          {icon}
        </span>
      }
      <h2 className="font-semibold text-[14px]">{children}</h2>
    </div>);

};
// ============================================================================
// Description
// ============================================================================
export interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({
  children,
  className
}) => {
  const { lightMode } = useAlertDialog();
  return (
    <p
      className={cn(
        'text-[12px] leading-relaxed mt-2',
        lightMode ? 'text-[#6b7280]' : 'text-[#8a8a96]',
        className
      )}>

      {children}
    </p>);

};
// ============================================================================
// Footer
// ============================================================================
export interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}
const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-end gap-2 mt-5', className)}>
      {children}
    </div>);

};
// ============================================================================
// Action Buttons
// ============================================================================
export interface AlertDialogActionProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
const AlertDialogAction: React.FC<AlertDialogActionProps> = ({
  children,
  onClick,
  ...props
}) => {
  const { onOpenChange } = useAlertDialog();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onOpenChange(false);
  };
  return (
    <Button size="sm" onClick={handleClick} {...props}>
      {children}
    </Button>);

};
export interface AlertDialogCancelProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}
const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({
  children,
  onClick,
  ...props
}) => {
  const { onOpenChange } = useAlertDialog();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    onOpenChange(false);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleClick} {...props}>
      {children}
    </Button>);

};
// ============================================================================
// Exports
// ============================================================================
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel };