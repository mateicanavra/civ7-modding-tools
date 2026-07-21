import { useState } from "react";

/**
 * Optional-controlled state: controlled when the prop is provided, otherwise
 * self-managed from `defaultValue`. `onChange` always fires; the local copy
 * updates only while uncontrolled — a controlled parent that ignores
 * `onChange` therefore fully owns the value (no half-controlled drift), which
 * is the contract every panel's expansion/editing props rely on.
 */
export function useControllableState<T>(args: {
  value: T | undefined;
  defaultValue: T;
  onChange?: (next: T) => void;
}): [T, (next: T) => void] {
  const { value, defaultValue, onChange } = args;
  const [local, setLocal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : local;
  const set = (next: T) => {
    onChange?.(next);
    if (!controlled) setLocal(next);
  };
  return [current, set];
}
