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

export { toast } from "sonner";
export { Button, type ButtonProps, buttonVariants } from "./button";
export { Checkbox } from "./checkbox";
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
} from "./dialog";
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
} from "./dropdown-menu";
export { Input } from "./input";
export { Label } from "./label";
export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";
export { ScrollArea, ScrollBar } from "./scroll-area";
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
} from "./select";
export { Separator } from "./separator";
export { Toaster } from "./sonner";
export { Switch } from "./switch";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Textarea } from "./textarea";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
