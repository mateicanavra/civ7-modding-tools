import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { Theme } from "../../ui/types";
import { FieldRow } from "../../ui/components/fields";
import { pathToPointer, type BrowserConfigSchemaDef } from "./schemaPresentation";

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
  lightMode?: boolean;
  theme: Theme;
};

type FormTheme = Readonly<{
  card: string;
  nested: string;
  divider: string;
  label: string;
  muted: string;
  text: string;
  borderSubtle: string;
  button: string;
  buttonActive: string;
}>;

function getFormTheme(lightMode?: boolean): FormTheme {
  if (lightMode) {
    return {
      card: "bg-white border-gray-200",
      nested: "bg-gray-50 border-gray-100",
      divider: "border-gray-200",
      label: "text-[#6b7280]",
      muted: "text-[#9ca3af]",
      text: "text-[#1f2937]",
      borderSubtle: "border-gray-100",
      button: "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200",
      buttonActive: "bg-[#4b5563] text-white border-[#4b5563]",
    };
  }
  return {
    card: "bg-[#141418] border-[#2a2a32]",
    nested: "bg-[#0f0f12] border-[#222228]",
    divider: "border-[#2a2a32]",
    label: "text-[#8a8a96]",
    muted: "text-[#5a5a66]",
    text: "text-[#e8e8ed]",
    borderSubtle: "border-[#222228]",
    button: "bg-[#222228] text-[#e8e8ed] border-[#2a2a32] hover:bg-[#2a2a32]",
    buttonActive: "bg-[#4b5563] text-white border-[#4b5563]",
  };
}

function humanizeSchemaLabel(label: string): string {
  const s = label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

export function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { id, label, required, description, errors, help, children, hidden, classNames, displayLabel } = props;
  if (hidden) return <div style={{ display: "none" }} />;
  const prettyLabel = label ? humanizeSchemaLabel(label) : "";
  const schemaType = props.schema?.type;
  const suppressDescription = schemaType === "object" || schemaType === "array";
  const theme = getFormTheme(props.registry.formContext?.lightMode);
  const labelClass = theme.label;
  const textClass = theme.text;
  const mutedClass = theme.muted;

  const showLabel = displayLabel && label;

  if (!showLabel) {
    return (
      <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
        <div className={textClass}>{children}</div>
        {description && !suppressDescription ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
        {errors ? <div className="text-[11px] text-rose-400">{errors}</div> : null}
        {help ? <div className={`text-[11px] ${mutedClass}`}>{help}</div> : null}
      </div>
    );
  }

  return (
    <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
      <FieldRow>
        <label className={`text-[11px] min-w-[96px] ${labelClass}`} htmlFor={id}>
          <span className="font-medium">{prettyLabel}</span>
          {required ? <span className="text-[11px] text-rose-400">*</span> : null}
        </label>
        <div className={`flex-1 min-w-[120px] ${textClass}`}>{children}</div>
      </FieldRow>
      {description && !suppressDescription ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
      {errors ? <div className="text-[11px] text-rose-400">{errors}</div> : null}
      {help ? <div className={`text-[11px] ${mutedClass}`}>{help}</div> : null}
    </div>
  );
}

export function BrowserConfigObjectFieldTemplate(
  props: ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, description, properties, fieldPathId } = props;
  const path = fieldPathId.path ?? [];
  const transparentPaths = props.registry.formContext?.transparentPaths ?? new Set<string>();
  const depth = path.length;
  const leaf = path.at(-1);
  const leafKey = typeof leaf === "string" ? leaf : "";
  const isRoot = depth === 0;
  const isTransparent = transparentPaths.has(pathToPointer(path));
  const theme = getFormTheme(props.registry.formContext?.lightMode);
  const labelClass = theme.label;
  const textClass = theme.text;

  if (isRoot) {
    return <div className="flex flex-col gap-2">{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  if (isTransparent) {
    return <div>{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  const prettyTitle = title ? humanizeSchemaLabel(title) : leafKey ? humanizeSchemaLabel(leafKey) : "Section";
  const isStage = depth === 1;

  const content = (
    <div className="flex flex-col gap-1.5">
      {!isStage && description ? (
        <div className={`text-[11px] ${labelClass}`}>{description}</div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  if (isStage) {
    return (
      <section className={`rounded-lg border p-2.5 ${theme.card}`}>
        <header className="flex flex-col gap-1">
          <div className={`text-sm font-semibold ${textClass}`}>{prettyTitle}</div>
          {description ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
        </header>
        <div className={`my-1.5 border-t ${theme.divider}`} />
        {content}
      </section>
    );
  }

  const headingClass = `${depth >= 3 ? "text-[11px]" : "text-[12px]"} font-semibold ${textClass}`;
  const inlineBorder = `${depth >= 3 ? "pl-2" : "pl-2.5"} border-l ${theme.borderSubtle}`;
  const groupWrapper = `flex flex-col gap-0.5`;
  return (
    <section className={groupWrapper}>
      <header>
        <div className={headingClass}>{prettyTitle}</div>
      </header>
      <div className={inlineBorder}>
        {content}
      </div>
    </section>
  );
}

export function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, items, canAdd, onAddClick, disabled, readonly } = props;
  const prettyTitle = title ? humanizeSchemaLabel(title) : "Items";
  const allowMutations = !disabled && !readonly;
  const theme = getFormTheme(props.registry.formContext?.lightMode);
  const textClass = theme.text;

  return (
    <section className={`rounded-md border p-2 ${theme.nested}`}>
      <div className="flex items-center gap-2">
        <div className={`text-[12px] font-semibold ${textClass}`}>{prettyTitle}</div>
        <div style={{ flex: 1 }} />
        {canAdd && allowMutations ? (
          <button
            type="button"
            className={`px-2 py-1 text-[11px] rounded border ${theme.button}`}
            onClick={onAddClick}
          >
            Add
          </button>
        ) : null}
      </div>
      <div className={`my-2 border-t ${theme.divider}`} />
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          // RJSF v6 types this as ReactElement[], but some templates/versions
          // pass an "item" object that wraps the actual element in `.children`.
          const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
          return (
            <div key={item.key ?? index} className={`rounded-md border p-2 ${theme.nested}`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
