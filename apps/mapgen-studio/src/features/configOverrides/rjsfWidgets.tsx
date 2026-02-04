import type { WidgetProps, RJSFSchema } from "@rjsf/utils";
import { Checkbox, Input, Select, Switch } from "../../ui/components/ui";
import type { BrowserConfigFormContext } from "./rjsfTemplates";

type ConfigWidgetProps = WidgetProps<unknown, RJSFSchema, BrowserConfigFormContext>;

function getLightMode(props: ConfigWidgetProps): boolean {
  return Boolean(props.formContext?.lightMode);
}

function normalizeEmptyValue(
  next: string,
  emptyValue: unknown
): string | unknown {
  return next === "" ? emptyValue : next;
}

export function TextWidget(props: ConfigWidgetProps) {
  const lightMode = getLightMode(props);
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
  } = props;
  return (
    <Input
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      lightMode={lightMode}
      type={type ?? "text"}
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        onChange(normalizeEmptyValue(event.target.value, options.emptyValue));
      }}
    />
  );
}

export function TextareaWidget(props: ConfigWidgetProps) {
  const { id, name, autoComplete, value, required, disabled, readonly, autofocus, onChange, options, placeholder } =
    props;
  return (
    <textarea
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      className="bc-textarea"
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(event) => {
        onChange(normalizeEmptyValue(event.target.value, options.emptyValue));
      }}
    />
  );
}

export function NumberWidget(props: ConfigWidgetProps) {
  const lightMode = getLightMode(props);
  const { id, name, autoComplete, value, required, disabled, readonly, autofocus, onChange, options, placeholder } =
    props;
  return (
    <Input
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      lightMode={lightMode}
      type="number"
      inputMode="decimal"
      spellCheck={false}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={value ?? ""}
      placeholder={placeholder}
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
  const lightMode = getLightMode(props);
  const { id, name, autoComplete, value, required, disabled, readonly, autofocus, onChange, options, placeholder } =
    props;
  const enumOptions = (options.enumOptions ?? []) as Array<{ value: unknown; label: string }>;
  const map = new Map(enumOptions.map((opt) => [String(opt.value), opt.value]));
  const selectedKey = value === undefined || value === null ? "" : String(value);

  return (
    <Select
      id={id}
      name={name}
      autoComplete={autoComplete ?? "off"}
      lightMode={lightMode}
      required={required}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      value={selectedKey}
      onChange={(event) => {
        const next = event.target.value;
        onChange(map.has(next) ? map.get(next) : next);
      }}
    >
      {placeholder ? (
        <option value="" disabled>
          {placeholder}
        </option>
      ) : null}
      {enumOptions.map((opt) => (
        <option key={String(opt.value)} value={String(opt.value)}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}

export function CheckboxWidget(props: ConfigWidgetProps) {
  const lightMode = getLightMode(props);
  const { id, name, value, disabled, readonly, autofocus, onChange } = props;
  return (
    <Checkbox
      id={id}
      name={name}
      lightMode={lightMode}
      checked={Boolean(value)}
      autoFocus={autofocus}
      disabled={disabled || readonly}
      onCheckedChange={(checked) => onChange(checked)}
    />
  );
}

export function SwitchWidget(props: ConfigWidgetProps) {
  const lightMode = getLightMode(props);
  const { id, name, value, disabled, readonly, autofocus, onChange } = props;
  return (
    <Switch
      id={id}
      name={name}
      lightMode={lightMode}
      checked={Boolean(value)}
      autoFocus={autofocus}
      disabled={disabled || readonly}
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

  return (
    <div className="bc-tagList">
      {enumOptions.map((opt) => {
        const key = String(opt.value);
        const isActive = selectedKeys.has(key);
        return (
          <button
            key={key}
            type="button"
            className={["bc-tag", isActive ? "bc-tagActive" : null].filter(Boolean).join(" ")}
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
  SelectWidget,
  CheckboxWidget,
  CheckboxesWidget: TagSelectWidget,
  UpDownWidget: NumberWidget,
  RangeWidget: NumberWidget,
  PasswordWidget: TextWidget,
  switch: SwitchWidget,
  tagSelect: TagSelectWidget,
};
