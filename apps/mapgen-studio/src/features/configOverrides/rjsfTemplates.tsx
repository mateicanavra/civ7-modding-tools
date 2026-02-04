import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { Theme } from "../../ui/types";
import { FieldRow } from "../../ui/components/fields";
import { pathToPointer, type BrowserConfigSchemaDef } from "./schemaPresentation";

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
  lightMode?: boolean;
  theme: Theme;
};

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
  const isBoolean = schemaType === "boolean";
  const theme = props.registry.formContext?.theme;
  const labelClass = theme?.label ?? "";
  const textClass = theme?.text ?? "";

  if (isBoolean) {
    return (
      <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
        <FieldRow>
          {displayLabel && label ? (
            <label className={`text-[11px] ${labelClass}`} htmlFor={id}>
              <span className="font-medium">{prettyLabel}</span>
              {required ? <span className="text-[11px] text-rose-400">*</span> : null}
            </label>
          ) : null}
          <div>{children}</div>
        </FieldRow>
        {description ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
        {errors ? <div className="text-[11px] text-rose-400">{errors}</div> : null}
        {help ? <div className={`text-[11px] ${labelClass}`}>{help}</div> : null}
      </div>
    );
  }

  return (
    <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
      {displayLabel && label ? (
        <label className={`text-[11px] ${labelClass}`} htmlFor={id}>
          <span className="font-medium">{prettyLabel}</span>
          {required ? <span className="text-[11px] text-rose-400">*</span> : null}
        </label>
      ) : null}
      {description && !suppressDescription ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
      <div className={textClass}>{children}</div>
      {errors ? <div className="text-[11px] text-rose-400">{errors}</div> : null}
      {help ? <div className={`text-[11px] ${labelClass}`}>{help}</div> : null}
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
  const theme = props.registry.formContext?.theme;
  const cardClass = theme?.card ?? "";
  const nestedCard = theme?.nestedCard ?? "";
  const dividerClass = theme?.divider ?? "";
  const labelClass = theme?.label ?? "";
  const textClass = theme?.text ?? "";

  if (isRoot) {
    return <div className="flex flex-col gap-3">{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  if (isTransparent) {
    return <div>{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  const prettyTitle = title ? humanizeSchemaLabel(title) : leafKey ? humanizeSchemaLabel(leafKey) : "Section";
  const isStage = depth === 1;
  const isTopGroup = depth === 2;

  const content = (
    <div className="flex flex-col gap-2">
      {!isStage && description ? (
        <div className={`text-[11px] ${labelClass}`}>{description}</div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  if (isStage) {
    return (
      <section className={`rounded-lg border p-3 ${cardClass}`}>
        <header className="flex flex-col gap-1">
          <div className={`text-sm font-semibold ${textClass}`}>{prettyTitle}</div>
          {description ? <div className={`text-[11px] ${labelClass}`}>{description}</div> : null}
        </header>
        <div className={`my-2 border-t ${dividerClass}`} />
        {content}
      </section>
    );
  }

  const headingClass = `text-[12px] font-semibold ${textClass}`;
  const wrapperClass = isTopGroup ? `rounded-md border p-2 ${nestedCard}` : `pl-2 border-l ${dividerClass}`;
  return (
    <section className={wrapperClass}>
      <header className="mb-1">
        <div className={headingClass}>{prettyTitle}</div>
      </header>
      {content}
    </section>
  );
}

export function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, items, canAdd, onAddClick, disabled, readonly } = props;
  const prettyTitle = title ? humanizeSchemaLabel(title) : "Items";
  const allowMutations = !disabled && !readonly;
  const theme = props.registry.formContext?.theme;
  const nestedCard = theme?.nestedCard ?? "";
  const textClass = theme?.text ?? "";
  const dividerClass = theme?.divider ?? "";

  return (
    <section className={`rounded-md border p-2 ${nestedCard}`}>
      <div className="flex items-center gap-2">
        <div className={`text-[12px] font-semibold ${textClass}`}>{prettyTitle}</div>
        <div style={{ flex: 1 }} />
        {canAdd && allowMutations ? (
          <button
            type="button"
            className={`px-2 py-1 text-[11px] rounded border ${theme?.button ?? ""}`}
            onClick={onAddClick}
          >
            Add
          </button>
        ) : null}
      </div>
      <div className={`my-2 border-t ${dividerClass}`} />
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          // RJSF v6 types this as ReactElement[], but some templates/versions
          // pass an "item" object that wraps the actual element in `.children`.
          const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
          return (
            <div key={item.key ?? index} className={`rounded-md border p-2 ${nestedCard}`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
