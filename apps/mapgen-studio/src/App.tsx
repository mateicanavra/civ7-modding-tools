import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeckGL } from "@deck.gl/react";
import { OrthographicView } from "@deck.gl/core";
import { PathLayer, ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import Form from "@rjsf/core";
import { customizeValidator } from "@rjsf/validator-ajv8";
import type { ArrayFieldTemplateProps, FieldTemplateProps, ObjectFieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import { normalizeStrict } from "@swooper/mapgen-core/compiler/normalize";
import type { VizLayerMeta } from "@swooper/mapgen-core";
import {
  BROWSER_TEST_RECIPE_CONFIG,
  BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
  type BrowserTestRecipeConfig,
} from "@mapgen/browser-recipes/browser-test";
import type { BrowserRunEvent, BrowserRunRequest } from "./browser-runner/protocol";

type Bounds = [minX: number, minY: number, maxX: number, maxY: number];
type BrowserConfigFormContext = {
  transparentPaths: ReadonlySet<string>;
};

type VizScalarFormat = "u8" | "i8" | "u16" | "i16" | "i32" | "f32";

type VizLayerEntryV0 =
  | {
      kind: "grid";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      format: VizScalarFormat;
      dims: { width: number; height: number };
      path?: string;
      values?: ArrayBuffer;
      meta?: VizLayerMeta;
      bounds: Bounds;
    }
  | {
      kind: "points";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      positionsPath?: string;
      positions?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
      meta?: VizLayerMeta;
      bounds: Bounds;
    }
  | {
      kind: "segments";
      layerId: string;
      stepId: string;
      phase?: string;
      stepIndex: number;
      count: number;
      segmentsPath?: string;
      segments?: ArrayBuffer;
      valuesPath?: string;
      values?: ArrayBuffer;
      valueFormat?: VizScalarFormat;
      meta?: VizLayerMeta;
      bounds: Bounds;
    };

type VizManifestV0 = {
  version: 0;
  runId: string;
  planFingerprint: string;
  steps: Array<{ stepId: string; phase?: string; stepIndex: number }>;
  layers: VizLayerEntryV0[];
};

type FileMap = Map<string, File>;

type EraLayerInfo = { eraIndex: number; baseLayerId: string };

const browserConfigFormCss = `
.browserConfigForm {
  color: #e5e7eb;
}
.browserConfigForm * {
  box-sizing: border-box;
}

.browserConfigForm .bc-depth2Group + .bc-depth2Group {
  border-top: 1px solid rgba(148, 163, 184, 0.14);
  margin-top: 14px;
  padding-top: 14px;
}
.browserConfigForm .bc-subsection:not(.bc-depth2Group) + .bc-subsection:not(.bc-depth2Group) {
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  margin-top: 12px;
  padding-top: 12px;
}

.browserConfigForm .bc-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0 0 12px 0;
}
.browserConfigForm .bc-label {
  display: flex;
  gap: 6px;
  align-items: baseline;
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.01em;
  color: #e5e7eb;
}
.browserConfigForm .bc-required {
  color: #fca5a5;
  font-weight: 700;
}
.browserConfigForm .bc-desc {
  font-size: 12px;
  line-height: 1.35;
  color: #9ca3af;
}
.browserConfigForm .bc-errors,
.browserConfigForm .error-detail,
.browserConfigForm .errors {
  font-size: 12px;
  line-height: 1.35;
  color: #fca5a5;
}
.browserConfigForm .bc-errors ul,
.browserConfigForm .errors ul {
  margin: 6px 0 0;
  padding-left: 18px;
}

.browserConfigForm input,
.browserConfigForm select,
.browserConfigForm textarea {
  width: 100%;
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(17, 24, 39, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.22);
  color: #e5e7eb;
  font-size: 13px;
}
.browserConfigForm input[type=\"checkbox\"] {
  width: 16px;
  height: 16px;
  padding: 0;
  border-radius: 4px;
}
.browserConfigForm input:focus,
.browserConfigForm select:focus,
.browserConfigForm textarea:focus {
  outline: none;
  border-color: rgba(96, 165, 250, 0.75);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.22);
}
.browserConfigForm input:disabled,
.browserConfigForm select:disabled,
.browserConfigForm textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.browserConfigForm .bc-section {
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 12px;
  background: rgba(2, 6, 23, 0.4);
  padding: 10px 10px;
  margin: 0 0 10px 0;
}
.browserConfigForm .bc-stageTitle {
  font-size: 16px;
  font-weight: 750;
  letter-spacing: 0.01em;
  color: #e5e7eb;
}
.browserConfigForm .bc-stageDivider {
  height: 1px;
  background: rgba(148, 163, 184, 0.14);
  margin: 8px 0 12px;
}
.browserConfigForm .bc-section summary {
  cursor: pointer;
  user-select: none;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.browserConfigForm .bc-section summary::after {
  content: "▸";
  color: rgba(148, 163, 184, 0.85);
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 120ms ease;
}
.browserConfigForm details[open].bc-section summary::after {
  transform: rotate(90deg);
}
.browserConfigForm details.bc-subsection summary::after {
  content: "▸";
  color: rgba(148, 163, 184, 0.85);
  font-size: 12px;
  transform: rotate(0deg);
  transition: transform 120ms ease;
}
.browserConfigForm details[open].bc-subsection summary::after {
  transform: rotate(90deg);
}
.browserConfigForm .bc-section summary::-webkit-details-marker {
  display: none;
}
.browserConfigForm .bc-sectionTitle {
  font-size: 14px;
  font-weight: 700;
  color: #e5e7eb;
}
.browserConfigForm .bc-sectionTitle.bc-depth2 {
  font-size: 14px;
}
.browserConfigForm .bc-sectionTitle.bc-depth3 {
  font-size: 13px;
  color: rgba(229, 231, 235, 0.92);
}
.browserConfigForm .bc-sectionMeta {
  font-size: 11px;
  color: #9ca3af;
}
.browserConfigForm .bc-subsection {
  margin: 0 0 12px 0;
  padding: 0;
  border: 0;
  background: transparent;
}
.browserConfigForm .bc-subsectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px 0;
}
.browserConfigForm .bc-subsectionTitle {
  font-size: 13px;
  font-weight: 750;
  color: #e5e7eb;
  letter-spacing: 0.01em;
  text-transform: none;
}

.browserConfigForm .bc-arrayItem {
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.38);
  padding: 10px;
  margin: 0 0 10px 0;
}
.browserConfigForm .bc-actionsRow {
  display: flex;
  gap: 8px;
  align-items: center;
}
.browserConfigForm button {
  appearance: none;
  border-radius: 10px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(17, 24, 39, 0.85);
  color: #e5e7eb;
  padding: 7px 10px;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
}
.browserConfigForm button:hover {
  border-color: rgba(148, 163, 184, 0.45);
  background: rgba(31, 41, 55, 0.85);
}
.browserConfigForm button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
`;

const browserConfigValidator = customizeValidator<
  BrowserTestRecipeConfig,
  RJSFSchema,
  BrowserConfigFormContext
>();

function humanizeSchemaLabel(label: string): string {
  const s = label
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim();
  return s.replace(/\b\w/g, (m) => m.toUpperCase());
}

function BrowserConfigFieldTemplate(
  props: FieldTemplateProps<BrowserTestRecipeConfig, RJSFSchema, BrowserConfigFormContext>
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

type BrowserConfigSchemaDef = RJSFSchema | boolean;

function schemaIsGroup(schema: BrowserConfigSchemaDef | undefined): boolean {
  if (!schema || typeof schema === "boolean") return false;
  if (schema.type === "object" || schema.type === "array") return true;
  return false;
}

function schemaHasNestedGroups(schema: BrowserConfigSchemaDef | undefined): boolean {
  if (!schema || typeof schema === "boolean") return false;
  if (schema.type !== "object") return false;
  const props = schema.properties;
  if (!props) return false;
  return Object.values(props).some((child) => schemaIsGroup(child));
}

function pathToPointer(path: Array<string | number>): string {
  if (!path.length) return "";
  const parts = path.map((p) => String(p).replace(/~/g, "~0").replace(/\//g, "~1"));
  return `/${parts.join("/")}`;
}

function collectTransparentPaths(schema: RJSFSchema): ReadonlySet<string> {
  const out = new Set<string>();

  const visit = (node: BrowserConfigSchemaDef | undefined, path: Array<string | number>): void => {
    if (!node || typeof node === "boolean") return;

    const nodeAnyOf = node.anyOf;
    if (Array.isArray(nodeAnyOf)) {
      for (const opt of nodeAnyOf) visit(opt as BrowserConfigSchemaDef, path);
    }
    const nodeOneOf = node.oneOf;
    if (Array.isArray(nodeOneOf)) {
      for (const opt of nodeOneOf) visit(opt as BrowserConfigSchemaDef, path);
    }
    const nodeAllOf = node.allOf;
    if (Array.isArray(nodeAllOf)) {
      for (const opt of nodeAllOf) visit(opt as BrowserConfigSchemaDef, path);
    }

    if (node.type === "array") {
      const items = node.items;
      if (Array.isArray(items)) {
        for (const opt of items) visit(opt as BrowserConfigSchemaDef, path);
      } else {
        visit(items as BrowserConfigSchemaDef, path);
      }
      return;
    }

    if (node.type !== "object") return;
    const props = node.properties;
    if (!props) return;

    const propKeys = Object.keys(props);
    // Never collapse the very top-level wrapper: we want the stage container (e.g. “Foundation”)
    // to remain visible even when there's only one stage in the schema.
    if (path.length > 0 && propKeys.length === 1 && node.description == null) {
      const onlyKey = propKeys[0]!;
      const child = (props as Record<string, BrowserConfigSchemaDef>)[onlyKey];
      if (schemaIsGroup(child) && typeof child !== "boolean" && child.description == null) {
        // Collapse a single-child wrapper by hiding the only child object header. This keeps
        // the parent title (e.g. “Mesh”) while removing redundant middle layers (e.g. “Compute Mesh”).
        out.add(pathToPointer([...path, onlyKey]));
      }
    }

    for (const key of propKeys) {
      visit((props as Record<string, BrowserConfigSchemaDef>)[key], [...path, key]);
    }
  };

  visit(schema, []);
  return out;
}

function BrowserConfigObjectFieldTemplate(
  props: ObjectFieldTemplateProps<BrowserTestRecipeConfig, RJSFSchema, BrowserConfigFormContext>
){
  const { title, description, properties, fieldPathId } = props;
  const path = fieldPathId.path ?? [];
  const transparentPaths = props.registry.formContext.transparentPaths;
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

  // Stage card (e.g. “Foundation”) is the first visible container.
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

function BrowserConfigArrayFieldTemplate(
  props: ArrayFieldTemplateProps<BrowserTestRecipeConfig, RJSFSchema, BrowserConfigFormContext>
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function assertIsRjsfSchema(schema: unknown): asserts schema is RJSFSchema {
  if (!isPlainObject(schema)) throw new Error("Invalid config schema: expected object");
  const type = schema.type;
  if (type !== "object") throw new Error(`Invalid config schema: expected type "object", got ${String(type)}`);
}

function normalizeScalarAnyOfEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  const anyOf = schema.anyOf;
  if (!Array.isArray(anyOf) || anyOf.length === 0) return null;

  const constValues: unknown[] = [];
  let detectedType: string | null = null;

  for (const option of anyOf) {
    if (!isPlainObject(option)) return null;
    if (!("const" in option)) return null;
    constValues.push((option as Record<string, unknown>).const);

    const optionType = (option as Record<string, unknown>).type;
    if (typeof optionType === "string") {
      if (detectedType == null) detectedType = optionType;
      if (detectedType !== optionType) return null;
    }
  }

  const unique = [...new Set(constValues.map((v) => JSON.stringify(v)))].map((s) => JSON.parse(s) as unknown);
  if (unique.length !== constValues.length) return null;

  const inferred = detectedType
    ? detectedType
    : unique.every((v) => typeof v === "string")
      ? "string"
      : unique.every((v) => typeof v === "number" && Number.isFinite(v))
        ? "number"
        : unique.every((v) => typeof v === "boolean")
          ? "boolean"
          : null;
  if (!inferred) return null;

  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: unique };
  delete normalized.anyOf;
  return normalized;
}

function normalizeScalarOneOfEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  const oneOf = schema.oneOf;
  if (!Array.isArray(oneOf) || oneOf.length === 0) return null;

  const constValues: unknown[] = [];
  let detectedType: string | null = null;

  for (const option of oneOf) {
    if (!isPlainObject(option)) return null;
    if (!("const" in option)) return null;
    constValues.push((option as Record<string, unknown>).const);

    const optionType = (option as Record<string, unknown>).type;
    if (typeof optionType === "string") {
      if (detectedType == null) detectedType = optionType;
      if (detectedType !== optionType) return null;
    }
  }

  const unique = [...new Set(constValues.map((v) => JSON.stringify(v)))].map((s) => JSON.parse(s) as unknown);
  if (unique.length !== constValues.length) return null;

  const inferred = detectedType
    ? detectedType
    : unique.every((v) => typeof v === "string")
      ? "string"
      : unique.every((v) => typeof v === "number" && Number.isFinite(v))
        ? "number"
        : unique.every((v) => typeof v === "boolean")
          ? "boolean"
          : null;
  if (!inferred) return null;

  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: unique };
  delete normalized.oneOf;
  return normalized;
}

function normalizeScalarConstEnumLike(schema: Record<string, unknown>): Record<string, unknown> | null {
  if (!("const" in schema)) return null;
  const value = schema.const;
  const t = schema.type;
  const inferred =
    typeof t === "string"
      ? t
      : typeof value === "string"
        ? "string"
        : typeof value === "number" && Number.isFinite(value)
          ? "number"
          : typeof value === "boolean"
            ? "boolean"
            : null;
  if (!inferred) return null;
  const normalized: Record<string, unknown> = { ...schema, type: inferred, enum: [value], default: schema.default ?? value };
  // Keep the value visible but prevent confusing free-text editing.
  normalized.readOnly = true;
  delete normalized.const;
  return normalized;
}

function normalizeSingleVariantUnion(schema: Record<string, unknown>): Record<string, unknown> | null {
  const anyOf = schema.anyOf;
  if (Array.isArray(anyOf) && anyOf.length === 1 && isPlainObject(anyOf[0])) {
    const base: Record<string, unknown> = { ...schema };
    delete base.anyOf;
    const option = anyOf[0] as Record<string, unknown>;
    // Preserve top-level titles/descriptions while removing the pointless “Option 1” selector.
    return { ...option, ...base };
  }
  const oneOf = schema.oneOf;
  if (Array.isArray(oneOf) && oneOf.length === 1 && isPlainObject(oneOf[0])) {
    const base: Record<string, unknown> = { ...schema };
    delete base.oneOf;
    const option = oneOf[0] as Record<string, unknown>;
    return { ...option, ...base };
  }
  return null;
}

function normalizeSchemaForRjsf(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(normalizeSchemaForRjsf);
  if (!isPlainObject(schema)) return schema;

  const normalizedAnyOf = normalizeScalarAnyOfEnumLike(schema);
  const normalizedOneOf = normalizedAnyOf ? null : normalizeScalarOneOfEnumLike(schema);
  const normalizedConst = normalizedAnyOf || normalizedOneOf ? null : normalizeScalarConstEnumLike(schema);
  const normalizedSingle = normalizedAnyOf || normalizedOneOf || normalizedConst ? null : normalizeSingleVariantUnion(schema);
  const base = normalizedAnyOf ?? normalizedOneOf ?? normalizedConst ?? normalizedSingle ?? schema;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(base)) {
    out[k] = normalizeSchemaForRjsf(v);
  }
  return out;
}

function toRjsfSchema(schema: unknown): RJSFSchema {
  assertIsRjsfSchema(schema);
  return schema;
}

function formatConfigErrors(errors: ReadonlyArray<{ path: string; message: string }>): string {
  return errors.map((e) => `${e.path}: ${e.message}`).join("\n");
}

function stripRootDirPrefix(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return path;
  return parts.slice(1).join("/");
}

function formatLabel(stepId: string): string {
  return stepId.split(".").slice(-1)[0] ?? stepId;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function niceStep(target: number): number {
  const t = Math.max(1e-9, target);
  const pow = Math.pow(10, Math.floor(Math.log10(t)));
  const scaled = t / pow;
  if (scaled <= 1) return 1 * pow;
  if (scaled <= 2) return 2 * pow;
  if (scaled <= 5) return 5 * pow;
  return 10 * pow;
}

function axialToPixelPointy(q: number, r: number, size: number): [number, number] {
  const x = size * Math.sqrt(3) * (q + r / 2);
  const y = size * 1.5 * r;
  return [x, y];
}

type TileLayout = "row-offset" | "col-offset";

type Civ7MapSizePreset = {
  id: "MAPSIZE_TINY" | "MAPSIZE_SMALL" | "MAPSIZE_STANDARD" | "MAPSIZE_LARGE" | "MAPSIZE_HUGE";
  label: "Tiny" | "Small" | "Standard" | "Large" | "Huge";
  dimensions: { width: number; height: number };
};

const CIV7_MAP_SIZES: Civ7MapSizePreset[] = [
  { id: "MAPSIZE_TINY", label: "Tiny", dimensions: { width: 60, height: 38 } },
  { id: "MAPSIZE_SMALL", label: "Small", dimensions: { width: 74, height: 46 } },
  { id: "MAPSIZE_STANDARD", label: "Standard", dimensions: { width: 84, height: 54 } },
  { id: "MAPSIZE_LARGE", label: "Large", dimensions: { width: 96, height: 60 } },
  { id: "MAPSIZE_HUGE", label: "Huge", dimensions: { width: 106, height: 66 } },
];

function getCiv7MapSizePreset(id: Civ7MapSizePreset["id"]): Civ7MapSizePreset {
  return CIV7_MAP_SIZES.find((m) => m.id === id) ?? CIV7_MAP_SIZES[CIV7_MAP_SIZES.length - 1]!;
}

function formatMapSizeLabel(p: Civ7MapSizePreset): string {
  return `${p.label} (${p.dimensions.width}×${p.dimensions.height})`;
}

function safeStringify(value: unknown): string | null {
  try {
    const seen = new WeakSet<object>();
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === "bigint") return `${v}n`;
        if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
        if (v && typeof v === "object") {
          if (seen.has(v)) return "[Circular]";
          seen.add(v);
        }
        return v;
      },
      2
    );
  } catch {
    return null;
  }
}

function formatErrorForUi(e: unknown): string {
  if (e instanceof Error) {
    const parts: string[] = [];
    const header = e.name ? `${e.name}: ${e.message}` : e.message;
    parts.push(header || "Error");
    const details = safeStringify(e);
    if (details && details !== "{}") parts.push(details);
    if (e.stack) parts.push(e.stack);
    return parts.join("\n\n");
  }

  if (e instanceof ErrorEvent) {
    const parts: string[] = [];
    parts.push(e.message || "ErrorEvent");
    if (e.filename) parts.push(`${e.filename}:${e.lineno}:${e.colno}`);
    if (e.error) parts.push(formatErrorForUi(e.error));
    return parts.join("\n\n");
  }

  if (typeof e === "string") return e;
  if (typeof e === "number" || typeof e === "boolean" || typeof e === "bigint") return String(e);

  const json = safeStringify(e);
  return json ?? String(e);
}

function randomU32(): number {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const buf = new Uint32Array(1);
      crypto.getRandomValues(buf);
      return buf[0] ?? 0;
    }
  } catch {
    // ignore
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

function oddQToAxialR(row: number, colParityBase: number): number {
  const q = colParityBase | 0;
  return row - (q - (q & 1)) / 2;
}

function oddQTileCenter(col: number, row: number, size: number): [number, number] {
  const r = oddQToAxialR(row, col);
  return axialToPixelPointy(col, r, size);
}

function oddQPointFromTileXY(x: number, y: number, size: number): [number, number] {
  const qParityBase = Math.round(x);
  const r = oddQToAxialR(y, qParityBase);
  return axialToPixelPointy(x, r, size);
}

function oddRTileCenter(col: number, row: number, size: number): [number, number] {
  // Pointy-top, rows offset horizontally.
  // Equivalent to: axial(q = col - (row - (row&1))/2, r = row) → pointy pixel.
  const x = size * Math.sqrt(3) * (col + ((row & 1) ? 0.5 : 0));
  const y = size * 1.5 * row;
  return [x, y];
}

function oddRPointFromTileXY(x: number, y: number, size: number): [number, number] {
  // Use the integer row parity for horizontal shift; y may be fractional for centroids.
  const row = Math.floor(y);
  const px = size * Math.sqrt(3) * (x + ((row & 1) ? 0.5 : 0));
  const py = size * 1.5 * y;
  return [px, py];
}

function hexPolygonPointy(center: [number, number], size: number): Array<[number, number]> {
  const [cx, cy] = center;
  const out: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = ((30 + 60 * i) * Math.PI) / 180;
    out.push([cx + size * Math.cos(angle), cy + size * Math.sin(angle)]);
  }
  return out;
}

function boundsForTileGrid(layout: TileLayout, dims: { width: number; height: number }, size: number): Bounds {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let y = 0; y < dims.height; y++) {
    for (let x = 0; x < dims.width; x++) {
      const [cx, cy] = layout === "col-offset" ? oddQTileCenter(x, y, size) : oddRTileCenter(x, y, size);
      minX = Math.min(minX, cx - size);
      maxX = Math.max(maxX, cx + size);
      minY = Math.min(minY, cy - size);
      maxY = Math.max(maxY, cy + size);
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return [0, 0, 1, 1];
  }

  return [minX, minY, maxX, maxY];
}

function fitToBounds(bounds: Bounds, viewport: { width: number; height: number }): { target: [number, number, number]; zoom: number } {
  const [minX, minY, maxX, maxY] = bounds;
  const bw = Math.max(1e-6, maxX - minX);
  const bh = Math.max(1e-6, maxY - minY);
  const padding = 0.92;
  const scale = Math.min((viewport.width * padding) / bw, (viewport.height * padding) / bh);
  const zoom = Math.log2(Math.max(1e-6, scale));
  return { target: [(minX + maxX) / 2, (minY + maxY) / 2, 0], zoom };
}

type RgbaColor = [number, number, number, number];

function hashStringToSeed(input: string): number {
  let hash = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (hh < 60) {
    r = c;
    g = x;
  } else if (hh < 120) {
    r = x;
    g = c;
  } else if (hh < 180) {
    g = c;
    b = x;
  } else if (hh < 240) {
    g = x;
    b = c;
  } else if (hh < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function randomColor(rng: () => number): RgbaColor {
  const hue = rng() * 360;
  const saturation = 0.62 + rng() * 0.28;
  const lightness = 0.48 + rng() * 0.18;
  const [r, g, b] = hslToRgb(hue, saturation, lightness);
  return [r, g, b, 230];
}

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function rgbToOklab(rgb: RgbaColor): [number, number, number] {
  const r = srgbToLinear(rgb[0]);
  const g = srgbToLinear(rgb[1]);
  const b = srgbToLinear(rgb[2]);

  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

  return [L, A, B];
}

function oklabDistance(a: RgbaColor, b: RgbaColor): number {
  const [l1, a1, b1] = rgbToOklab(a);
  const [l2, a2, b2] = rgbToOklab(b);
  const dl = l1 - l2;
  const da = a1 - a2;
  const db = b1 - b2;
  return dl * dl + da * da + db * db;
}

function isPlateIdLayer(layerId: string): boolean {
  const lower = layerId.toLowerCase();
  if (lower.includes("boundarytype")) return false;
  if (!lower.includes("plate")) return false;
  if (lower.includes("celltoplate")) return true;
  if (lower.includes("tileplate")) return true;
  if (lower.includes("plateid")) return true;
  if (lower.includes("plateseed")) return true;
  return lower.includes("plate") && lower.includes("id");
}

function collectPlateIds(values: ArrayBufferView): number[] {
  const view = values as unknown as ArrayLike<number>;
  const ids = new Set<number>();
  for (let i = 0; i < view.length; i++) {
    const v = view[i] ?? 0;
    ids.add((v as number) | 0);
  }
  return [...ids].filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
}

function generateOpposedPalette(count: number, seedKey: string): RgbaColor[] {
  if (count <= 0) return [];
  const rng = createRng(hashStringToSeed(seedKey));
  const poolSize = Math.max(64, count * 12);
  const candidates: RgbaColor[] = Array.from({ length: poolSize }, () => randomColor(rng));
  const used = new Array(candidates.length).fill(false);
  const selected: RgbaColor[] = [];

  const firstIndex = Math.floor(rng() * candidates.length);
  selected.push(candidates[firstIndex] ?? [148, 163, 184, 220]);
  used[firstIndex] = true;

  while (selected.length < count) {
    let bestIndex = -1;
    let bestScore = -Infinity;
    const allowReuse = selected.length >= candidates.length;

    for (let i = 0; i < candidates.length; i++) {
      if (!allowReuse && used[i]) continue;
      const color = candidates[i]!;

      let minDist = Infinity;
      for (const chosen of selected) {
        const d = oklabDistance(color, chosen);
        if (d < minDist) minDist = d;
      }

      if (!Number.isFinite(minDist)) minDist = 0;
      const score = minDist + rng() * 1e-3;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) {
      bestIndex = Math.floor(rng() * candidates.length);
    }

    const chosen = candidates[bestIndex] ?? [148, 163, 184, 220];
    selected.push(chosen);
    if (bestIndex >= 0 && bestIndex < used.length) used[bestIndex] = true;
  }

  return selected;
}

function buildPlateColorMap(options: {
  values: ArrayBufferView;
  seedKey: string;
}): Map<number, RgbaColor> {
  const ids = collectPlateIds(options.values);
  const palette = generateOpposedPalette(ids.length, options.seedKey);
  const colorById = new Map<number, RgbaColor>();
  for (let i = 0; i < ids.length; i++) {
    colorById.set(ids[i]!, palette[i] ?? [148, 163, 184, 220]);
  }

  return colorById;
}

function resolveCategoryColor(meta: VizLayerMeta | undefined, value: number): RgbaColor | null {
  if (!meta?.categories?.length) return null;
  for (const entry of meta.categories) {
    if (typeof entry.value === "number") {
      if (Number(entry.value) === value) return entry.color;
      continue;
    }
    if (String(entry.value) === String(value)) return entry.color;
  }
  return null;
}

function formatLayerLabel(layer: VizLayerEntryV0): string {
  const base = layer.meta?.label ?? layer.layerId;
  const visibility = layer.meta?.visibility === "debug" ? ", debug" : "";
  return `${base} (${layer.kind}${visibility})`;
}

function colorForValue(
  layerId: string,
  value: number,
  plateColorMap?: Map<number, RgbaColor>,
  meta?: VizLayerMeta
): RgbaColor {
  if (!Number.isFinite(value)) return [120, 120, 120, 220];

  const categoryColor = resolveCategoryColor(meta, value);
  if (categoryColor) return categoryColor;

  if (layerId.toLowerCase().includes("landmask")) {
    return value > 0 ? [34, 197, 94, 230] : [37, 99, 235, 230];
  }

  if (layerId.includes("crust") && layerId.toLowerCase().includes("type")) {
    return value === 1 ? [34, 197, 94, 230] : [37, 99, 235, 230];
  }

  if (layerId.includes("boundaryType")) {
    if (value === 1) return [239, 68, 68, 240];
    if (value === 2) return [59, 130, 246, 240];
    if (value === 3) return [245, 158, 11, 240];
    return [107, 114, 128, 180];
  }

  if (isPlateIdLayer(layerId)) {
    if (plateColorMap) {
      return plateColorMap.get(value | 0) ?? [148, 163, 184, 220];
    }
    const seedKey = `${layerId}:${value}`;
    const rng = createRng(hashStringToSeed(seedKey));
    return randomColor(rng);
  }

  // generic 0..1 mapping (expanded palette)
  const t = clamp(value, 0, 1);
  const ramp: RgbaColor[] = [
    [68, 1, 84, 230],
    [59, 82, 139, 230],
    [33, 145, 140, 230],
    [94, 201, 98, 230],
    [253, 231, 37, 230],
  ];

  const idx = t * (ramp.length - 1);
  const i0 = Math.max(0, Math.min(ramp.length - 1, Math.floor(idx)));
  const i1 = Math.max(0, Math.min(ramp.length - 1, Math.ceil(idx)));
  const tt = idx - i0;
  const a = ramp[i0]!;
  const b = ramp[i1]!;
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * tt);
  return [lerp(a[0], b[0]), lerp(a[1], b[1]), lerp(a[2], b[2]), lerp(a[3], b[3])];
}

type LegendItem = { label: string; color: [number, number, number, number] };

function legendForLayer(layer: VizLayerEntryV0 | null, stats: { min?: number; max?: number } | null): { title: string; items: LegendItem[]; note?: string } | null {
  if (!layer) return null;
  const id = layer.layerId;
  const label = layer.meta?.label ?? id;

  if (layer.meta?.categories?.length) {
    return {
      title: label,
      items: layer.meta.categories.map((entry) => ({
        label: entry.label,
        color: entry.color,
      })),
    };
  }

  if (id.toLowerCase().includes("landmask")) {
    return {
      title: label,
      items: [
        { label: "0 = water", color: [37, 99, 235, 230] },
        { label: "1 = land", color: [34, 197, 94, 230] },
      ],
    };
  }

  if (id.endsWith("tileBoundaryType") || id.endsWith("boundaryType") || id.includes("boundaryType")) {
    return {
      title: label,
      items: [
        { label: "0 = none/unknown", color: [107, 114, 128, 180] },
        { label: "1 = convergent", color: [239, 68, 68, 240] },
        { label: "2 = divergent", color: [59, 130, 246, 240] },
        { label: "3 = transform", color: [245, 158, 11, 240] },
      ],
    };
  }

  if (id.includes("crusttiles") || id.includes("crust") && id.toLowerCase().includes("type")) {
    return {
      title: label,
      items: [
        { label: "0 = oceanic", color: [37, 99, 235, 230] },
        { label: "1 = continental", color: [34, 197, 94, 230] },
      ],
    };
  }

  if (id.toLowerCase().includes("tile.height") || id.toLowerCase().includes("tileheight")) {
    if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) {
      const min = stats.min ?? 0;
      const max = stats.max ?? 1;
      return {
        title: label,
        items: [
          { label: `min = ${min.toFixed(3)}`, color: colorForValue(id, 0) },
          { label: `max = ${max.toFixed(3)}`, color: colorForValue(id, 1) },
        ],
        note: "Values are mapped with a simple palette in V0.",
      };
    }
    return {
      title: label,
      items: [{ label: "continuous scalar", color: colorForValue(id, 0.5) }],
    };
  }

  if (id.includes("plate") && (id.toLowerCase().includes("id") || id.toLowerCase().includes("plate"))) {
    return {
      title: label,
      items: [
        { label: "categorical (random palette; neighboring plates avoid similar colors)", color: [148, 163, 184, 220] },
      ],
    };
  }

  if (stats && Number.isFinite(stats.min) && Number.isFinite(stats.max)) {
    const min = stats.min ?? 0;
    const max = stats.max ?? 1;
    return {
      title: label,
      items: [
        { label: `min = ${min.toFixed(3)}`, color: colorForValue(id, 0) },
        { label: `max = ${max.toFixed(3)}`, color: colorForValue(id, 1) },
      ],
      note: "Values are mapped with a simple palette in V0.",
    };
  }

  return {
    title: "Legend",
    items: [{ label: "no legend available for this layer yet", color: [148, 163, 184, 220] }],
  };
}

function parseTectonicHistoryEraLayerId(layerId: string): EraLayerInfo | null {
  // e.g. foundation.tectonicHistory.era3.upliftPotential
  const m = /^foundation\.tectonicHistory\.era(\d+)\.(.+)$/.exec(layerId);
  if (!m) return null;
  const eraIndex = Number.parseInt(m[1] ?? "", 10);
  const baseLayerId = String(m[2] ?? "");
  if (!Number.isFinite(eraIndex) || eraIndex < 0 || !baseLayerId) return null;
  return { eraIndex, baseLayerId };
}

function decodeScalarArray(buffer: ArrayBuffer, format: VizScalarFormat): ArrayBufferView {
  switch (format) {
    case "u8":
      return new Uint8Array(buffer);
    case "i8":
      return new Int8Array(buffer);
    case "u16":
      return new Uint16Array(buffer);
    case "i16":
      return new Int16Array(buffer);
    case "i32":
      return new Int32Array(buffer);
    case "f32":
      return new Float32Array(buffer);
  }
}

async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return await file.arrayBuffer();
}

async function readFileAsText(file: File): Promise<string> {
  return await file.text();
}

async function loadManifestFromFileMap(fileMap: FileMap): Promise<VizManifestV0> {
  const manifestFile = fileMap.get("manifest.json");
  if (!manifestFile) {
    throw new Error("manifest.json not found. Select the run folder that contains manifest.json.");
  }
  const text = await readFileAsText(manifestFile);
  return JSON.parse(text) as VizManifestV0;
}

export function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });
  const isNarrow = viewportSize.width < 760;

  const [mode, setMode] = useState<"browser" | "dump">("browser");

  const [dumpFileMap, setDumpFileMap] = useState<FileMap | null>(null);
  const [dumpManifest, setDumpManifest] = useState<VizManifestV0 | null>(null);

  const [browserManifest, setBrowserManifest] = useState<VizManifestV0 | null>(null);
  const browserWorkerRef = useRef<Worker | null>(null);
  const browserRunTokenRef = useRef<string | null>(null);
  const [browserRunning, setBrowserRunning] = useState(false);
  const [browserLastStep, setBrowserLastStep] = useState<{ stepId: string; stepIndex: number } | null>(null);
  const [browserSeed, setBrowserSeed] = useState(123);
  const [browserMapSizeId, setBrowserMapSizeId] = useState<Civ7MapSizePreset["id"]>("MAPSIZE_HUGE");
  const [browserConfigOpen, setBrowserConfigOpen] = useState(false);
  const [browserConfigOverridesEnabled, setBrowserConfigOverridesEnabled] = useState(false);
  const [browserConfigOverrides, setBrowserConfigOverrides] = useState<BrowserTestRecipeConfig>(
    BROWSER_TEST_RECIPE_CONFIG
  );
  const [browserConfigTab, setBrowserConfigTab] = useState<"form" | "json">("form");
  const [browserConfigJson, setBrowserConfigJson] = useState(() =>
    JSON.stringify(BROWSER_TEST_RECIPE_CONFIG, null, 2)
  );
  const [browserConfigJsonError, setBrowserConfigJsonError] = useState<string | null>(null);

  const manifest = mode === "dump" ? dumpManifest : browserManifest;
  const fileMap = mode === "dump" ? dumpFileMap : null;
  const [error, setError] = useState<string | null>(null);

  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [selectedLayerKey, setSelectedLayerKey] = useState<string | null>(null);
  const selectedStepIdRef = useRef<string | null>(null);
  const selectedLayerKeyRef = useRef<string | null>(null);

  useEffect(() => {
    selectedStepIdRef.current = selectedStepId;
  }, [selectedStepId]);

  useEffect(() => {
    selectedLayerKeyRef.current = selectedLayerKey;
  }, [selectedLayerKey]);

  const [viewState, setViewState] = useState<any>({ target: [0, 0, 0], zoom: 0 });
  const [layerStats, setLayerStats] = useState<{ min?: number; max?: number } | null>(null);
  const [tileLayout, setTileLayout] = useState<TileLayout>("row-offset");
  const [showMeshEdges, setShowMeshEdges] = useState(true);
  const [showBackgroundGrid, setShowBackgroundGrid] = useState(true);
  const [eraIndex, setEraIndex] = useState<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setViewportSize({ width: Math.max(1, rect.width), height: Math.max(1, rect.height) });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const steps = useMemo(() => {
    if (!manifest) return [];
    return [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex);
  }, [manifest]);

  const { browserConfigSchema, browserConfigFormContext } = useMemo(() => {
    const schema = toRjsfSchema(normalizeSchemaForRjsf(BROWSER_TEST_RECIPE_CONFIG_SCHEMA));
    const transparentPaths = collectTransparentPaths(schema);
    return { browserConfigSchema: schema, browserConfigFormContext: { transparentPaths } satisfies BrowserConfigFormContext };
  }, []);
  const browserConfigUiSchema = useMemo<UiSchema<BrowserTestRecipeConfig, RJSFSchema, BrowserConfigFormContext>>(
    () => ({
      "ui:options": { label: false },
      foundation: {
        "ui:order": ["knobs", "advanced"],
      },
    }),
    []
  );

  useEffect(() => {
    if (!manifest) return;
    if (selectedStepId && manifest.steps.some((s) => s.stepId === selectedStepId)) return;
    // For the in-browser runner, allow re-running the pipeline from step 0 while keeping
    // the UI pinned to a later step until the worker streams back up to it.
    if (mode === "browser" && browserRunning && selectedStepId) return;
    const firstStep = [...manifest.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
    setSelectedStepId(firstStep);
    setSelectedLayerKey(null);
  }, [browserRunning, manifest, mode, selectedStepId]);

  const layersForStep = useMemo(() => {
    if (!manifest || !selectedStepId) return [];
    return manifest.layers
      .filter((l) => l.stepId === selectedStepId)
      .map((l) => ({ key: `${l.stepId}::${l.layerId}::${l.kind}`, layer: l }));
  }, [manifest, selectedStepId]);

  const layersForStepGrouped = useMemo(() => {
    if (!layersForStep.length) return [];
    const order: string[] = [];
    const groups = new Map<string, typeof layersForStep>();
    for (const entry of layersForStep) {
      const groupLabel = entry.layer.meta?.group ?? "Other";
      if (!groups.has(groupLabel)) {
        groups.set(groupLabel, []);
        order.push(groupLabel);
      }
      groups.get(groupLabel)!.push(entry);
    }
    return order.map((group) => ({
      group,
      layers: groups.get(group) ?? [],
    }));
  }, [layersForStep]);

  const selectedLayer = useMemo(() => {
    if (!layersForStep.length || !selectedLayerKey) return null;
    return layersForStep.find((l) => l.key === selectedLayerKey)?.layer ?? null;
  }, [layersForStep, selectedLayerKey]);

  const eraInfo = useMemo(() => {
    if (!selectedLayer) return null;
    return parseTectonicHistoryEraLayerId(selectedLayer.layerId);
  }, [selectedLayer]);

  const eraMax = useMemo(() => {
    if (!manifest || !selectedStepId || !eraInfo) return null;
    let max = -1;
    const prefix = `foundation.tectonicHistory.era`;
    const suffix = `.${eraInfo.baseLayerId}`;
    for (const layer of manifest.layers) {
      if (layer.stepId !== selectedStepId) continue;
      if (!layer.layerId.startsWith(prefix)) continue;
      if (!layer.layerId.endsWith(suffix)) continue;
      const info = parseTectonicHistoryEraLayerId(layer.layerId);
      if (!info) continue;
      if (info.baseLayerId !== eraInfo.baseLayerId) continue;
      if (info.eraIndex > max) max = info.eraIndex;
    }
    return max >= 0 ? max : null;
  }, [manifest, selectedStepId, eraInfo]);

  const effectiveLayer = useMemo(() => {
    if (!manifest || !selectedStepId || !selectedLayer) return selectedLayer;
    if (!eraInfo) return selectedLayer;
    const idx = eraMax != null ? clamp(eraIndex, 0, eraMax) : eraIndex;
    const desiredId = `foundation.tectonicHistory.era${idx}.${eraInfo.baseLayerId}`;
    return (
      manifest.layers.find((l) => l.stepId === selectedStepId && l.layerId === desiredId) ?? selectedLayer
    );
  }, [manifest, selectedStepId, selectedLayer, eraInfo, eraIndex, eraMax]);

  const setFittedView = useCallback(
    (bounds: Bounds) => {
      const fit = fitToBounds(bounds, viewportSize);
      setViewState((prev: any) => ({ ...prev, ...fit }));
    },
    [viewportSize]
  );

  const openDumpFolder = useCallback(async () => {
    setError(null);
    try {
      setMode("dump");
      const anyWindow = window as any;
      if (typeof anyWindow.showDirectoryPicker === "function") {
        const dirHandle: any = await anyWindow.showDirectoryPicker();
        const files: FileMap = new Map();

        const walk = async (handle: any, prefix: string) => {
          for await (const [name, entry] of handle.entries()) {
            const path = prefix ? `${prefix}/${name}` : name;
            if (entry.kind === "directory") {
              await walk(entry, path);
            } else if (entry.kind === "file") {
              const file = await entry.getFile();
              files.set(path, file);
            }
          }
        };

        await walk(dirHandle, "");
        // If the selected folder is the run folder, manifest.json should be at root.
        // If it was selected with an extra parent dir, allow stripping one leading component.
        const normalized: FileMap = new Map();
        for (const [path, file] of files.entries()) {
          normalized.set(path, file);
          normalized.set(stripRootDirPrefix(path), file);
        }
        setDumpFileMap(normalized);
        const m = await loadManifestFromFileMap(normalized);
        setDumpManifest(m);
        const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
        setSelectedStepId(firstStep);
        setSelectedLayerKey(null);
        setFittedView([0, 0, 1, 1]);
        return;
      }

      // Fallback: directory upload (Chromium via webkitdirectory).
      setError("Your browser does not support folder picking. Use a Chromium-based browser, or enable directory picking.");
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [setFittedView]);

  const directoryInputRef = useRef<HTMLInputElement | null>(null);
  const onDirectoryFiles = useCallback(async () => {
    setError(null);
    try {
      const input = directoryInputRef.current;
      if (!input?.files) return;
      setMode("dump");
      const files: FileMap = new Map();
      for (const file of Array.from(input.files)) {
        const rel = (file as any).webkitRelativePath ? String((file as any).webkitRelativePath) : file.name;
        files.set(stripRootDirPrefix(rel), file);
      }
      setDumpFileMap(files);
      const m = await loadManifestFromFileMap(files);
      setDumpManifest(m);
      const firstStep = [...m.steps].sort((a, b) => a.stepIndex - b.stepIndex)[0]?.stepId ?? null;
      setSelectedStepId(firstStep);
      setSelectedLayerKey(null);
      setFittedView([0, 0, 1, 1]);
    } catch (e) {
      setError(formatErrorForUi(e));
    }
  }, [setFittedView]);

  const stopBrowserRun = useCallback(() => {
    const w = browserWorkerRef.current;
    browserWorkerRef.current = null;
    browserRunTokenRef.current = null;
    setBrowserRunning(false);
    setBrowserLastStep(null);
    if (w) w.terminate();
  }, []);

  useEffect(() => {
    return () => stopBrowserRun();
  }, [stopBrowserRun]);

  useEffect(() => {
    if (mode === "dump") stopBrowserRun();
  }, [mode, stopBrowserRun]);

  const resetBrowserConfigOverrides = useCallback(() => {
    setBrowserConfigOverrides(BROWSER_TEST_RECIPE_CONFIG);
    setBrowserConfigJson(JSON.stringify(BROWSER_TEST_RECIPE_CONFIG, null, 2));
    setBrowserConfigJsonError(null);
  }, []);

  const applyBrowserConfigJson = useCallback((): boolean => {
    try {
      const parsed: unknown = JSON.parse(browserConfigJson);
      const { value, errors } = normalizeStrict<BrowserTestRecipeConfig>(
        BROWSER_TEST_RECIPE_CONFIG_SCHEMA,
        parsed,
        "/configOverrides"
      );
      if (errors.length > 0) {
        setBrowserConfigJsonError(formatConfigErrors(errors));
        return false;
      }
      setBrowserConfigOverrides(value);
      setBrowserConfigJsonError(null);
      return true;
    } catch (e) {
      setBrowserConfigJsonError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  }, [browserConfigJson]);

  const startBrowserRun = useCallback((overrides?: { seed?: number }) => {
    setError(null);
    if (browserConfigOverridesEnabled && browserConfigTab === "json") {
      const ok = applyBrowserConfigJson();
      if (!ok) {
        setError("Config overrides JSON is invalid. Fix it (or disable overrides) and try again.");
        return;
      }
    }
    const pinnedStepId = mode === "browser" ? selectedStepIdRef.current : null;
    const pinnedLayerKey = mode === "browser" ? selectedLayerKeyRef.current : null;
    const retainStep = Boolean(pinnedStepId);
    const retainLayer = Boolean(pinnedStepId && pinnedLayerKey && pinnedLayerKey.startsWith(`${pinnedStepId}::`));
    setMode("browser");
    setBrowserManifest(null);
    if (!retainStep) setSelectedStepId(null);
    if (!retainLayer) setSelectedLayerKey(null);
    if (!retainStep) setFittedView([0, 0, 1, 1]);
    setBrowserLastStep(null);

    stopBrowserRun();

    const runToken =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `run_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    browserRunTokenRef.current = runToken;

    const worker = new Worker(new URL("./browser-runner/foundation.worker.ts", import.meta.url), { type: "module" });
    browserWorkerRef.current = worker;
    setBrowserRunning(true);

    worker.onmessage = (ev: MessageEvent<BrowserRunEvent>) => {
      const msg = ev.data;
      if (!msg || msg.runToken !== browserRunTokenRef.current) return;

      if (msg.type === "run.started") {
        setBrowserManifest({
          version: 0,
          runId: msg.runId,
          planFingerprint: msg.planFingerprint,
          steps: [],
          layers: [],
        });
        return;
      }

      if (msg.type === "run.progress") {
        if (msg.kind === "step.start") {
          setBrowserLastStep({ stepId: msg.stepId, stepIndex: msg.stepIndex });
          setBrowserManifest((prev) => {
            if (!prev) return prev;
            if (prev.steps.some((s) => s.stepId === msg.stepId)) return prev;
            return {
              ...prev,
              steps: [...prev.steps, { stepId: msg.stepId, phase: msg.phase, stepIndex: msg.stepIndex }],
            };
          });
          setSelectedStepId((prev) => prev ?? msg.stepId);
        }
        return;
      }

      if (msg.type === "viz.layer.upsert") {
        setBrowserManifest((prev) => {
          if (!prev) return prev;

          const entry: VizLayerEntryV0 =
            msg.layer.kind === "grid"
              ? {
                  kind: "grid",
                  layerId: msg.layer.layerId,
                  stepId: msg.layer.stepId,
                  phase: msg.layer.phase,
                  stepIndex: msg.layer.stepIndex,
                  format: msg.layer.format,
                  dims: msg.layer.dims,
                  values: msg.payload.kind === "grid" ? msg.payload.values : undefined,
                  bounds: msg.layer.bounds,
                  meta: msg.layer.meta,
                }
              : msg.layer.kind === "points"
                ? {
                    kind: "points",
                    layerId: msg.layer.layerId,
                    stepId: msg.layer.stepId,
                    phase: msg.layer.phase,
                    stepIndex: msg.layer.stepIndex,
                    count: msg.layer.count,
                    positions: msg.payload.kind === "points" ? msg.payload.positions : undefined,
                    values: msg.payload.kind === "points" ? msg.payload.values : undefined,
                    valueFormat: msg.layer.valueFormat,
                    bounds: msg.layer.bounds,
                    meta: msg.layer.meta,
                  }
                : {
                    kind: "segments",
                    layerId: msg.layer.layerId,
                    stepId: msg.layer.stepId,
                    phase: msg.layer.phase,
                    stepIndex: msg.layer.stepIndex,
                    count: msg.layer.count,
                    segments: msg.payload.kind === "segments" ? msg.payload.segments : undefined,
                    values: msg.payload.kind === "segments" ? msg.payload.values : undefined,
                    valueFormat: msg.layer.valueFormat,
                    bounds: msg.layer.bounds,
                    meta: msg.layer.meta,
                  };

          const key = `${entry.stepId}::${entry.layerId}::${entry.kind}`;
          const layers = [...prev.layers];
          const idx = layers.findIndex((l) => `${l.stepId}::${l.layerId}::${l.kind}` === key);
          if (idx >= 0) layers[idx] = entry;
          else layers.push(entry);

          return { ...prev, layers };
        });

        setSelectedStepId((prev) => prev ?? msg.layer.stepId);
        setSelectedLayerKey((prev) => {
          if (prev) return prev;
          const desiredStep = selectedStepIdRef.current ?? msg.layer.stepId;
          if (msg.layer.stepId !== desiredStep) return prev;
          return `${msg.layer.stepId}::${msg.layer.layerId}::${msg.layer.kind}`;
        });
        return;
      }

      if (msg.type === "run.finished") {
        setBrowserRunning(false);
        return;
      }

      if (msg.type === "run.error") {
        setBrowserRunning(false);
        const parts: string[] = [];
        if (msg.name) parts.push(`${msg.name}: ${msg.message}`);
        else parts.push(msg.message);
        if (msg.details) parts.push(msg.details);
        if (msg.stack) parts.push(msg.stack);
        setError(parts.filter(Boolean).join("\n\n"));
        return;
      }
    };

    worker.onerror = (e) => {
      setBrowserRunning(false);
      setError(formatErrorForUi(e));
    };

    const seedToUse = overrides?.seed ?? browserSeed;
    const mapSize = getCiv7MapSizePreset(browserMapSizeId);
    const configOverrides = browserConfigOverridesEnabled ? browserConfigOverrides : undefined;

    const req: BrowserRunRequest = {
      type: "run.start",
      runToken,
      seed: seedToUse,
      mapSizeId: mapSize.id,
      dimensions: mapSize.dimensions,
      latitudeBounds: { topLatitude: 80, bottomLatitude: -80 },
      configOverrides,
    };

    worker.postMessage(req);
  }, [
    applyBrowserConfigJson,
    browserConfigOverrides,
    browserConfigOverridesEnabled,
    browserConfigTab,
    browserMapSizeId,
    browserSeed,
    mode,
    setFittedView,
    stopBrowserRun,
  ]);

  useEffect(() => {
    if (!manifest || !selectedStepId) return;
    if (selectedLayerKey && selectedLayerKey.startsWith(`${selectedStepId}::`)) return;
    const first = manifest.layers
      .filter((l) => l.stepId === selectedStepId)
      .sort((a, b) => a.stepIndex - b.stepIndex)[0];
    if (!first) return;
    const key = `${first.stepId}::${first.layerId}::${first.kind}`;
    setSelectedLayerKey(key);
    if (first.kind === "grid") {
      setFittedView(boundsForTileGrid(tileLayout, first.dims, 1));
    } else {
      setFittedView(first.bounds);
    }
  }, [manifest, selectedLayerKey, selectedStepId, setFittedView, tileLayout]);

  useEffect(() => {
    if (!eraInfo) return;
    setEraIndex(eraInfo.eraIndex);
  }, [eraInfo]);

  const deckLayers = useMemo(() => {
    if (!manifest || !effectiveLayer) return [];

    const layerId = effectiveLayer.layerId;
    const isTileOddQLayer = effectiveLayer.kind === "grid" || layerId.startsWith("foundation.plateTopology.");
    const tileSize = 1;

    const meshEdges = manifest.layers.find(
      (l) => l.kind === "segments" && l.layerId === "foundation.mesh.edges"
    ) as Extract<VizLayerEntryV0, { kind: "segments" }> | undefined;

    const loadScalar = async (
      path: string | undefined,
      buffer: ArrayBuffer | undefined,
      format: VizScalarFormat
    ): Promise<ArrayBufferView> => {
      if (buffer) return decodeScalarArray(buffer, format);
      if (!fileMap || !path) throw new Error(`Missing scalar payload for ${layerId}`);
      const file = fileMap.get(path);
      if (!file) throw new Error(`Missing file: ${path}`);
      const buf = await readFileAsArrayBuffer(file);
      return decodeScalarArray(buf, format);
    };

    // We keep data in component state via a simple async cache.
    // For V0 (MAPSIZE_HUGE), sizes are small enough to materialize on selection.
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    return (async () => {
      setLayerStats(null);

      const baseLayers: any[] = [];
      const shouldShowMeshEdges =
        Boolean(showMeshEdges) &&
        Boolean(meshEdges) &&
        (effectiveLayer.kind === "points" || effectiveLayer.kind === "segments") &&
        effectiveLayer.layerId.startsWith("foundation.") &&
        !effectiveLayer.layerId.startsWith("foundation.plateTopology.");

      if (shouldShowMeshEdges && meshEdges) {
        let seg: Float32Array;
        if (meshEdges.segments) {
          seg = new Float32Array(meshEdges.segments);
        } else {
          if (!fileMap || !meshEdges.segmentsPath) throw new Error("Missing mesh edge payload");
          const segFile = fileMap.get(meshEdges.segmentsPath);
          if (!segFile) throw new Error(`Missing file: ${meshEdges.segmentsPath}`);
          const segBuf = await readFileAsArrayBuffer(segFile);
          seg = new Float32Array(segBuf);
        }

        const edges: Array<{ path: [[number, number], [number, number]] }> = [];
        const count = (seg.length / 4) | 0;
        for (let i = 0; i < count; i++) {
          const x0 = seg[i * 4] ?? 0;
          const y0 = seg[i * 4 + 1] ?? 0;
          const x1 = seg[i * 4 + 2] ?? 0;
          const y1 = seg[i * 4 + 3] ?? 0;
          edges.push({ path: [[x0, y0], [x1, y1]] });
        }

        baseLayers.push(
          new PathLayer({
            id: "foundation.mesh.edges::base",
            data: edges,
            getPath: (d) => d.path,
            getColor: [148, 163, 184, 140],
            getWidth: 1,
            widthUnits: "pixels",
            pickable: false,
          })
        );
      }

      if (effectiveLayer.kind === "grid") {
        const values = await loadScalar(effectiveLayer.path, effectiveLayer.values, effectiveLayer.format);
        const { width, height } = effectiveLayer.dims;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        const plateColorMap = isPlateIdLayer(layerId)
          ? buildPlateColorMap({
              values,
              seedKey: `${manifest?.runId ?? "run"}:${layerId}`,
            })
          : undefined;

        const tiles: Array<{ polygon: Array<[number, number]>; v: number }> = [];
        const len = width * height;
        for (let i = 0; i < len; i++) {
          const x = i % width;
          const y = (i / width) | 0;
          const v = (values as any)[i] ?? 0;
          const vv = Number(v);
          if (Number.isFinite(vv)) {
            if (vv < min) min = vv;
            if (vv > max) max = vv;
          }

          const center = tileLayout === "col-offset" ? oddQTileCenter(x, y, tileSize) : oddRTileCenter(x, y, tileSize);
          tiles.push({ polygon: hexPolygonPointy(center, tileSize), v: vv });
        }

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PolygonLayer({
            id: `${layerId}::hex`,
            data: tiles,
            getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap, effectiveLayer.meta),
            getPolygon: (d) => d.polygon,
            stroked: true,
            getLineColor: [17, 24, 39, 220],
            getLineWidth: 1,
            lineWidthUnits: "pixels",
            pickable: true,
          }),
        ];
      }

      if (effectiveLayer.kind === "points") {
        let positions: Float32Array;
        if (effectiveLayer.positions) {
          positions = new Float32Array(effectiveLayer.positions);
        } else {
          if (!fileMap || !effectiveLayer.positionsPath) throw new Error("Missing points payload");
          const posFile = fileMap.get(effectiveLayer.positionsPath);
          if (!posFile) throw new Error(`Missing file: ${effectiveLayer.positionsPath}`);
          const posBuf = await readFileAsArrayBuffer(posFile);
          positions = new Float32Array(posBuf);
        }

        const values =
          effectiveLayer.values && effectiveLayer.valueFormat
            ? decodeScalarArray(effectiveLayer.values, effectiveLayer.valueFormat)
            : effectiveLayer.valuesPath && effectiveLayer.valueFormat
              ? await loadScalar(effectiveLayer.valuesPath, undefined, effectiveLayer.valueFormat)
              : null;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        const plateColorMap =
          values && isPlateIdLayer(layerId)
            ? buildPlateColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
            : undefined;

        const points: Array<{ x: number; y: number; v: number }> = [];
        const count = (positions.length / 2) | 0;
        for (let i = 0; i < count; i++) {
          const rawX = positions[i * 2] ?? 0;
          const rawY = positions[i * 2 + 1] ?? 0;
          const v = values ? Number((values as any)[i] ?? 0) : 0;
          if (Number.isFinite(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
          }

          const [x, y] = isTileOddQLayer
            ? tileLayout === "col-offset"
              ? oddQPointFromTileXY(rawX, rawY, tileSize)
              : oddRPointFromTileXY(rawX, rawY, tileSize)
            : [rawX, rawY];
          points.push({ x, y, v });
        }

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new ScatterplotLayer({
            id: `${layerId}::points`,
            data: points,
            getPosition: (d) => [d.x, d.y],
            getFillColor: (d) => colorForValue(layerId, d.v, plateColorMap, effectiveLayer.meta),
            radiusUnits: "common",
            getRadius: 0.95,
            pickable: true,
          }),
        ];
      }

      if (effectiveLayer.kind === "segments") {
        let seg: Float32Array;
        if (effectiveLayer.segments) {
          seg = new Float32Array(effectiveLayer.segments);
        } else {
          if (!fileMap || !effectiveLayer.segmentsPath) throw new Error("Missing segments payload");
          const segFile = fileMap.get(effectiveLayer.segmentsPath);
          if (!segFile) throw new Error(`Missing file: ${effectiveLayer.segmentsPath}`);
          const segBuf = await readFileAsArrayBuffer(segFile);
          seg = new Float32Array(segBuf);
        }

        const values =
          effectiveLayer.values && effectiveLayer.valueFormat
            ? decodeScalarArray(effectiveLayer.values, effectiveLayer.valueFormat)
            : effectiveLayer.valuesPath && effectiveLayer.valueFormat
              ? await loadScalar(effectiveLayer.valuesPath, undefined, effectiveLayer.valueFormat)
              : null;

        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;

        const plateColorMap =
          values && isPlateIdLayer(layerId)
            ? buildPlateColorMap({ values, seedKey: `${manifest?.runId ?? "run"}:${layerId}` })
            : undefined;

        const segments: Array<{ path: [[number, number], [number, number]]; v: number }> = [];
        const count = (seg.length / 4) | 0;
        for (let i = 0; i < count; i++) {
          const rx0 = seg[i * 4] ?? 0;
          const ry0 = seg[i * 4 + 1] ?? 0;
          const rx1 = seg[i * 4 + 2] ?? 0;
          const ry1 = seg[i * 4 + 3] ?? 0;
          const v = values ? Number((values as any)[i] ?? 0) : 0;
          if (Number.isFinite(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
          }

          const [x0, y0] = isTileOddQLayer
            ? tileLayout === "col-offset"
              ? oddQPointFromTileXY(rx0, ry0, tileSize)
              : oddRPointFromTileXY(rx0, ry0, tileSize)
            : [rx0, ry0];
          const [x1, y1] = isTileOddQLayer
            ? tileLayout === "col-offset"
              ? oddQPointFromTileXY(rx1, ry1, tileSize)
              : oddRPointFromTileXY(rx1, ry1, tileSize)
            : [rx1, ry1];
          segments.push({ path: [[x0, y0], [x1, y1]], v });
        }

        if (Number.isFinite(min) && Number.isFinite(max)) setLayerStats({ min, max });

        return [
          ...baseLayers,
          new PathLayer({
            id: `${layerId}::segments`,
            data: segments,
            getPath: (d) => d.path,
            getColor: (d) => colorForValue(layerId, d.v, plateColorMap, effectiveLayer.meta),
            getWidth: 1.5,
            widthUnits: "pixels",
            pickable: true,
          }),
        ];
      }

      return [];
    })() as any;
  }, [manifest, fileMap, effectiveLayer, tileLayout, showMeshEdges]);

  // Resolve async layers into a stable state
  const [resolvedLayers, setResolvedLayers] = useState<any[]>([]);
  useEffect(() => {
    const v = deckLayers as any;
    if (typeof v?.then === "function") {
      v.then(setResolvedLayers).catch((e: unknown) => setError(formatErrorForUi(e)));
    } else {
      setResolvedLayers(v);
    }
  }, [deckLayers]);

  useEffect(() => {
    if (!effectiveLayer) return;
    if (effectiveLayer.kind === "grid") {
      setFittedView(boundsForTileGrid(tileLayout, effectiveLayer.dims, 1));
      return;
    }
    setFittedView(effectiveLayer.bounds);
  }, [effectiveLayer, setFittedView, tileLayout]);

  const legend = useMemo(() => legendForLayer(effectiveLayer, layerStats), [effectiveLayer, layerStats]);

  const triggerDirectoryPicker = useCallback(() => {
    directoryInputRef.current?.click();
  }, []);

  const controlBaseStyle: React.CSSProperties = useMemo(
    () => ({
      background: "#111827",
      color: "#e5e7eb",
      border: "1px solid #374151",
      borderRadius: 8,
      padding: isNarrow ? "10px 10px" : "6px 8px",
      minWidth: 0,
      fontSize: isNarrow ? 14 : 13,
    }),
    [isNarrow]
  );

  const buttonStyle: React.CSSProperties = useMemo(
    () => ({
      ...controlBaseStyle,
      padding: isNarrow ? "10px 12px" : "6px 10px",
      cursor: "pointer",
      fontWeight: 600,
      width: isNarrow ? "100%" : undefined,
      textAlign: "center",
    }),
    [controlBaseStyle, isNarrow]
  );

  const toolbarSectionStyle: React.CSSProperties = useMemo(
    () => ({
      border: "1px solid #1f2937",
      background: "rgba(15, 23, 42, 0.6)",
      borderRadius: 12,
      padding: isNarrow ? "10px" : "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }),
    [isNarrow]
  );

  const toolbarSectionTitleStyle: React.CSSProperties = useMemo(
    () => ({
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.02em",
      color: "#cbd5f5",
      textTransform: "uppercase",
    }),
    []
  );

  const toolbarRowStyle: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: 10,
      alignItems: "center",
      flexWrap: "wrap",
    }),
    []
  );

  const backgroundGridLayer = useMemo(() => {
    if (!showBackgroundGrid) return null;
    if (!effectiveLayer) return null;
    if (!(effectiveLayer.kind === "points" || effectiveLayer.kind === "segments")) return null;
    if (effectiveLayer.layerId.startsWith("foundation.plateTopology.")) return null;

    const zoom = typeof viewState?.zoom === "number" ? viewState.zoom : 0;
    const scale = Math.pow(2, zoom);
    const worldWidth = viewportSize.width / Math.max(1e-6, scale);
    const worldHeight = viewportSize.height / Math.max(1e-6, scale);

    const tx = Array.isArray(viewState?.target) ? Number(viewState.target[0]) : 0;
    const ty = Array.isArray(viewState?.target) ? Number(viewState.target[1]) : 0;
    const minX = tx - worldWidth / 2;
    const maxX = tx + worldWidth / 2;
    const minY = ty - worldHeight / 2;
    const maxY = ty + worldHeight / 2;

    const step = niceStep(worldWidth / 26);
    const x0 = Math.floor(minX / step) * step;
    const y0 = Math.floor(minY / step) * step;
    const x1 = Math.ceil(maxX / step) * step;
    const y1 = Math.ceil(maxY / step) * step;

    const points: Array<{ x: number; y: number }> = [];
    const maxPoints = 1800;
    for (let y = y0; y <= y1; y += step) {
      for (let x = x0; x <= x1; x += step) {
        points.push({ x, y });
        if (points.length >= maxPoints) break;
      }
      if (points.length >= maxPoints) break;
    }

    return new ScatterplotLayer({
      id: "bg.mesh.grid",
      data: points,
      getPosition: (d) => [d.x, d.y],
      getFillColor: [148, 163, 184, 55],
      radiusUnits: "pixels",
      getRadius: 1.2,
      pickable: false,
    });
  }, [showBackgroundGrid, effectiveLayer, viewState, viewportSize]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0b1020", color: "#e5e7eb" }}>
      <div
        style={{
          padding: isNarrow ? "10px 12px" : "12px 14px",
          borderBottom: "1px solid #1f2937",
          display: "flex",
          flexDirection: "column",
          gap: isNarrow ? 10 : 12,
        }}
      >
        <div style={{ display: "flex", gap: 12, alignItems: isNarrow ? "flex-start" : "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 800, fontSize: isNarrow ? 16 : 14 }}>MapGen Studio</div>
          <div style={{ color: "#9ca3af", fontSize: isNarrow ? 13 : 12 }}>
            {mode === "browser" ? "Browser Runner (V0.1 Slice)" : "Dump Viewer (V0)"}
          </div>
          <div style={{ flex: 1 }} />
          {!isNarrow && mode === "dump" ? (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              Open a run folder under <span style={{ color: "#e5e7eb" }}>mods/mod-swooper-maps/dist/visualization</span>
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>Run</div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: isNarrow ? "1 1 100%" : "0 0 auto" }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Mode</span>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as any)}
                  style={{ ...controlBaseStyle, width: isNarrow ? "100%" : 170 }}
                >
                  <option value="browser">browser</option>
                  <option value="dump">dump</option>
                </select>
              </label>
            </div>

            {mode === "browser" ? (
              <>
                <div style={toolbarRowStyle}>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Seed</span>
                    <input
                      value={browserSeed}
                      onChange={(e) => setBrowserSeed(Number.parseInt(e.target.value || "0", 10) || 0)}
                      style={{ ...controlBaseStyle, width: 96 }}
                    />
                    <button
                      onClick={() => {
                        const next = randomU32();
                        setBrowserSeed(next);
                        startBrowserRun({ seed: next });
                      }}
                      style={{ ...buttonStyle, padding: "6px 10px" }}
                      title="Reroll seed"
                      type="button"
                    >
                      Reroll
                    </button>
                  </label>
                  <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>Map size</span>
                    <select
                      value={browserMapSizeId}
                      onChange={(e) => setBrowserMapSizeId(e.target.value as Civ7MapSizePreset["id"])}
                      style={{ ...controlBaseStyle, width: 220 }}
                      disabled={browserRunning}
                    >
                      {CIV7_MAP_SIZES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {formatMapSizeLabel(p)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={toolbarRowStyle}>
                  <button
                    onClick={() => startBrowserRun()}
                    style={{
                      ...buttonStyle,
                      opacity: browserRunning ? 0.6 : 1,
                      background: "#2563eb",
                      borderColor: "#1d4ed8",
                    }}
                    disabled={browserRunning}
                  >
                    Run (Browser)
                  </button>
                  <button
                    onClick={() => setBrowserConfigOpen((v) => !v)}
                    style={{ ...buttonStyle, padding: "6px 10px", opacity: browserConfigOverridesEnabled ? 1 : 0.85 }}
                    title="Toggle config overrides panel"
                    type="button"
                  >
                    Overrides
                  </button>
                  <button
                    onClick={stopBrowserRun}
                    style={{ ...buttonStyle, opacity: browserRunning ? 1 : 0.6 }}
                    disabled={!browserRunning}
                  >
                    Cancel
                  </button>
                </div>
                {browserLastStep ? (
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    step: <span style={{ color: "#e5e7eb" }}>{browserLastStep.stepIndex}</span> ·{" "}
                    {formatLabel(browserLastStep.stepId)}
                  </div>
                ) : null}
              </>
            ) : (
              <div style={toolbarRowStyle}>
                <button onClick={openDumpFolder} style={buttonStyle}>
                  Open dump folder
                </button>

                <input
                  ref={directoryInputRef}
                  type="file"
                  multiple
                  onChange={onDirectoryFiles}
                  style={{ display: "none" }}
                  {...({ webkitdirectory: "", directory: "" } as any)}
                />
                <button onClick={triggerDirectoryPicker} style={buttonStyle}>
                  Upload dump folder
                </button>
              </div>
            )}
          </div>

          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>View</div>
            <div style={toolbarRowStyle}>
              <button
                onClick={() => selectedLayer && setFittedView(selectedLayer.bounds)}
                style={{ ...buttonStyle, opacity: selectedLayer ? 1 : 0.55 }}
                disabled={!selectedLayer}
              >
                Fit
              </button>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "2px 2px",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Mesh edges</span>
                <input type="checkbox" checked={showMeshEdges} onChange={(e) => setShowMeshEdges(e.target.checked)} />
              </label>

              <label
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: "2px 2px",
                }}
              >
                <span style={{ fontSize: 12, color: "#9ca3af" }}>Background grid</span>
                <input
                  type="checkbox"
                  checked={showBackgroundGrid}
                  onChange={(e) => setShowBackgroundGrid(e.target.checked)}
                />
              </label>
            </div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 76 }}>Hex layout</span>
                <select
                  value={tileLayout}
                  onChange={(e) => setTileLayout(e.target.value as TileLayout)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                >
                  <option value="row-offset">row-offset (Civ-like)</option>
                  <option value="col-offset">col-offset</option>
                </select>
              </label>
            </div>
          </div>

          <div style={toolbarSectionStyle}>
            <div style={toolbarSectionTitleStyle}>Inspect</div>
            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Step</span>
                <select
                  value={selectedStepId ?? ""}
                  onChange={(e) => setSelectedStepId(e.target.value || null)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                  disabled={!steps.length && !selectedStepId}
                >
                  {selectedStepId && !steps.some((s) => s.stepId === selectedStepId) ? (
                    <option value={selectedStepId}>{formatLabel(selectedStepId)} (pending)</option>
                  ) : null}
                  {steps.map((s) => (
                    <option key={s.stepId} value={s.stepId}>
                      {s.stepIndex} · {formatLabel(s.stepId)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div style={toolbarRowStyle}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Layer</span>
                <select
                  value={selectedLayerKey ?? ""}
                  onChange={(e) => setSelectedLayerKey(e.target.value || null)}
                  style={{ ...controlBaseStyle, flex: 1, width: "100%" }}
                  disabled={!layersForStep.length && !selectedLayerKey}
                >
                  {selectedLayerKey && !layersForStep.some((l) => l.key === selectedLayerKey) ? (
                    <option value={selectedLayerKey}>
                      {(() => {
                        const parts = selectedLayerKey.split("::");
                        const label = parts.length >= 3 ? `${parts[1]} (${parts[2]})` : selectedLayerKey;
                        return `${label} (pending)`;
                      })()}
                    </option>
                  ) : null}
                  {layersForStepGrouped.map((group) => (
                    <optgroup key={group.group} label={group.group}>
                      {group.layers.map((l) => (
                        <option key={l.key} value={l.key}>
                          {formatLayerLabel(l.layer)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>
            </div>

            {eraInfo && eraMax != null ? (
              <div style={toolbarRowStyle}>
                <label style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", minWidth: 56 }}>Era</span>
                  <input
                    type="range"
                    min={0}
                    max={eraMax}
                    step={1}
                    value={clamp(eraIndex, 0, eraMax)}
                    onChange={(e) => setEraIndex(Number.parseInt(e.target.value, 10))}
                    style={{ flex: 1, width: "100%" }}
                  />
                  <span style={{ fontSize: 12, color: "#e5e7eb", minWidth: 26, textAlign: "right" }}>
                    {clamp(eraIndex, 0, eraMax)}
                  </span>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {error ? (
        <div style={{ padding: 12, background: "#2a0b0b", borderBottom: "1px solid #7f1d1d", color: "#fecaca" }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{error}</pre>
        </div>
      ) : null}

      <div ref={containerRef} style={{ flex: 1, position: "relative" }}>
        {mode === "browser" && browserConfigOpen ? (
          <div
            style={{
	              position: "absolute",
	              top: 12,
	              left: 12,
	              bottom: 12,
	              width: isNarrow ? "calc(100% - 24px)" : 362,
	              maxWidth: 450,
	              zIndex: 30,
	              borderRadius: 14,
	              border: "1px solid rgba(148, 163, 184, 0.18)",
	              background: "rgba(10, 18, 36, 0.92)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
              backdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 12px",
                borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
              }}
            >
              <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, letterSpacing: 0.2 }}>
                Config overrides
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => setBrowserConfigOpen(false)}
                style={{ ...buttonStyle, padding: "6px 10px" }}
                type="button"
              >
                Close
              </button>
            </div>

	            <div
	              style={{
	                padding: 12,
	                display: "flex",
	                flexDirection: "column",
	                gap: 10,
	                flex: 1,
	                minHeight: 0,
	                overflow: "hidden",
	              }}
	            >
              <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.35 }}>
                Overrides apply on the next “Run (Browser)”. Base config remains{" "}
                <span style={{ color: "#e5e7eb" }}>BROWSER_TEST_RECIPE_CONFIG</span>.
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={browserConfigOverridesEnabled}
                    onChange={(e) => setBrowserConfigOverridesEnabled(e.target.checked)}
                    disabled={browserRunning}
                  />
                  <span style={{ fontSize: 12, color: "#e5e7eb" }}>Enable overrides</span>
                </label>

                <button
                  onClick={resetBrowserConfigOverrides}
                  style={{ ...buttonStyle, padding: "6px 10px", opacity: browserRunning ? 0.6 : 1 }}
                  disabled={browserRunning}
                  type="button"
                >
                  Reset to base
                </button>

                <div style={{ flex: 1 }} />

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => {
                      if (browserConfigTab === "form") return;
                      if (!applyBrowserConfigJson()) return;
                      setBrowserConfigTab("form");
                    }}
                    style={{
                      ...buttonStyle,
                      padding: "6px 10px",
                      opacity: browserConfigTab === "form" ? 1 : 0.75,
                    }}
                    type="button"
                  >
                    Form
                  </button>
                  <button
                    onClick={() => {
                      if (browserConfigTab === "json") return;
                      setBrowserConfigJson(JSON.stringify(browserConfigOverrides, null, 2));
                      setBrowserConfigJsonError(null);
                      setBrowserConfigTab("json");
                    }}
                    style={{
                      ...buttonStyle,
                      padding: "6px 10px",
                      opacity: browserConfigTab === "json" ? 1 : 0.75,
                    }}
                    type="button"
                  >
                    JSON
                  </button>
                </div>
              </div>

	              <div style={{ flex: 1, minHeight: 0, overflow: "auto", paddingRight: 2 }}>
	                {browserConfigTab === "form" ? (
	                  <div
	                    style={{
	                      padding: 0,
	                      borderRadius: 0,
	                      border: "none",
	                      background: "transparent",
	                    }}
	                    className="browserConfigForm"
	                  >
	                    <style>{browserConfigFormCss}</style>
		                    <Form<BrowserTestRecipeConfig, RJSFSchema, BrowserConfigFormContext>
		                      schema={browserConfigSchema}
		                      uiSchema={browserConfigUiSchema}
		                      validator={browserConfigValidator}
		                      formContext={browserConfigFormContext}
		                      formData={browserConfigOverrides}
		                      templates={{
		                        FieldTemplate: BrowserConfigFieldTemplate,
		                        ObjectFieldTemplate: BrowserConfigObjectFieldTemplate,
	                        ArrayFieldTemplate: BrowserConfigArrayFieldTemplate,
	                      }}
	                      showErrorList={false}
	                      disabled={browserRunning || !browserConfigOverridesEnabled}
	                      onChange={(e) => {
	                        setBrowserConfigOverrides(e.formData ?? BROWSER_TEST_RECIPE_CONFIG);
	                        setBrowserConfigJsonError(null);
	                      }}
	                    >
	                      <div />
	                    </Form>
	                  </div>
	                ) : (
	                  <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
	                    <textarea
	                      value={browserConfigJson}
	                      onChange={(e) => setBrowserConfigJson(e.target.value)}
	                      spellCheck={false}
	                      style={{
	                        ...controlBaseStyle,
	                        fontFamily:
	                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
	                        width: "100%",
	                        flex: 1,
	                        minHeight: 0,
	                        height: "100%",
	                        resize: "none",
	                      }}
	                      disabled={browserRunning || !browserConfigOverridesEnabled}
	                    />
	                    {browserConfigJsonError ? (
	                      <div style={{ fontSize: 12, color: "#fca5a5", whiteSpace: "pre-wrap" }}>
	                        {browserConfigJsonError}
	                      </div>
	                    ) : null}
	                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
	                      <button
	                        onClick={() => {
	                          applyBrowserConfigJson();
	                        }}
	                        style={{ ...buttonStyle, padding: "6px 10px" }}
	                        disabled={browserRunning || !browserConfigOverridesEnabled}
	                        type="button"
	                      >
	                        Apply JSON
	                      </button>
	                      <div style={{ fontSize: 12, color: "#9ca3af" }}>Paste overrides and apply before running.</div>
	                    </div>
	                  </div>
	                )}
	              </div>
	            </div>
          </div>
        ) : null}
        {manifest ? (
          <DeckGL
            views={new OrthographicView({ id: "ortho" })}
            controller={true}
            viewState={viewState}
            onViewStateChange={({ viewState: vs }: any) => setViewState(vs)}
            layers={[...(backgroundGridLayer ? [backgroundGridLayer] : []), ...resolvedLayers]}
          />
        ) : (
          <div style={{ padding: 18, color: "#9ca3af" }}>
            {mode === "browser"
              ? "Click “Run (Browser)” to execute Foundation in a Web Worker and stream layers directly to deck.gl."
              : "Select a dump folder containing `manifest.json` (e.g. `mods/mod-swooper-maps/dist/visualization/<runId>`)."}
          </div>
        )}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            fontSize: 12,
            color: "#9ca3af",
            background: "rgba(0,0,0,0.35)",
            padding: "6px 8px",
            borderRadius: 8,
          }}
        >
          {manifest ? (
            <>
              runId: <span style={{ color: "#e5e7eb" }}>{manifest.runId.slice(0, 12)}…</span>
              {" · "}
              viewport: {Math.round(viewportSize.width)}×{Math.round(viewportSize.height)}
            </>
          ) : (
            <>{mode === "browser" ? "No run loaded" : "No dump loaded"}</>
          )}
        </div>

        {manifest && effectiveLayer && legend ? (
          <div
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              fontSize: 12,
              color: "#e5e7eb",
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.10)",
              padding: "10px 10px",
              borderRadius: 10,
              maxWidth: isNarrow ? "calc(100% - 20px)" : 360,
              maxHeight: isNarrow ? "40vh" : "70vh",
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>{legend.title}</div>
            <div style={{ color: "#9ca3af", marginBottom: 8 }}>
              <div>step: {formatLabel(effectiveLayer.stepId)}</div>
              <div>layer: {effectiveLayer.layerId} ({effectiveLayer.kind})</div>
              {eraInfo && eraMax != null ? <div>era: {clamp(eraIndex, 0, eraMax)}</div> : null}
              {effectiveLayer.kind === "grid" ? <div>tile layout: {tileLayout}</div> : null}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {legend.items.map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background: `rgba(${item.color[0]},${item.color[1]},${item.color[2]},${item.color[3] / 255})`,
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#e5e7eb" }}>{item.label}</span>
                </div>
              ))}
            </div>
            {legend.note ? <div style={{ marginTop: 8, color: "#9ca3af" }}>{legend.note}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
