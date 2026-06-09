import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { ReactNode } from "react";
import { FieldRow } from "../../ui/components/fields";
import { pathToPointer } from "./schemaPresentation";

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
};

// Token-driven chrome for the rjsf config form — this is a high-traffic live
// surface (every config edit re-renders it). The former `getFormTheme(lightMode)`
// helper returned raw-hex class bundles per light/dark branch; that whole branch
// is gone. The theme now follows the single `.dark` class via design-system
// tokens (`card`/`muted`/`border`/`accent`/…), so there is no `lightMode` read.
const FORM = {
  card: "bg-card border-border",
  nested: "bg-muted/40 border-border-subtle",
  divider: "border-border",
  label: "text-muted-foreground",
  muted: "text-muted-foreground/70",
  text: "text-foreground",
  borderSubtle: "border-border-subtle",
  button: "bg-muted text-foreground border-border hover:bg-accent",
} as const;

function humanizeSchemaLabel(label: string): string {
  const s = label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

type GsSchemaMeta = Readonly<{ gs?: Readonly<{ comments?: unknown }> }>;

function normalizeGsComments(input: unknown): string | null {
  if (typeof input === "string" && input.trim().length > 0) return input;
  if (Array.isArray(input)) {
    const parts = input
      .filter((v) => typeof v === "string")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts.join("\n");
  }
  return null;
}

function renderGsComments(args: { schema: unknown; className: string }): ReactNode {
  const meta = args.schema as GsSchemaMeta | null;
  const comments = normalizeGsComments(meta?.gs?.comments);
  if (!comments) return null;
  return (
    <div className={["text-data whitespace-pre-wrap", args.className].filter(Boolean).join(" ")}>
      {comments}
    </div>
  );
}

export function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { id, label, required, description, errors, help, children, hidden, classNames, displayLabel } = props;
  if (hidden) return <div style={{ display: "none" }} />;
  const prettyLabel = label ? humanizeSchemaLabel(label) : "";
  const schemaType = props.schema?.type;
  const suppressDescription = schemaType === "object" || schemaType === "array";
  const labelClass = FORM.label;
  const textClass = FORM.text;
  const mutedClass = FORM.muted;

  const showLabel = displayLabel && label;

  // Errors are associated with the field's input via `id="${id}__error"` + a
  // `role="alert"` live region, and the widget mirrors that id through
  // `aria-describedby` + `aria-invalid` (see `rjsfWidgets.tsx`), so assistive tech
  // announces validation against the control rather than as orphaned text.
  const errorId = `${id}__error`;

  if (!showLabel) {
    return (
      <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
        <div className={textClass}>{children}</div>
        {description && !suppressDescription ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
        {renderGsComments({ schema: props.schema, className: labelClass })}
        {errors ? <div id={errorId} role="alert" className="text-data text-destructive">{errors}</div> : null}
        {help ? <div className={`text-data ${mutedClass}`}>{help}</div> : null}
      </div>
    );
  }

  return (
    <div className={["flex flex-col gap-1", classNames].filter(Boolean).join(" ")}>
      <FieldRow>
        <label className={`text-data min-w-[96px] ${labelClass}`} htmlFor={id}>
          <span className="font-medium">{prettyLabel}</span>
          {required ? <span className="text-data text-destructive">*</span> : null}
        </label>
        <div className={`flex-1 min-w-[120px] ${textClass}`}>{children}</div>
      </FieldRow>
      {description && !suppressDescription ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
      {renderGsComments({ schema: props.schema, className: labelClass })}
      {errors ? <div id={errorId} role="alert" className="text-data text-destructive">{errors}</div> : null}
      {help ? <div className={`text-data ${mutedClass}`}>{help}</div> : null}
    </div>
  );
}

export function BrowserConfigObjectFieldTemplate(
  props: ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, description, properties, fieldPathId, schema } = props;
  const path = fieldPathId.path ?? [];
  const transparentPaths = props.registry.formContext?.transparentPaths ?? new Set<string>();
  const depth = path.length;
  const leaf = path.at(-1);
  const leafKey = typeof leaf === "string" ? leaf : "";
  const isRoot = depth === 0;
  const isTransparent = transparentPaths.has(pathToPointer(path));
  const labelClass = FORM.label;
  const textClass = FORM.text;

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
        <div className={`text-data ${labelClass}`}>{description}</div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  if (isStage) {
    return (
      <section className={`rounded-lg border p-2.5 ${FORM.card}`}>
        <header className="flex flex-col gap-1">
          <div className={`text-sm font-semibold ${textClass}`}>{prettyTitle}</div>
          {renderGsComments({ schema, className: labelClass })}
          {description ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
        </header>
        <div className={`my-1.5 border-t ${FORM.divider}`} />
        {content}
      </section>
    );
  }

  const headingClass = `${depth >= 3 ? "text-data" : "text-xs"} font-semibold ${textClass}`;
  const inlineBorder = `${depth >= 3 ? "pl-2" : "pl-2.5"} border-l ${FORM.borderSubtle}`;
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
  const { title, items, canAdd, onAddClick, disabled, readonly, schema } = props;
  const prettyTitle = title ? humanizeSchemaLabel(title) : "Items";
  const allowMutations = !disabled && !readonly;
  const textClass = FORM.text;
  const labelClass = FORM.label;

  return (
    <section className={`rounded-md border p-2 ${FORM.nested}`}>
      <div className="flex items-center gap-2">
        <div className={`text-xs font-semibold ${textClass}`}>{prettyTitle}</div>
        <div style={{ flex: 1 }} />
        {canAdd && allowMutations ? (
          <button
            type="button"
            className={`px-2 py-1 text-data rounded border ${FORM.button}`}
            onClick={onAddClick}
          >
            Add
          </button>
        ) : null}
      </div>
      {renderGsComments({ schema, className: labelClass })}
      <div className={`my-2 border-t ${FORM.divider}`} />
      <div className="flex flex-col gap-2">
        {items.map((item, index) => {
          // RJSF v6 types this as ReactElement[], but some templates/versions
          // pass an "item" object that wraps the actual element in `.children`.
          const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
          return (
            <div key={item.key ?? index} className={`rounded-md border p-2 ${FORM.nested}`}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
