import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import { pathToPointer, schemaIsGroup, type BrowserConfigSchemaDef } from "./schemaPresentation";

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
};

function humanizeSchemaLabel(label: string): string {
  const s = label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function schemaHasNestedGroups(schema: BrowserConfigSchemaDef | undefined): boolean {
  if (!schema || typeof schema === "boolean") return false;
  if (schema.type !== "object") return false;
  const props = schema.properties;
  if (!props) return false;
  return Object.values(props).some((child) => schemaIsGroup(child));
}

export function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { id, label, required, description, errors, help, children, hidden, classNames, displayLabel } = props;
  if (hidden) return <div style={{ display: "none" }} />;
  const prettyLabel = label ? humanizeSchemaLabel(label) : "";
  const schemaType = props.schema?.type;
  const suppressDescription = schemaType === "object" || schemaType === "array";

  return (
    <div className={["bc-field", classNames].filter(Boolean).join(" ")}>
      {displayLabel && label ? (
        <label className="bc-label" htmlFor={id}>
          {prettyLabel}
          {required ? <span className="bc-required">*</span> : null}
        </label>
      ) : null}
      {description && !suppressDescription ? <div className="bc-desc">{description}</div> : null}
      <div>{children}</div>
      {errors ? <div className="bc-errors">{errors}</div> : null}
      {help ? <div className="bc-desc">{help}</div> : null}
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

  if (isRoot) {
    return <div>{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  if (isTransparent) {
    return <div>{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  const prettyTitle = title ? humanizeSchemaLabel(title) : leafKey ? humanizeSchemaLabel(leafKey) : "Section";
  const titleLower = prettyTitle.toLowerCase();
  const isKnobs = leafKey === "knobs" || titleLower === "knobs";
  const isStage = depth === 1;
  const isTopGroup = depth === 2;
  const defaultOpen = isKnobs || isStage || (leafKey !== "advanced" && depth <= 2);
  const hasNestedGroups = schemaHasNestedGroups(props.schema);
  const useDetails = !isStage && hasNestedGroups; // only parents collapse; leaf groups render without toggles.
  const groupClass = isTopGroup ? "bc-depth2Group" : undefined;

  const content = (
    <div style={{ marginTop: useDetails ? 10 : 0 }}>
      {description ? (
        <div className="bc-desc" style={{ marginBottom: 10 }}>
          {description}
        </div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  // Stage card is the first visible container.
  if (isStage) {
    return (
      <details className="bc-section" open>
        <summary>
          <div className="bc-stageTitle">{prettyTitle}</div>
        </summary>
        <div className="bc-stageDivider" />
        {content}
      </details>
    );
  }

  // Nested groups render flat (no extra card), using header hierarchy + padding.
  const headingClass = ["bc-sectionTitle", isTopGroup ? "bc-depth2" : "bc-depth3"].join(" ");
  const wrapperClass = ["bc-subsection", groupClass].filter(Boolean).join(" ");
  if (!useDetails) {
    return (
      <div className={wrapperClass}>
        <div className="bc-subsectionHeader">
          <div className={headingClass}>{prettyTitle}</div>
        </div>
        {content}
      </div>
    );
  }

  return (
    <details className={wrapperClass} open={defaultOpen}>
      <summary className="bc-subsectionHeader" style={{ cursor: "pointer", listStyle: "none" }}>
        <div className={headingClass}>{prettyTitle}</div>
      </summary>
      {content}
    </details>
  );
}

export function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<unknown, RJSFSchema, BrowserConfigFormContext>
){
  const { title, items, canAdd, onAddClick, disabled, readonly } = props;
  const prettyTitle = title ? humanizeSchemaLabel(title) : "Items";
  const allowMutations = !disabled && !readonly;

  return (
    <div className="bc-section">
      <div className="bc-actionsRow" style={{ marginBottom: 10 }}>
        <div className="bc-sectionTitle">{prettyTitle}</div>
        <div style={{ flex: 1 }} />
        {canAdd && allowMutations ? (
          <button type="button" onClick={onAddClick}>
            Add
          </button>
        ) : null}
      </div>
      {items.map((item, index) => (
        <div key={item.key ?? index} className="bc-arrayItem">
          {item}
        </div>
      ))}
    </div>
  );
}
