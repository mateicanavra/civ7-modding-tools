import type { RJSFSchema, WidgetProps } from "@rjsf/utils";
import { deepEquals } from "@rjsf/utils";
import { Undo2 } from "lucide-react";
import { use } from "react";
import { cn } from "../../lib/utils.js";
import { Checkbox } from "../ui/checkbox.js";
import { Input } from "../ui/input.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.js";
import { Switch } from "../ui/switch.js";
import { Textarea } from "../ui/textarea.js";
import { type FieldBaseline, FieldBaselineContext } from "./fieldBaseline.js";
import { errorFieldId } from "./fieldIds.js";
import type { BrowserConfigFormContext } from "./rjsfTemplates.js";
import { humanizeSchemaLabel } from "./schemaPresentation.js";

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

// Per-field working-change feedback (flat-and-flush delta 9, re-keyed): a
// field whose live value differs from the LOADED config's value (the
// `FieldBaselineContext` baseline — never the schema default) wears the design
// system's established drifted treatment (verbatim from GameConsole's
// savedConfigModified) and offers a one-field undo back to that loaded value.
// Dirtiness re-derives on every controlled value change — no effects, no blur
// gating. No baseline in context ⇒ no drift treatment and no undo.
const DRIFT_CLASSES = "border-warning text-warning ring-1 ring-warning/40";

function fieldDrift(baseline: FieldBaseline | null, value: unknown) {
  // null and undefined both mean "empty" here (rjsf emptyValue vs an absent
  // baseline key) — normalize both sides so an empty field with an empty
  // baseline reads clean, not perpetually dirty.
  return baseline !== null && !deepEquals(value ?? undefined, baseline.value ?? undefined);
}

/**
 * The one-field undo affordance, overlaid INSIDE the field's own box (an
 * absolutely positioned sibling in a `relative` wrapper — never a flex
 * sibling, which would steal width from this field's value column and break
 * the equal-width grid; never a nested button inside the Select trigger,
 * which is invalid HTML). The element stays mounted and flips `invisible`
 * when clean so the slot never reflows — the host control must permanently
 * reserve the strip the icon sits in (input `pr-8`; select value-span
 * `mr-6`) so content NEVER runs underneath it.
 */
function FieldUndoButton(args: {
  dirty: boolean;
  disabled: boolean | undefined;
  label: string;
  positionClass: string;
  onUndo: () => void;
}) {
  return (
    <button
      type="button"
      disabled={args.disabled}
      aria-label={`Undo changes to ${humanizeSchemaLabel(args.label)}`}
      onClick={args.onUndo}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-warning transition-colors hover:bg-warning/10",
        args.positionClass,
        !args.dirty && "invisible"
      )}
    >
      <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
    </button>
  );
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
    label,
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
  const baseline = use(FieldBaselineContext);
  const dirty = fieldDrift(baseline, value);
  // The undo strip is reserved permanently: `pr-8` pads the value away from
  // it and the native webkit/moz spinners are suppressed (they render inside
  // the input's right edge — exactly the strip the icon owns).
  return (
    <div className="relative">
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
        className={cn(
          "pr-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          dirty && DRIFT_CLASSES
        )}
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
      <FieldUndoButton
        dirty={dirty}
        disabled={disabled || readonly}
        label={label || name}
        positionClass="right-1.5"
        onUndo={() => onChange(baseline?.value)}
      />
    </div>
  );
}

export function SelectWidget(props: ConfigWidgetProps) {
  const { id, name, label, value, disabled, readonly, onChange, options, placeholder, rawErrors } =
    props;
  const enumOptions = (options.enumOptions ?? []) as Array<{ value: unknown; label: string }>;
  const map = new Map(enumOptions.map((opt) => [String(opt.value), opt.value]));
  const selectedKey = value === undefined || value === null ? "" : String(value);
  const toRadix = (raw: string) => (raw === "" ? SELECT_EMPTY_SENTINEL : raw);
  const baseline = use(FieldBaselineContext);
  const dirty = fieldDrift(baseline, value);

  // The undo icon tucks into the strip just left of the chevron. That strip
  // is reserved for real: the value span's `mr-6` caps the clamped text
  // before it, so a long value ellipsizes instead of running under the icon.
  // No trigger padding change — padding would shrink the trigger's inner flex
  // row and drag the chevron off flush-right.
  return (
    <div className="relative">
      <Select
        name={name}
        disabled={disabled || readonly}
        value={toRadix(selectedKey)}
        onValueChange={(next) => {
          const key = next === SELECT_EMPTY_SENTINEL ? "" : next;
          onChange(map.has(key) ? map.get(key) : key);
        }}
      >
        <SelectTrigger
          id={id}
          aria-label={placeholder ?? name}
          className={cn("[&>span]:mr-6", dirty && DRIFT_CLASSES)}
          {...errorA11yProps(id, rawErrors)}
        >
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
      <FieldUndoButton
        dirty={dirty}
        disabled={disabled || readonly}
        label={label || name}
        positionClass="right-8"
        onUndo={() => onChange(baseline?.value)}
      />
    </div>
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
  // luminance contour ring on focus. Active pills merge through `cn` so the
  // active bg/border/text/hover utilities RESOLVE over the base ones
  // (tailwind-merge last-wins) instead of emitting both and leaning on
  // stylesheet order — this was the one render-affecting manual join in the
  // package (LEDGER adjudication 4).
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
            className={cn(baseTag, isActive && activeTag)}
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
