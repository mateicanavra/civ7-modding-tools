import { useId, useState } from "react";
import { Button } from "../ui/button.js";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog.js";
import { Input } from "../ui/input.js";
import { Label } from "../ui/label.js";

export type MapConfigSaveDialogProps = Readonly<{
  open: boolean;
  initialName?: string;
  initialDescription?: string;
  onCancel: () => void;
  onConfirm: (args: { name: string; description?: string }) => void;
}>;

export function MapConfigSaveDialog(props: MapConfigSaveDialogProps) {
  const { open, initialName, initialDescription, onCancel, onConfirm } = props;
  const [name, setName] = useState(initialName ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");
  const [previous, setPrevious] = useState({ open, initialName, initialDescription });
  const nameId = useId();
  const descriptionId = useId();

  if (
    previous.open !== open ||
    previous.initialName !== initialName ||
    previous.initialDescription !== initialDescription
  ) {
    setPrevious({ open, initialName, initialDescription });
    if (open) {
      setName(initialName ?? "");
      setDescription(initialDescription ?? "");
    }
  }

  const canSave = name.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Config</DialogTitle>
          <DialogDescription>Choose a name for this config.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <Label
              htmlFor={nameId}
              className="mb-1 block text-label uppercase tracking-wide text-muted-foreground"
            >
              Name
            </Label>
            <Input id={nameId} value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <Label
              htmlFor={descriptionId}
              className="mb-1 block text-label uppercase tracking-wide text-muted-foreground"
            >
              Description (optional)
            </Label>
            <Input
              id={descriptionId}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!canSave}
            onClick={() =>
              onConfirm({
                name: name.trim(),
                ...(description.trim() === "" ? {} : { description: description.trim() }),
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
