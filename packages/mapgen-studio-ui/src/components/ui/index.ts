/**
 * Canonical shadcn primitive library for MapGen Studio.
 *
 * Built ON the token system in `src/styles/theme.css` + the `cn` helper.
 * Dense, dark-first, borders-only; floating layers (dialog/popover/dropdown/
 * tooltip/toast) are the only surfaces that carry a shadow. Focus is the
 * luminance contour ring (`--ring`). No hardcoded palettes, no `lightMode`
 * prop.
 *
 * One third-party value re-export: `toast` (LEDGER adjudication 8, amended
 * 2026-07-21). Repo consumers may still import `toast` from "sonner" directly
 * (npm resolves both paths to the same instance), but the compiled design
 * bundle inlines its own sonner copy — without a same-instance `toast` on the
 * public surface, the bundle's `Toaster` is unreachable and notifications are
 * impossible in designs. `toast` and `Toaster` must ride the same barrel.
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
export { toast } from "sonner";
export { Switch } from "./switch.js";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs.js";
export { Textarea } from "./textarea.js";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.js";
