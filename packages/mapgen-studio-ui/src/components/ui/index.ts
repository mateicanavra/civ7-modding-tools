/**
 * Canonical shadcn primitive library for MapGen Studio.
 *
 * Built ON the token system in `src/styles/theme.css` + the `cn` helper.
 * Dense, dark-first, borders-only; floating layers (dialog/popover/dropdown/
 * tooltip/toast) are the only surfaces that carry a shadow. Focus is the
 * luminance contour ring (`--ring`). No hardcoded palettes, no `lightMode`
 * prop.
 *
 * Value-clean: NO `toast` re-export (LEDGER adjudication 8) — consumers that
 * fire toasts import `toast` from "sonner" directly; this sub-barrel ships
 * only the package's own components.
 */

export { Button, type ButtonProps, buttonVariants } from "./button.js";
export { Checkbox } from "./checkbox.js";
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog.js";
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu.js";
export { Input } from "./input.js";
export { Label } from "./label.js";
export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover.js";
export { ScrollArea, ScrollBar } from "./scroll-area.js";
export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select.js";
export { Separator } from "./separator.js";
export { Toaster } from "./sonner.js";
export { Switch } from "./switch.js";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";
export { Textarea } from "./textarea.js";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.js";
