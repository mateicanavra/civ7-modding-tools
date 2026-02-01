// ============================================================================
// UI COMPONENTS INDEX
// ============================================================================
// Shared UI primitives following shadcn/ui patterns.
// ============================================================================

// Dialogs
export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  type AlertDialogProps } from
'./AlertDialog';

// Form controls
export { Button, buttonVariants, type ButtonProps } from './Button';
export { Input, type InputProps } from './Input';
export { Select, type SelectProps } from './Select';
export { Checkbox, type CheckboxProps } from './Checkbox';
export { Switch, type SwitchProps } from './Switch';

// Feedback
export { Tooltip, type TooltipProps } from './Tooltip';
export {
  ToastProvider,
  useToast,
  showToast,
  type ToastProviderProps } from
'./Toast';