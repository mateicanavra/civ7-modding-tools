import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Input,
} from "../../ui/components/ui";

export type PresetErrorDialogProps = Readonly<{
  open: boolean;
  title: string;
  message: string;
  details?: ReadonlyArray<string>;
  lightMode: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export function PresetErrorDialog(props: PresetErrorDialogProps) {
  const { open, title, message, details, lightMode, onOpenChange } = props;
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange} lightMode={lightMode}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        {details && details.length > 0 ? (
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-black/5 p-2 text-[10px] leading-relaxed">
            {details.join("\n")}
          </pre>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type PresetSaveDialogProps = Readonly<{
  open: boolean;
  lightMode: boolean;
  initialLabel?: string;
  initialDescription?: string;
  onCancel: () => void;
  onConfirm: (args: { label: string; description?: string }) => void;
}>;

export function PresetSaveDialog(props: PresetSaveDialogProps) {
  const { open, lightMode, initialLabel, initialDescription, onCancel, onConfirm } = props;
  const [label, setLabel] = useState(initialLabel ?? "");
  const [description, setDescription] = useState(initialDescription ?? "");

  useEffect(() => {
    if (open) {
      setLabel(initialLabel ?? "");
      setDescription(initialDescription ?? "");
    }
  }, [open, initialLabel, initialDescription]);

  const canSave = label.trim().length > 0;

  return (
    <AlertDialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)} lightMode={lightMode}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save Preset</AlertDialogTitle>
          <AlertDialogDescription>Choose a name for this preset.</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-3 space-y-2">
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wide">Label</div>
            <Input
              lightMode={lightMode}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Preset label"
            />
          </div>
          <div>
            <div className="mb-1 text-[10px] uppercase tracking-wide">Description (optional)</div>
            <Input
              lightMode={lightMode}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canSave}
            onClick={() => {
              if (!canSave) return;
              onConfirm({ label: label.trim(), description: description.trim() || undefined });
            }}
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export type PresetConfirmDialogProps = Readonly<{
  open: boolean;
  lightMode: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}>;

export function PresetConfirmDialog(props: PresetConfirmDialogProps) {
  const { open, lightMode, title, message, confirmLabel, onCancel, onConfirm } = props;
  return (
    <AlertDialog open={open} onOpenChange={(next) => (!next ? onCancel() : undefined)} lightMode={lightMode}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
