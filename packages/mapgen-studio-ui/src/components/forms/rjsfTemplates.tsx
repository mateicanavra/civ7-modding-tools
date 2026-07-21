import type {
  ArrayFieldTemplateProps,
  FieldTemplateProps,
  ObjectFieldTemplateProps,
  RJSFSchema,
} from "@rjsf/utils";
import { deepEquals } from "@rjsf/utils";
import { Braces, ChevronDown, ChevronRight, EllipsisVertical, Eraser, Undo2 } from "lucide-react";
import { Fragment, type ReactNode, useMemo, useState } from "react";
import { iconButton } from "../../lib/iconButton.js";
import { cn } from "../../lib/utils.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu.js";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip.js";
import { FieldRow } from "./FieldRow.js";
import { type FieldBaseline, FieldBaselineContext } from "./fieldBaseline.js";
import { errorFieldId } from "./fieldIds.js";
import { getAtPath } from "./pathUtils.js";
import { humanizeSchemaLabel, pathToPointer, schemaDefaultsFor } from "./schemaPresentation.js";

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

/**
 * One stage-scoped restore ask (flat-and-flush delta 5, re-cut): the host
 * (RecipePanel) owns the confirmation dialog; the stage header only asks.
 * `mode` picks the dialog's story and `values` carries exactly what confirming
 * applies at `pointer` — the SAME value the requesting affordance compared
 * against, so one place resolves it and the confirmer just applies it.
 *
 * - `"rollback"` — discard working changes: `values` is the loaded config's
 *   slice for this stage (the baseline). Requested by the header's Undo icon,
 *   which renders only while the stage differs from that baseline.
 * - `"defaults"` — reset to the recipe's defaults: `values` is the stage's
 *   schema-resolved defaults. Requested from the stage options menu.
 */
export type StageRestoreRequest = Readonly<{
  pointer: string;
  label: string;
  values: unknown;
  mode: "rollback" | "defaults";
}>;

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
  collapse?: ConfigCollapseContext;
  /**
   * The loaded config's values in FORM coordinates (the config as selected /
   * imported, before working edits) — the baseline every "changed" signal in
   * the form keys on: stage rollback gating and per-field drift + undo.
   * `undefined` ⇒ no working-change tracking anywhere in the form (bare
   * `SchemaForm` reuse).
   */
  baseline?: unknown;
  /**
   * Requests the scoped restore confirmation for one stage. Absent in bare
   * `SchemaForm` reuse — stages then render neither restore affordance.
   */
  onStageRestoreRequest?: (request: StageRestoreRequest) => void;
};

// Token-driven chrome for the rjsf config form — this is a high-traffic live
// surface (every config edit re-renders it). The former `getFormTheme(lightMode)`
// helper returned raw-hex class bundles per light/dark branch; that whole branch
// is gone. The theme now follows the single `.dark` class via design-system
// tokens (`card`/`muted`/`border`/`accent`/…), so there is no `lightMode` read.
const FORM = {
  // Config explorer v2 (P7 flatten) + flat-and-flush delta 1: the old
  // depth-2 "well" cards are retired AND the stage slab's recess tint is
  // gone — the whole config body is ONE continuous flat surface. Nesting is
  // a FLAT collapsible object explorer — disclosure rows separated by
  // hairline dividers, depth carried by dividers plus indentation, never by
  // a fill.
  //
  // The indent system is RECURSIVE, not arithmetic (rework of delta 1):
  // every section applies the same three steps, at every depth —
  //
  //   header:    carries the gutter (`headerInset`, 16px) inside whatever
  //              body contains it; chevron w-3 (12) + gap-2 (8) put the
  //              TITLE TEXT at its body's edge + 36.
  //   body:      indents `bodyIndent` (12px) from its container.
  //   field run: pads `fieldRunInset` left (24px) inside the body ⇒ labels
  //              land at body edge + 12 + 24 = the previous body's edge
  //              + 36 — exactly under their OWN section's title text, at
  //              every depth.
  //
  // The 24 is DERIVED: headerInset (16) + chevron (12) + gap (8) −
  // bodyIndent (12). Change any of those and re-derive it. Because bodies
  // indent, nested hairlines and hover rows start at their section's depth —
  // the inset dividers double as tree guides.
  headerInset: "px-4",
  fieldRunInset: "pl-6 pr-4",
  bodyIndent: "pl-3",
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
  // Rhythm (flat-and-flush delta 1, reworked): 4px inside a field block,
  // 12px between sibling fields, 12px above/below a run. Object/array
  // sections carry NO inter-item rhythm (Y4 + P7 flatten): hairline dividers
  // separate rows, not margins — only runs of scalar fields keep the sibling
  // gap inside their padded block.
  rhythm: {
    field: "gap-1",
    siblings: "gap-3",
  },
} as const;

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
  return <div className={cn("text-data whitespace-pre-wrap", args.className)}>{comments}</div>;
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
      className={cn("flex items-center gap-1", className)}
      data-config-header=""
      data-config-pointer={pointer}
    >
      <button
        type="button"
        onClick={() => collapse.toggle(pointer)}
        aria-expanded={expanded}
        aria-controls={configContentId(pointer)}
        className="flex flex-1 min-w-0 items-center gap-2 text-left cursor-pointer"
      >
        <Chevron className="w-3 h-3 shrink-0 text-muted-foreground/70" aria-hidden="true" />
        <span className={cn("min-w-0 truncate", titleClass)}>{title}</span>
      </button>
      {actions ? <div className="flex items-center gap-1 shrink-0">{actions}</div> : null}
    </header>
  );
}

export function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
) {
  const {
    id,
    label,
    required,
    description,
    errors,
    help,
    children,
    hidden,
    classNames,
    displayLabel,
    rawErrors,
  } = props;
  // Working-change baseline for THIS field (loaded-config value at this
  // field's path), handed to the value widget via context — the template is
  // the one layer that knows the field's path (`fieldPathId.path`); widgets
  // never do path math. `null` ⇒ no baseline plumbing, widgets render no
  // drift/undo. Memoized so the provider's value is stable per baseline
  // slice (context bypasses rjsf's SchemaField deepEquals gate).
  const formBaseline = props.registry.formContext?.baseline;
  const fieldPath = props.fieldPathId.path;
  const fieldBaseline = useMemo<FieldBaseline | null>(
    () =>
      formBaseline === undefined
        ? null
        : {
            value: getAtPath(
              formBaseline,
              fieldPath.map((segment) => String(segment))
            ),
          },
    [formBaseline, fieldPath]
  );
  if (hidden) return <div style={{ display: "none" }} />;
  const prettyLabel = label ? humanizeSchemaLabel(label) : "";
  const schemaType = props.schema?.type;
  const suppressDescription = schemaType === "object" || schemaType === "array";
  const labelClass = FORM.label;
  const textClass = FORM.text;
  const mutedClass = FORM.muted;

  const showLabel = displayLabel && label;

  // Errors are associated with the field's input via the shared `errorFieldId`
  // id (one definition — `fieldIds.ts`) + a `role="alert"` live region, and the
  // widget mirrors that id through `aria-describedby` + `aria-invalid` (see
  // `rjsfWidgets.tsx`), so assistive tech announces validation against the
  // control rather than as orphaned text.
  // Gated on `rawErrors`: rjsf's `errors` prop is an always-truthy element, so
  // rendering on it mounts an empty live region per field (~40 phantom alerts).
  const errorId = errorFieldId(id);
  const hasErrors = (rawErrors?.length ?? 0) > 0;

  const control = (
    <FieldBaselineContext.Provider value={fieldBaseline}>{children}</FieldBaselineContext.Provider>
  );

  if (!showLabel) {
    return (
      <div className={cn("flex flex-col", FORM.rhythm.field, classNames)}>
        <div className={textClass}>{control}</div>
        {description && !suppressDescription ? (
          <div className={cn("text-data", labelClass)}>{description}</div>
        ) : null}
        {renderGsComments({ schema: props.schema, className: labelClass })}
        {hasErrors ? (
          <div id={errorId} role="alert" className="text-data text-destructive">
            {errors}
          </div>
        ) : null}
        {help ? <div className={cn("text-data", mutedClass)}>{help}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", FORM.rhythm.field, classNames)}>
      <FieldRow>
        <label className={cn("text-data min-w-[96px]", FORM.fieldLabel)} htmlFor={id}>
          <span className="font-medium">{prettyLabel}</span>
          {required ? <span className="text-data text-destructive">*</span> : null}
        </label>
        <div className={cn("flex-1 min-w-[120px]", textClass)}>{control}</div>
      </FieldRow>
      {description && !suppressDescription ? (
        <div className={cn("text-data", labelClass)}>{description}</div>
      ) : null}
      {renderGsComments({ schema: props.schema, className: labelClass })}
      {hasErrors ? (
        <div id={errorId} role="alert" className="text-data text-destructive">
          {errors}
        </div>
      ) : null}
      {help ? <div className={cn("text-data", mutedClass)}>{help}</div> : null}
    </div>
  );
}

type ObjectProperty = ObjectFieldTemplateProps<
  unknown,
  RJSFSchema,
  BrowserConfigFormContext
>["properties"][number];

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
  parentSchema: RJSFSchema | undefined
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
          // A field run is identified by its first property: property names are
          // unique within an object, so this key survives sections being added,
          // removed, or reordered around the run — an index key would remount
          // every following run (and drop transient input state) on such shifts.
          <div
            key={run.items[0]?.name ?? index}
            className={cn("flex flex-col", FORM.rhythm.siblings, args.fieldsClass)}
          >
            {run.items.map((p, itemIndex) => (
              <Fragment key={p.name ?? itemIndex}>{p.content}</Fragment>
            ))}
          </div>
        )
      )}
    </div>
  );
}

/**
 * One stage's disclosure section (depth-1 root config object). Owns the
 * per-stage header actions (flat-and-flush delta 5, re-cut):
 *
 * - Undo (rollback) — rendered only while the stage's live values differ
 *   from the LOADED config's values (delta 8: absent, not disabled; the
 *   icon's presence is itself the "this stage has working changes" signal).
 *   Confirming restores the baseline slice.
 * - JSON reveal — swaps the stage's fields for its raw values (mutually
 *   exclusive; collapses with the stage).
 * - Options menu — holds the destructive escape hatch: Reset to Defaults
 *   (Eraser), which restores the stage's schema-resolved defaults. The
 *   stage's schema defaults ARE the recipe defaults at that pointer (the
 *   artifact generator stamps them from the same source the reset restores).
 */
function StageObjectSection(args: {
  pointer: string;
  title: string;
  schema: RJSFSchema | undefined;
  formData: unknown;
  properties: readonly ObjectProperty[];
  description?: ReactNode;
  collapse: ConfigCollapseContext | undefined;
  expanded: boolean;
  baseline?: FieldBaseline;
  onStageRestoreRequest?: (request: StageRestoreRequest) => void;
}): ReactNode {
  const {
    pointer,
    title,
    schema,
    formData,
    properties,
    description,
    collapse,
    expanded,
    baseline,
    onStageRestoreRequest,
  } = args;
  const [showJson, setShowJson] = useState(false);
  const labelClass = FORM.label;
  const textClass = FORM.text;

  const defaults = schemaDefaultsFor(schema);
  const atDefaults = defaults !== undefined && deepEquals(formData ?? {}, defaults);
  const changed = baseline !== undefined && !deepEquals(formData ?? {}, baseline.value ?? {});

  // Local provider so the template stays self-sufficient in bare `SchemaForm`
  // reuse (no host-provider contract); 300ms matches the app/storybook
  // providers, so nesting under them changes nothing.
  const actions = (
    <TooltipProvider delayDuration={300}>
      {changed && onStageRestoreRequest ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() =>
                onStageRestoreRequest({
                  pointer,
                  label: title,
                  values: baseline.value,
                  mode: "rollback",
                })
              }
              aria-label={`Discard Changes to ${title}`}
              className={cn(iconButton, "text-warning hover:text-warning hover:bg-warning/10")}
            >
              <Undo2 className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Discard Changes</TooltipContent>
        </Tooltip>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => setShowJson(!showJson)}
            aria-pressed={showJson}
            aria-label={showJson ? `Show ${title} Form` : `Show ${title} JSON`}
            className={cn(
              iconButton,
              showJson &&
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
            )}
          >
            <Braces className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{showJson ? `Show ${title} Form` : `Show ${title} JSON`}</TooltipContent>
      </Tooltip>
      {onStageRestoreRequest ? (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label={`${title} Options`} className={iconButton}>
                  <EllipsisVertical className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Options</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              disabled={defaults === undefined || atDefaults}
              onSelect={() =>
                onStageRestoreRequest({ pointer, label: title, values: defaults, mode: "defaults" })
              }
            >
              <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
              Reset to Defaults
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </TooltipProvider>
  );

  // Y4 flatten + flat-and-flush delta 1: stage objects lay FLAT on the panel
  // — no card chrome, no raised surface, and no recessed tint. The header is
  // a full-bleed disclosure row; expanding it opens a body on the SAME
  // continuous surface, separated only by the hairline `border-t` — depth is
  // carried by dividers and indent, never a fill. The body indents one step
  // (`bodyIndent`) so nested section headers read one tier deeper than the
  // stage title — the recursive indent rule starts here.
  return (
    <section data-config-section="" data-config-pointer={pointer}>
      {collapse ? (
        <CollapsibleHeader
          pointer={pointer}
          title={title}
          titleClass={cn("text-sm font-semibold", textClass)}
          expanded={expanded}
          collapse={collapse}
          className={cn("py-2.5 hover:bg-muted/20 transition-colors", FORM.headerInset)}
          actions={actions}
        />
      ) : (
        <header className={cn("flex flex-col gap-1 py-2.5", FORM.headerInset)}>
          <div className={cn("text-sm font-semibold", textClass)}>{title}</div>
          {renderGsComments({ schema, className: labelClass })}
          {description ? <div className={cn("text-data", labelClass)}>{description}</div> : null}
        </header>
      )}
      {expanded ? (
        <div
          id={collapse ? configContentId(pointer) : undefined}
          className={cn("border-t", FORM.borderSubtle, FORM.bodyIndent)}
        >
          {collapse &&
          (description || normalizeGsComments((schema as GsSchemaMeta | null)?.gs?.comments)) ? (
            <div className={cn("flex flex-col gap-1 pt-2.5 pb-2", FORM.fieldRunInset)}>
              {renderGsComments({ schema, className: labelClass })}
              {description ? (
                <div className={cn("text-data", labelClass)}>{description}</div>
              ) : null}
            </div>
          ) : null}
          {showJson ? (
            <div className={cn("py-3", FORM.fieldRunInset)}>
              <div className="border border-border-subtle rounded p-2.5 max-h-[240px] overflow-auto bg-surface-sunken">
                <pre
                  className={cn(
                    "text-label font-mono leading-relaxed",
                    FORM.muted,
                    "whitespace-pre-wrap break-all"
                  )}
                >
                  {JSON.stringify(formData ?? {}, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <FlatObjectChildren
              properties={properties}
              schema={schema}
              fieldsClass={cn("py-3", FORM.fieldRunInset)}
            />
          )}
        </div>
      ) : null}
    </section>
  );
}

export function BrowserConfigObjectFieldTemplate(
  props: ObjectFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
) {
  const { title, description, properties, fieldPathId, schema } = props;
  const path = fieldPathId.path ?? [];
  const transparentPaths = props.registry.formContext?.transparentPaths ?? new Set<string>();
  const depth = path.length;
  const leaf = path.at(-1);
  const leafKey = typeof leaf === "string" ? leaf : "";
  const isRoot = depth === 0;
  const isTransparent = transparentPaths.has(pathToPointer(path));
  const labelClass = FORM.label;

  if (isRoot) {
    // Y4 flatten: the stage list is a TIGHT accordion — flush rows separated
    // by hairlines, no inter-card margins, no card chrome. Expansion is the
    // only volume change (a recessed slab opens under the row). No outer
    // borders at all: the CONTAINER owns both boundaries (the panel's config
    // header carries `border-b` above, its footer `border-t` below) — an own
    // border here doubled those hairlines.
    return (
      <div className="flex flex-col divide-y divide-border-subtle">
        {properties
          .filter((p) => !p.hidden)
          .map((p, index) => (
            <Fragment key={p.name ?? index}>{p.content}</Fragment>
          ))}
      </div>
    );
  }

  if (isTransparent) {
    return (
      <div>
        {properties
          .filter((p) => !p.hidden)
          .map((p, index) => (
            <Fragment key={p.name ?? index}>{p.content}</Fragment>
          ))}
      </div>
    );
  }

  const prettyTitle = title
    ? humanizeSchemaLabel(title)
    : leafKey
      ? humanizeSchemaLabel(leafKey)
      : "Section";
  const isStage = depth === 1;

  // Collapse plumbing (Pass-4): no context ⇒ always expanded, no chevrons.
  const collapse = props.registry.formContext?.collapse;
  const pointer = pathToPointer(path);
  const expanded = collapse ? collapse.expandedPointers.has(pointer) : true;

  if (isStage) {
    // The stage's working-change baseline: the loaded config's slice at this
    // stage's path. Resolved HERE (the layer that knows the path) and handed
    // down as a value — the section never re-resolves.
    const formBaseline = props.registry.formContext?.baseline;
    const baseline =
      formBaseline === undefined
        ? undefined
        : {
            value: getAtPath(
              formBaseline,
              path.map((segment) => String(segment))
            ),
          };
    return (
      <StageObjectSection
        pointer={pointer}
        title={prettyTitle}
        schema={schema}
        formData={props.formData}
        properties={properties}
        description={description}
        collapse={collapse}
        expanded={expanded}
        baseline={baseline}
        onStageRestoreRequest={props.registry.formContext?.onStageRestoreRequest}
      />
    );
  }

  // Depth ≥2 (config explorer v2): every nested object is the SAME flat
  // disclosure row — no well cards, no inter-section gaps. The hairlines
  // come from the parent's `divide-y`; depth reads through the recursive
  // body indent (each level's rows start one `bodyIndent` deeper) plus the
  // heading tier (group eyebrow at depth 2, the dimmer sub-group eyebrow
  // below).
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
          className={cn("py-2 hover:bg-muted/20 transition-colors", FORM.headerInset)}
        />
      ) : (
        <header className={cn("py-2", FORM.headerInset)}>
          <div className={headingClass}>{prettyTitle}</div>
        </header>
      )}
      {expanded ? (
        <div id={collapse ? configContentId(pointer) : undefined} className={FORM.bodyIndent}>
          {description ? (
            <div className={cn("text-data pb-2", FORM.fieldRunInset, labelClass)}>
              {description}
            </div>
          ) : null}
          <FlatObjectChildren
            properties={properties}
            schema={schema}
            fieldsClass={cn("py-3", FORM.fieldRunInset)}
          />
        </div>
      ) : null}
    </section>
  );
}

export function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
) {
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
        className={cn("px-2 py-1 text-data rounded border", FORM.button)}
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
          className={cn("py-2 hover:bg-muted/20 transition-colors", FORM.headerInset)}
          actions={addButton}
        />
      ) : (
        <div className={cn("flex items-center gap-2 py-2", FORM.headerInset)}>
          <div className={FORM.groupHeading}>{prettyTitle}</div>
          <div style={{ flex: 1 }} />
          {addButton}
        </div>
      )}
      {expanded ? (
        <div id={collapse ? configContentId(pointer) : undefined} className={FORM.bodyIndent}>
          {renderGsComments({ schema, className: cn("pb-2", FORM.fieldRunInset, labelClass) })}
          <div className="flex flex-col divide-y divide-border-subtle">
            {items.map((item, index) => {
              // RJSF v6 types this as ReactElement[], but some templates/versions
              // pass an "item" object that wraps the actual element in `.children`.
              const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
              return (
                <div key={item.key ?? index} className={cn("py-3", FORM.fieldRunInset)}>
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
