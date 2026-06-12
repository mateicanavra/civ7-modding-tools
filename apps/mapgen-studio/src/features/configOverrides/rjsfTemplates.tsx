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
  // Config explorer v2 (P7 flatten): the old depth-2 "well" cards are
  // retired. Nesting is now a FLAT collapsible object explorer — full-bleed
  // disclosure rows separated by hairline dividers, depth carried by a
  // compounding left indent (`nestIndent`), never by a third surface. The
  // stage slab (`surface-sunken`) stays the single recess tier.
  nestIndent: "pl-3",
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
  // sibling fields. Object/array sections carry NO inter-item rhythm (Y4 +
  // P7 flatten): hairline dividers separate rows, not margins — only runs of
  // scalar fields keep the sibling gap inside their padded block.
  rhythm: {
    field: "gap-1",
    siblings: "gap-2",
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

type ObjectProperty = ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>["properties"][number];

type PropertyRun =
  | { kind: "fields"; items: ObjectProperty[] }
  | { kind: "section"; item: ObjectProperty };

/**
 * True when a child property renders as its own disclosure section (object or
 * array) rather than a scalar field row. Drives the flat-explorer layout:
 * sections stack flush (hairline-divided), scalar runs keep the padded
 * field rhythm. Unresolvable schemas (refs/unions) default to the field run —
 * the safe choice is padding, never a phantom section.
 */
function isSectionProperty(parentSchema: RJSFSchema | undefined, name: string): boolean {
  const sub = parentSchema?.properties?.[name];
  if (!sub || typeof sub !== "object") return false;
  const type = (sub as RJSFSchema).type;
  return type === "object" || type === "array";
}

function groupPropertyRuns(
  properties: readonly ObjectProperty[],
  parentSchema: RJSFSchema | undefined,
): PropertyRun[] {
  const runs: PropertyRun[] = [];
  for (const property of properties) {
    if (property.hidden) continue;
    if (isSectionProperty(parentSchema, property.name)) {
      runs.push({ kind: "section", item: property });
      continue;
    }
    const last = runs.at(-1);
    if (last?.kind === "fields") last.items.push(property);
    else runs.push({ kind: "fields", items: [property] });
  }
  return runs;
}

/**
 * Flat-explorer child layout (config explorer v2): consecutive scalar fields
 * render as one padded block with the sibling gap; object/array children
 * render flush as their own disclosure rows. The container's `divide-y`
 * draws the hairline between every neighbor, so sections need no borders of
 * their own.
 */
function FlatObjectChildren(args: {
  properties: readonly ObjectProperty[];
  schema: RJSFSchema | undefined;
  fieldsClass: string;
}): ReactNode {
  const runs = groupPropertyRuns(args.properties, args.schema);
  return (
    <div className="flex flex-col divide-y divide-border-subtle">
      {runs.map((run, index) =>
        run.kind === "section" ? (
          <div key={run.item.name ?? index}>{run.item.content}</div>
        ) : (
          <div key={index} className={`flex flex-col ${FORM.rhythm.siblings} ${args.fieldsClass}`}>
            {run.items.map((p) => p.content)}
          </div>
        ),
      )}
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
    // Y4 flatten: the stage list is a TIGHT accordion — flush rows separated
    // by hairlines, no inter-card margins, no card chrome. Expansion is the
    // only volume change (a recessed slab opens under the row).
    return (
      <div className={`flex flex-col divide-y divide-border-subtle border-y ${FORM.borderSubtle}`}>
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

  if (isStage) {
    // Y4 flatten: stage objects lay FLAT on the panel — no card chrome, no
    // raised surface. The header is a full-bleed disclosure row; expanding it
    // opens a RECESSED slab (`surface-sunken` — below the panel, toward the
    // page) so the interaction reads as a door opening into the graphite,
    // not a card inflating off it. Inside the slab the config explorer v2
    // layout takes over: full-bleed nested disclosure rows, hairline-divided,
    // with only scalar-field runs carrying horizontal padding.
    return (
      <section data-config-section="" data-config-pointer={pointer}>
        {collapse ? (
          <CollapsibleHeader
            pointer={pointer}
            title={prettyTitle}
            titleClass={`text-sm font-semibold ${textClass}`}
            expanded={expanded}
            collapse={collapse}
            className="px-2.5 py-2 hover:bg-muted/20 transition-colors"
          />
        ) : (
          <header className="flex flex-col gap-1 px-2.5 py-2">
            <div className={`text-sm font-semibold ${textClass}`}>{prettyTitle}</div>
            {renderGsComments({ schema, className: labelClass })}
            {description ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
          </header>
        )}
        {expanded ? (
          <div
            id={collapse ? configContentId(pointer) : undefined}
            className={`border-t bg-surface-sunken/60 ${FORM.borderSubtle}`}>
            {collapse && (description || normalizeGsComments((schema as GsSchemaMeta | null)?.gs?.comments)) ? (
              <div className="flex flex-col gap-1 px-2.5 pt-2 pb-1.5">
                {renderGsComments({ schema, className: labelClass })}
                {description ? <div className={`text-data ${labelClass}`}>{description}</div> : null}
              </div>
            ) : null}
            <FlatObjectChildren properties={properties} schema={schema} fieldsClass="px-2.5 py-2" />
          </div>
        ) : null}
      </section>
    );
  }

  // Depth ≥2 (config explorer v2): every nested object is the SAME flat
  // disclosure row — no well cards, no side margins, no inter-section gaps.
  // The hairlines come from the parent's `divide-y`; depth reads through the
  // compounding `nestIndent` on each expanded body plus the heading tier
  // (group eyebrow at depth 2, the dimmer sub-group eyebrow below).
  const headingClass = depth === 2 ? FORM.groupHeading : FORM.subGroupHeading;
  return (
    <section data-config-section="" data-config-pointer={pointer}>
      {collapse ? (
        <CollapsibleHeader
          pointer={pointer}
          title={prettyTitle}
          titleClass={headingClass}
          expanded={expanded}
          collapse={collapse}
          className="px-2.5 py-1.5 hover:bg-muted/20 transition-colors"
        />
      ) : (
        <header className="px-2.5 py-1.5">
          <div className={headingClass}>{prettyTitle}</div>
        </header>
      )}
      {expanded ? (
        <div id={collapse ? configContentId(pointer) : undefined} className={FORM.nestIndent}>
          {description ? (
            <div className={`text-data px-2.5 pb-1.5 ${labelClass}`}>{description}</div>
          ) : null}
          <FlatObjectChildren properties={properties} schema={schema} fieldsClass="px-2.5 pb-2 pt-1" />
        </div>
      ) : null}
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

  // Arrays ride the same flat disclosure-row anatomy as object sections
  // (config explorer v2): no well card, hairline-divided item rows instead
  // of bordered item boxes — a box would be a phantom surface tier.
  return (
    <section data-config-section="" data-config-pointer={pointer}>
      {collapse ? (
        <CollapsibleHeader
          pointer={pointer}
          title={prettyTitle}
          titleClass={FORM.groupHeading}
          expanded={expanded}
          collapse={collapse}
          className="px-2.5 py-1.5 hover:bg-muted/20 transition-colors"
          actions={addButton}
        />
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-1.5">
          <div className={FORM.groupHeading}>{prettyTitle}</div>
          <div style={{ flex: 1 }} />
          {addButton}
        </div>
      )}
      {expanded ? (
        <div id={collapse ? configContentId(pointer) : undefined} className={FORM.nestIndent}>
          {renderGsComments({ schema, className: `px-2.5 pb-1.5 ${labelClass}` })}
          <div className="flex flex-col divide-y divide-border-subtle">
            {items.map((item, index) => {
              // RJSF v6 types this as ReactElement[], but some templates/versions
              // pass an "item" object that wraps the actual element in `.children`.
              const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
              return (
                <div key={item.key ?? index} className="px-2.5 py-2">
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
