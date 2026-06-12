import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FieldRow } from "../../ui/components/fields";
import { pathToPointer } from "./schemaPresentation";

/**
 * Collapse state for the form's config objects (Pass-4 config-collapse
 * spec), keyed by JSON pointer. Provided by `useConfigCollapse` via the
 * RecipePanel; when ABSENT the templates render today's always-expanded
 * markup with no chevrons (template unit mounts, bare `SchemaForm` reuse).
 *
 * The expanded set is exposed as DATA (not an `isExpanded` closure) on
 * purpose: rjsf's `SchemaField.shouldComponentUpdate` uses `deepEquals`,
 * which assumes all functions are equivalent — a context whose only change
 * is a fresh closure identity would never re-render the form. lodash
 * `isEqual` compares Set contents, so membership changes propagate.
 */
export type ConfigCollapseContext = Readonly<{
  /** Resolved set of expanded pointers (defaults already applied). */
  expandedPointers: ReadonlySet<string>;
  toggle(pointer: string): void;
}>;

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
  collapse?: ConfigCollapseContext;
};

// Token-driven chrome for the rjsf config form — this is a high-traffic live
// surface (every config edit re-renders it). The former `getFormTheme(lightMode)`
// helper returned raw-hex class bundles per light/dark branch; that whole branch
// is gone. The theme now follows the single `.dark` class via design-system
// tokens (`card`/`muted`/`border`/`accent`/…), so there is no `lightMode` read.
const FORM = {
  card: "bg-card border-border",
  // Group well: nesting is a surface, not an indent (Pass-3 config-surface
  // spec). One recess below the stage card — tinted toward the page token so
  // groups read as machined slots in the slate. `background` sits below `card`
  // in BOTH themes (5%<9% dark, 96%<100% light), so the tint recesses in both.
  // Two surface tiers maximum: card → well; deeper nesting adds headings and
  // rhythm only, never a third surface.
  well: "bg-background/40 border-border-subtle",
  divider: "border-border",
  // Field labels sit a full tier above prose (Pass-2 form hierarchy): labels are
  // foreground anchors the eye scans; descriptions/help/gs-comments recede on the
  // muted tier. Same 11px size — the split is color/weight, not scale.
  fieldLabel: "text-foreground",
  label: "text-muted-foreground",
  muted: "text-muted-foreground/70",
  text: "text-foreground",
  borderSubtle: "border-border-subtle",
  button: "bg-muted text-foreground border-border hover:bg-accent",
  // Group headings are eyebrows: the well's geometry carries the grouping, so
  // its caption recedes below field labels (the brightest scan line in a card).
  groupHeading: "text-label font-semibold uppercase tracking-wider text-muted-foreground",
  subGroupHeading: "text-label font-semibold uppercase tracking-wider text-muted-foreground/70",
  // Rhythm on the 4px base (Pass-3): 4px inside a field block, 8px between
  // sibling fields, 12px between groups/stage sections. Group wells carry
  // `my-1`, which composes with the sibling gap to the 12px group step.
  rhythm: {
    field: "gap-1",
    siblings: "gap-2",
    sections: "gap-3",
    groupPull: "my-1",
  },
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

function configContentId(pointer: string): string {
  return `config-object-content${pointer.replace(/[^A-Za-z0-9_-]+/g, "-")}`;
}

/**
 * The per-object header row (Pass-4 config-collapse spec): chevron + title
 * as ONE disclosure button, plus a trailing zone for object-local actions —
 * the future home of per-object Reset/Show-JSON; the array template's Add
 * button rides it already. The `data-config-*` attributes are the sticky
 * engine's DOM contract (see `useConfigCollapse`).
 */
function CollapsibleHeader(args: {
  pointer: string;
  title: string;
  titleClass: string;
  expanded: boolean;
  collapse: ConfigCollapseContext;
  className?: string;
  actions?: ReactNode;
}): ReactNode {
  const { pointer, title, titleClass, expanded, collapse, className, actions } = args;
  const Chevron = expanded ? ChevronDown : ChevronRight;
  return (
    <header
      className={["flex items-center gap-1", className].filter(Boolean).join(" ")}
      data-config-header=""
      data-config-pointer={pointer}>
      <button
        type="button"
        onClick={() => collapse.toggle(pointer)}
        aria-expanded={expanded}
        aria-controls={configContentId(pointer)}
        className="flex flex-1 min-w-0 items-center gap-1.5 text-left cursor-pointer">
        <Chevron className="w-3 h-3 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        <span className={`min-w-0 truncate ${titleClass}`}>{title}</span>
      </button>
      {actions ? <div className="flex items-center gap-1 shrink-0">{actions}</div> : null}
    </header>
  );
}

export function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { id, label, required, description, errors, help, children, hidden, classNames, displayLabel, rawErrors } = props;
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
  // Gated on `rawErrors`: rjsf's `errors` prop is an always-truthy element, so
  // rendering on it mounts an empty live region per field (~40 phantom alerts).
  const errorId = `${id}__error`;
  const hasErrors = (rawErrors?.length ?? 0) > 0;

  if (!showLabel) {
    return (
      <div className={[`flex flex-col ${FORM.rhythm.field}`, classNames].filter(Boolean).join(" ")}>
        <div className={textClass}>{children}</div>
        {description && !suppressDescription ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
        {renderGsComments({ schema: props.schema, className: labelClass })}
        {hasErrors ? <div id={errorId} role="alert" className="text-data text-destructive">{errors}</div> : null}
        {help ? <div className={`text-data ${mutedClass}`}>{help}</div> : null}
      </div>
    );
  }

  return (
    <div className={[`flex flex-col ${FORM.rhythm.field}`, classNames].filter(Boolean).join(" ")}>
      <FieldRow>
        <label className={`text-data min-w-[96px] ${FORM.fieldLabel}`} htmlFor={id}>
          <span className="font-medium">{prettyLabel}</span>
          {required ? <span className="text-data text-destructive">*</span> : null}
        </label>
        <div className={`flex-1 min-w-[120px] ${textClass}`}>{children}</div>
      </FieldRow>
      {description && !suppressDescription ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
      {renderGsComments({ schema: props.schema, className: labelClass })}
      {hasErrors ? <div id={errorId} role="alert" className="text-data text-destructive">{errors}</div> : null}
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
    return (
      <div className={`flex flex-col ${FORM.rhythm.sections}`}>
        {properties.filter((p) => !p.hidden).map((p) => p.content)}
      </div>
    );
  }

  if (isTransparent) {
    return <div>{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  const prettyTitle = title ? humanizeSchemaLabel(title) : leafKey ? humanizeSchemaLabel(leafKey) : "Section";
  const isStage = depth === 1;

  // Collapse plumbing (Pass-4): no context ⇒ always expanded, no chevrons.
  const collapse = props.registry.formContext?.collapse;
  const pointer = pathToPointer(path);
  const expanded = collapse ? collapse.expandedPointers.has(pointer) : true;

  const content = (
    <div className={`flex flex-col ${FORM.rhythm.siblings}`}>
      {!isStage && description ? (
        <div className={`text-data ${labelClass}`}>{description}</div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  if (isStage) {
    return (
      <section
        className={`rounded-lg border p-2.5 ${FORM.card}`}
        data-config-section=""
        data-config-pointer={pointer}>
        {collapse ? (
          <CollapsibleHeader
            pointer={pointer}
            title={prettyTitle}
            titleClass={`text-sm font-semibold ${textClass}`}
            expanded={expanded}
            collapse={collapse}
          />
        ) : (
          <header className="flex flex-col gap-1">
            <div className={`text-sm font-semibold ${textClass}`}>{prettyTitle}</div>
            {renderGsComments({ schema, className: labelClass })}
            {description ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
          </header>
        )}
        {expanded ? (
          <div id={collapse ? configContentId(pointer) : undefined}>
            {collapse ? (
              <div className="flex flex-col gap-1 pt-1">
                {renderGsComments({ schema, className: labelClass })}
                {description ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
              </div>
            ) : null}
            <div className={`my-1.5 border-t ${FORM.divider}`} />
            {content}
          </div>
        ) : null}
      </section>
    );
  }

  // Depth 2: the one well tier inside a stage card. Depth ≥3: no further
  // surface — an eyebrow heading and the sibling rhythm carry the structure
  // (surface nesting is capped at card → well; see FORM.well).
  if (depth === 2) {
    return (
      <section
        className={`rounded-md border p-2 ${FORM.rhythm.groupPull} ${FORM.well}`}
        data-config-section=""
        data-config-pointer={pointer}>
        {collapse ? (
          <CollapsibleHeader
            pointer={pointer}
            title={prettyTitle}
            titleClass={FORM.groupHeading}
            expanded={expanded}
            collapse={collapse}
            className={expanded ? "pb-1.5" : undefined}
          />
        ) : (
          <header className="pb-1.5">
            <div className={FORM.groupHeading}>{prettyTitle}</div>
          </header>
        )}
        {expanded ? <div id={collapse ? configContentId(pointer) : undefined}>{content}</div> : null}
      </section>
    );
  }

  return (
    <section
      className={`flex flex-col gap-1 ${FORM.rhythm.groupPull}`}
      data-config-section=""
      data-config-pointer={pointer}>
      {collapse ? (
        <CollapsibleHeader
          pointer={pointer}
          title={prettyTitle}
          titleClass={FORM.subGroupHeading}
          expanded={expanded}
          collapse={collapse}
        />
      ) : (
        <header>
          <div className={FORM.subGroupHeading}>{prettyTitle}</div>
        </header>
      )}
      {expanded ? <div id={collapse ? configContentId(pointer) : undefined}>{content}</div> : null}
    </section>
  );
}

export function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, items, canAdd, onAddClick, disabled, readonly, schema, fieldPathId } = props;
  const prettyTitle = title ? humanizeSchemaLabel(title) : "Items";
  const allowMutations = !disabled && !readonly;
  const labelClass = FORM.label;

  // Collapse plumbing (Pass-4): arrays ride the same per-object header
  // anatomy as object groups; the Add button is the first object-local
  // action living in the header's trailing zone.
  const collapse = props.registry.formContext?.collapse;
  const pointer = pathToPointer(fieldPathId.path ?? []);
  const expanded = collapse ? collapse.expandedPointers.has(pointer) : true;

  const addButton =
    canAdd && allowMutations ? (
      <button
        type="button"
        className={`px-2 py-1 text-data rounded border ${FORM.button}`}
        onClick={onAddClick}
      >
        Add
      </button>
    ) : null;

  // Arrays ride the same well tier as object groups (one surface recess);
  // items separate by hairline borders only — a tinted item box would be a
  // third surface tier, which the elevation scheme caps out.
  return (
    <section
      className={`rounded-md border p-2 ${FORM.rhythm.groupPull} ${FORM.well}`}
      data-config-section=""
      data-config-pointer={pointer}>
      {collapse ? (
        <CollapsibleHeader
          pointer={pointer}
          title={prettyTitle}
          titleClass={FORM.groupHeading}
          expanded={expanded}
          collapse={collapse}
          actions={addButton}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className={FORM.groupHeading}>{prettyTitle}</div>
          <div style={{ flex: 1 }} />
          {addButton}
        </div>
      )}
      {expanded ? (
        <div id={collapse ? configContentId(pointer) : undefined}>
          {renderGsComments({ schema, className: labelClass })}
          <div className={`my-2 border-t ${FORM.divider}`} />
          <div className={`flex flex-col ${FORM.rhythm.siblings}`}>
            {items.map((item, index) => {
              // RJSF v6 types this as ReactElement[], but some templates/versions
              // pass an "item" object that wraps the actual element in `.children`.
              const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
              return (
                <div key={item.key ?? index} className={`rounded border p-2 ${FORM.borderSubtle}`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
