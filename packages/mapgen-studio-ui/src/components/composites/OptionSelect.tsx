import type * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";

export interface OptionSelectProps {
  /** Current selected value (controlled). */
  value: string;
  /** Called with the next value when the selection changes. */
  onValueChange: (value: string) => void;
  /** Options to render. */
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Accessible label for the trigger. */
  ariaLabel: string;
  /** Placeholder shown when no value is selected. */
  placeholder?: string;
  /** Trigger width / sizing classes. */
  className?: string;
  /** Whether the control is disabled. */
  disabled?: boolean;
  /** Form-submission name, forwarded to the Radix Select root. */
  name?: string;
  /**
   * Extra trigger attributes (id, aria-describedby/aria-invalid wiring) for
   * hosts that associate the trigger with external labels or error regions —
   * the schema-form widget path. `ariaLabel`/`className` win on collision.
   */
  triggerProps?: React.ComponentPropsWithoutRef<typeof SelectTrigger>;
}

/**
 * `OptionSelect` — a thin, token-driven adapter over this package's Radix
 * `Select` primitive. It preserves the simple
 * `value` / `onValueChange` / `options` shape the studio chrome used with the
 * legacy native `<select>`, so call sites migrate without restructuring while
 * dropping the off-token hex + `lightMode` prop. Radix requires non-empty
 * `value`s, so an empty option value is mapped to a reserved sentinel internally
 * (it round-trips back to `""` on change) — the visible behavior (placeholder +
 * "no selection") is unchanged.
 */
const EMPTY_VALUE_SENTINEL = "__option-select-empty__";

export function OptionSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  placeholder,
  className,
  disabled,
  name,
  triggerProps,
}: OptionSelectProps) {
  const toRadix = (raw: string) => (raw === "" ? EMPTY_VALUE_SENTINEL : raw);
  const fromRadix = (raw: string) => (raw === EMPTY_VALUE_SENTINEL ? "" : raw);

  return (
    <Select
      name={name}
      value={toRadix(value)}
      onValueChange={(next) => onValueChange(fromRadix(next))}
      disabled={disabled}
    >
      <SelectTrigger {...triggerProps} aria-label={ariaLabel} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={toRadix(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
