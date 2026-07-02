import type { RJSFSchema, WidgetProps } from "@rjsf/utils";
import { Checkbox } from "../ui/checkbox.js";
import { Input } from "../ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { Switch } from "../ui/switch.js";
import { Textarea } from "../ui/textarea.js";
import { errorFieldId } from "./fieldIds.js";
import type { BrowserConfigFormContext } from "./rjsfTemplates.js";

type ConfigWidgetProps = WidgetProps<unknown, RJSFSchema, BrowserConfigFormContext>;

/**
 * RJSF widgets skinned onto this package's ui primitives — token-driven,
 * dark-first, no `lightMode` prop and no off-token `ring-gray-400`. The value
 * plumbing (`onChange`, `emptyValue` normalization, enum mapping) is the
 * contract: the authored config the form emits is exactly what the schema
 * round-trip expects.
 */

// Radix Select disallows an empty `value`; the schema enum's "no selection"
// placeholder maps to this reserved sentinel internally and round-trips back to
// the real empty selection on change.
const SELECT_EMPTY_SENTINEL = "__rjsf-select-empty__";

function normalizeEmptyValue(next: string, emptyValue: unknown): string | unknown {
  return next === "" ? emptyValue : next;
}

// Validation a11y: when RJSF reports `rawErrors` for a field, mark the control
// invalid and point it at the FieldTemplate's error live region (the shared
// `errorFieldId` contract — see `fieldIds.ts`) so assistive tech announces the
// error against the input. Presentation only — no value plumbing changes.
function errorA11yProps(
  id: string,
  rawErrors: ReadonlyArray<string> | undefined
): { "aria-invalid"?: true; "aria-describedby"?: string } {
  return rawErrors && rawErrors.length > 0
    ? { "aria-invalid": true, "aria-describedby": errorFieldId(id) }
    : {};
}

export function TextWidget(props: ConfigWidgetProps) {
  const {
    id,
    name,
    autoComplete,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    options,
    placeholder,
    type,
    rawErrors,
  } = props;
  return (
    <Input
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      type={type ?? "text"}
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={(value as string | undefined) ?? ""}
      placeholder={placeholder}
      {...errorA11yProps(id, rawErrors)}
      onChange={(event) => {
        onChange(normalizeEmptyValue(event.target.value, options.emptyValue));
      }}
    />
  );
}

export function TextareaWidget(props: ConfigWidgetProps) {
  const {
    id,
    name,
    autoComplete,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    options,
    placeholder,
    rawErrors,
  } = props;
  return (
    <Textarea
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={(value as string | undefined) ?? ""}
      placeholder={placeholder}
      {...errorA11yProps(id, rawErrors)}
      onChange={(event) => {
        onChange(normalizeEmptyValue(event.target.value, options.emptyValue));
      }}
    />
  );
}

export function NumberWidget(props: ConfigWidgetProps) {
  const {
    id,
    name,
    autoComplete,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    options,
    placeholder,
    rawErrors,
  } = props;
  return (
    <Input
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      type="number"
      inputMode="decimal"
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={(value as number | string | undefined) ?? ""}
      placeholder={placeholder}
      {...errorA11yProps(id, rawErrors)}
      onChange={(event) => {
        const next = event.target.value;
        if (next === "") {
          onChange(options.emptyValue);
          return;
        }
        const parsed = Number(next);
        onChange(Number.isNaN(parsed) ? options.emptyValue : parsed);
      }}
    />
  );
}

export function SelectWidget(props: ConfigWidgetProps) {
  const { id, name, value, disabled, readonly, onChange, options, placeholder, rawErrors } = props;
  const enumOptions = (options.enumOptions ?? []) as Array<{ value: unknown; label: string }>;
  const map = new Map(enumOptions.map((opt) => [String(opt.value), opt.value]));
  const selectedKey = value === undefined || value === null ? "" : String(value);
  const toRadix = (raw: string) => (raw === "" ? SELECT_EMPTY_SENTINEL : raw);

  return (
    <Select
      name={name}
      disabled={disabled || readonly}
      value={toRadix(selectedKey)}
      onValueChange={(next) => {
        const key = next === SELECT_EMPTY_SENTINEL ? "" : next;
        onChange(map.has(key) ? map.get(key) : key);
      }}
    >
      <SelectTrigger id={id} aria-label={placeholder ?? name} {...errorA11yProps(id, rawErrors)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {enumOptions.map((opt) => (
          <SelectItem key={String(opt.value)} value={toRadix(String(opt.value))}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CheckboxWidget(props: ConfigWidgetProps) {
  const { id, name, value, disabled, readonly, autofocus, onChange, rawErrors } = props;
  return (
    <Checkbox
      id={id}
      name={name}
      checked={Boolean(value)}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      {...errorA11yProps(id, rawErrors)}
      onCheckedChange={(checked) => onChange(checked === true)}
    />
  );
}

export function SwitchWidget(props: ConfigWidgetProps) {
  const { id, name, value, disabled, readonly, autofocus, onChange, rawErrors } = props;
  return (
    <Switch
      id={id}
      name={name}
      checked={Boolean(value)}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      {...errorA11yProps(id, rawErrors)}
      onCheckedChange={(checked) => onChange(checked)}
    />
  );
}

export function TagSelectWidget(props: ConfigWidgetProps) {
  const { value, disabled, readonly, onChange, options } = props;
  const enumOptions = (options.enumOptions ?? []) as Array<{ value: unknown; label: string }>;
  const allowMutations = !disabled && !readonly;
  const selected = Array.isArray(value) ? value : [];
  const selectedKeys = new Set(selected.map((entry) => String(entry)));
  const map = new Map(enumOptions.map((opt) => [String(opt.value), opt.value]));
  // Token-driven pill: muted inset substrate, primary fill when active, the
  // luminance contour ring on focus.
  const baseTag =
    "px-2 py-1 text-data rounded-full border border-input bg-input-background text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
  const activeTag = "bg-primary text-primary-foreground border-primary hover:bg-primary/90";

  return (
    <div className="flex flex-wrap gap-2">
      {enumOptions.map((opt) => {
        const key = String(opt.value);
        const isActive = selectedKeys.has(key);
        return (
          <button
            key={key}
            type="button"
            className={[baseTag, isActive ? activeTag : null].filter(Boolean).join(" ")}
            aria-pressed={isActive}
            disabled={!allowMutations}
            onClick={() => {
              if (!allowMutations) return;
              const next = new Set(selectedKeys);
              if (isActive) {
                next.delete(key);
              } else {
                next.add(key);
              }
              const resolved = [...next].map((entry) => map.get(entry) ?? entry);
              onChange(resolved);
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export const configWidgets = {
  TextWidget,
  TextareaWidget,
  textarea: TextareaWidget,
  SelectWidget,
  CheckboxWidget,
  CheckboxesWidget: TagSelectWidget,
  UpDownWidget: NumberWidget,
  RangeWidget: NumberWidget,
  PasswordWidget: TextWidget,
  switch: SwitchWidget,
  tagSelect: TagSelectWidget,
};
