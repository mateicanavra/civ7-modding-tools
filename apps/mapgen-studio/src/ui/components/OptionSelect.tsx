import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui";

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
}

/**
 * `OptionSelect` — a thin, token-driven adapter over the design-system Radix
 * `Select` (`src/components/ui/select`). It preserves the simple
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
}: OptionSelectProps) {
  const toRadix = (raw: string) => (raw === "" ? EMPTY_VALUE_SENTINEL : raw);
  const fromRadix = (raw: string) => (raw === EMPTY_VALUE_SENTINEL ? "" : raw);

  return (
    <Select
      value={toRadix(value)}
      onValueChange={(next) => onValueChange(fromRadix(next))}
      disabled={disabled}
    >
      <SelectTrigger aria-label={ariaLabel} className={className}>
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
