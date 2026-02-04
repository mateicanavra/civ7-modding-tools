import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema } from "@rjsf/utils";
import { pathToPointer, schemaIsGroup, type BrowserConfigSchemaDef } from "./schemaPresentation";

export type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
  lightMode?: boolean;
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
  const isBoolean = schemaType === "boolean";

  if (isBoolean) {
    return (
      <div className={["bc-field", "bc-fieldRow", classNames].filter(Boolean).join(" ")}>
        <div className="bc-fieldMeta">
          {displayLabel && label ? (
            <label className="bc-label" htmlFor={id}>
              {prettyLabel}
              {required ? <span className="bc-required">*</span> : null}
            </label>
          ) : null}
          {description ? <div className="bc-desc">{description}</div> : null}
        </div>
        <div className="bc-fieldControl">{children}</div>
        {errors ? <div className="bc-errors">{errors}</div> : null}
        {help ? <div className="bc-desc">{help}</div> : null}
      </div>
    );
  }

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
    return <div className="bc-root">{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  if (isTransparent) {
    return <div className="bc-transparent">{properties.filter((p) => !p.hidden).map((p) => p.content)}</div>;
  }

  const prettyTitle = title ? humanizeSchemaLabel(title) : leafKey ? humanizeSchemaLabel(leafKey) : "Section";
  const titleLower = prettyTitle.toLowerCase();
  const isStage = depth === 1;
  const isTopGroup = depth === 2;
  const hasNestedGroups = schemaHasNestedGroups(props.schema);

  const content = (
    <div className={hasNestedGroups ? "bc-groupBody" : "bc-groupBody bc-groupBodyCompact"}>
      {!isStage && description ? (
        <div className="bc-desc bc-groupDesc">
          {description}
        </div>
      ) : null}
      {properties.filter((p) => !p.hidden).map((p) => p.content)}
    </div>
  );

  if (isStage) {
    return (
      <section className="bc-stage">
        <header className="bc-stageHeader">
          <div className="bc-stageTitle">{prettyTitle}</div>
          {description ? <div className="bc-stageMeta">{description}</div> : null}
        </header>
        {content}
      </section>
    );
  }

  const headingClass = ["bc-groupTitle", isTopGroup ? "bc-depth2" : "bc-depth3"].join(" ");
  const wrapperClass = isTopGroup ? "bc-group" : "bc-subgroup";

  return (
    <section className={wrapperClass}>
      <header className="bc-groupHeader">
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

  return (
    <section className="bc-array">
      <div className="bc-arrayHeader">
        <div className="bc-arrayTitle">{prettyTitle}</div>
        <div style={{ flex: 1 }} />
        {canAdd && allowMutations ? (
          <button type="button" className="bc-button" onClick={onAddClick}>
            Add
          </button>
        ) : null}
      </div>
      <div className="bc-arrayItems">
        {items.map((item, index) => {
          // RJSF v6 types this as ReactElement[], but some templates/versions
          // pass an "item" object that wraps the actual element in `.children`.
          const content = (item as any)?.children ?? (item as any)?.props?.children ?? item;
          return (
            <div key={item.key ?? index} className="bc-arrayItem">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
