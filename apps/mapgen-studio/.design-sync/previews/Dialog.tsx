import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "mapgen-studio";

// Dialog is a modal on the floating tier (Radix portal → dimmed scrim + blurred
// panel). Rendered open so the card shows the real modal state; see the
// `cardMode: single` override so the portal content stays inside the card.
export const SavePreset = () => (
  <Dialog defaultOpen>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Save preset</DialogTitle>
        <DialogDescription>
          Capture the current recipe and config overrides as a reusable preset. A
          preset with the same name will be overwritten.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button>Save preset</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
