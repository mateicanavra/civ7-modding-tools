/**
 * Canonical shadcn primitive library for MapGen Studio.
 *
 * Built ON the token system in `src/index.css` + the `cn` helper. Dense,
 * dark-first, borders-only; floating layers (dialog/popover/dropdown/tooltip/
 * toast) are the only surfaces that carry a shadow. Focus is the luminance
 * contour ring (`--ring`). No hardcoded palettes, no `lightMode` prop.
 *
 * Additive only: this barrel introduces the primitives; existing call sites
 * are migrated in a later slice.
 */
export { Button, buttonVariants, type ButtonProps } from "./button";
export { Input } from "./input";
export { Textarea } from "./textarea";
export { Label } from "./label";
export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "./select";
export { Switch } from "./switch";
export { Checkbox } from "./checkbox";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./tooltip";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./dialog";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
} from "./dropdown-menu";
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor } from "./popover";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
export { Separator } from "./separator";
export { ScrollArea, ScrollBar } from "./scroll-area";
export { Toaster } from "./sonner";
export { toast } from "sonner";
