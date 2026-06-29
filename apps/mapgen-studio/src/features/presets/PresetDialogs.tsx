import { useState } from "react";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "../../components/ui";

/**
 * Preset dialogs — error / save / confirm flows, migrated from the legacy
 * hand-rolled AlertDialog to the token-driven shadcn Dialog. Open/confirm/cancel
 * semantics are preserved: `onOpenChange` keeps the same open-state contract,
 * Cancel/Close use a DialogClose, and the confirm action invokes the caller's
 * callback. The dialogs are token-driven via the single `.dark` class — there is
 * no `lightMode` prop (the legacy one was unused and has been removed).
 */

export type PresetErrorDialogProps = Readonly<{
  open: boolean;
  title: string;
  message: string;
  details?: ReadonlyArray<string>;
  onOpenChange: (open: boolean) => void;
}>;

export function PresetErrorDialog(props: PresetErrorDialogProps) {
  const { open, title, message, details, onOpenChange } = props;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        {details && details.length > 0 ? (
          <pre className="mt-1 max-h-48 overflow-auto rounded bg-surface-sunken p-2 text-label leading-relaxed text-muted-foreground">
            {details.join("\n")}
          </pre>
        ) : null}
        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type PresetSaveDialogProps = Readonly<{
  open: boolean;
  initialLabel?: string;
  initialDescription?: string;
  onCancel: () => void;
  onConfirm: (args: { label: string; description?: string }) => void;
}>;

export function PresetSaveDialog(props: PresetSaveDialogProps) {
  const { open, initialLabel, initialDescription, onCancel, onConfirm } = props;
  const [label, setLabel] = useState(initialLabel ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");

  // Re-sync the inputs to the incoming initials whenever the dialog opens or its
  // initials change while open — done during render via the store-prev-value
  // pattern instead of in an effect (react-hooks/set-state-in-effect). Parity:
  // fires on the same dep transitions as the prior effect; mount is a no-op
  // because the useState initializers above already seed label/description from
  // the initials.
  const [prevInitials, setPrevInitials] = useState({ open, initialLabel, initialDescription });
  if (
    prevInitials.open !== open ||
    prevInitials.initialLabel !== initialLabel ||
    prevInitials.initialDescription !== initialDescription
  ) {
    setPrevInitials({ open, initialLabel, initialDescription });
    if (open) {
      setLabel(initialLabel ?? "");
      setDescription(initialDescription ?? "");
    }
  }

  const canSave = label.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Config</DialogTitle>
          <DialogDescription>Choose a name for this config.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <div className="mb-1 text-label uppercase tracking-wide text-muted-foreground">
              Label
            </div>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Config name"
            />
          </div>
          <div>
            <div className="mb-1 text-label uppercase tracking-wide text-muted-foreground">
              Description (optional)
            </div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onConfirm({ label: label.trim(), description: description.trim() || undefined });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type PresetConfirmDialogProps = Readonly<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function PresetConfirmDialog(props: PresetConfirmDialogProps) {
  const { open, title, message, confirmLabel, onCancel, onConfirm } = props;
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
