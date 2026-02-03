import { memo, useEffect, useMemo, useState } from "react";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { SchemaForm } from "./SchemaForm";
import { collectTransparentPaths, normalizeSchemaForRjsf, toRjsfSchema } from "./schemaPresentation";
import type { BrowserConfigFormContext } from "./rjsfTemplates";
import type { UseConfigOverridesResult } from "./useConfigOverrides";
import { applyCirculationV2Preset } from "../../shared/presets/circulationV2";

function isNumericPathSegment(segment: string): boolean {
  return /^[0-9]+$/.test(segment);
}

function getAtPath(root: unknown, path: readonly string[]): unknown {
  let current: unknown = root;
  for (const segment of path) {
    if (!current || typeof current !== "object") return undefined;
    const record = current as Record<string, unknown>;
    current = record[segment];
  }
  return current;
}

function setAtPath(root: unknown, path: readonly string[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const container: unknown =
    root && typeof root === "object"
      ? Array.isArray(root)
        ? [...root]
        : { ...(root as Record<string, unknown>) }
      : isNumericPathSegment(head)
        ? []
        : {};

  if (Array.isArray(container) && isNumericPathSegment(head)) {
    const idx = Number(head);
    (container as unknown[])[idx] = setAtPath((container as unknown[])[idx], rest, value);
    return container;
  }

  (container as Record<string, unknown>)[head] = setAtPath(
    (container as Record<string, unknown>)[head],
    rest,
    value
  );
  return container;
}

function tryGetSchemaAtPath(schema: unknown, path: readonly string[]): unknown | null {
  let current: unknown = schema;
  for (const segment of path) {
    if (!current || typeof current !== "object") return null;
    const node = current as Record<string, unknown>;
    const properties = node.properties;
    if (properties && typeof properties === "object" && segment in (properties as Record<string, unknown>)) {
      current = (properties as Record<string, unknown>)[segment];
      continue;
    }

    // Best-effort: if we hit a union, pick the first branch that contains the property.
    const anyOf = node.anyOf;
    const oneOf = node.oneOf;
    const variants = (Array.isArray(anyOf) ? anyOf : Array.isArray(oneOf) ? oneOf : null) as unknown[] | null;
    if (variants) {
      const match = variants.find((variant) => {
        if (!variant || typeof variant !== "object") return false;
        const vProps = (variant as Record<string, unknown>).properties;
        return Boolean(vProps && typeof vProps === "object" && segment in (vProps as Record<string, unknown>));
      });
      if (match) {
        const vProps = (match as Record<string, unknown>).properties as Record<string, unknown>;
        current = vProps[segment];
        continue;
      }
    }

    return null;
  }
  return current;
}

export type ConfigOverridesPanelProps<TConfig> = {
  open: boolean;
  onClose(): void;
  controller: UseConfigOverridesResult<TConfig>;
  disabled: boolean;
  schema: unknown;
  focusPath?: readonly string[] | null;
};

function ConfigOverridesPanelImpl<TConfig>(props: ConfigOverridesPanelProps<TConfig>) {
  const { open, onClose, controller, disabled, schema, focusPath } = props;
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < 760
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => {
      setIsNarrow(window.innerWidth < 760);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
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

  const { rjsfSchema, formContext } = useMemo(() => {
    const normalized = toRjsfSchema(normalizeSchemaForRjsf(schema));
    const transparentPaths = collectTransparentPaths(normalized);
    return { rjsfSchema: normalized, formContext: { transparentPaths } satisfies BrowserConfigFormContext };
  }, [schema]);

  const focused = useMemo(() => {
    const focus = focusPath && focusPath.length > 0 ? [...focusPath] : null;
    if (!focus) return null;
    const focusedSchema = tryGetSchemaAtPath(rjsfSchema, focus);
    if (!focusedSchema) return null;
    return {
      path: focus,
      schema: focusedSchema,
      formContext: { transparentPaths: collectTransparentPaths(focusedSchema as any) } satisfies BrowserConfigFormContext,
      value: getAtPath(controller.value, focus),
    } as const;
  }, [controller.value, focusPath, rjsfSchema]);

  const uiSchema = useMemo<UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext>>(
    () => ({
      "ui:options": { label: false },
    }),
    []
  );

  if (!open) return null;

  return (
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
        <button onClick={onClose} style={{ ...buttonStyle, padding: "6px 10px" }} type="button">
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
          <span style={{ color: "#e5e7eb" }}>the recipe default config</span>.
        </div>
        {focused ? (
          <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.35 }}>
            Focus: <span style={{ color: "#e5e7eb" }}>{focused.path.join(".")}</span>
          </div>
        ) : null}
        {!controller.enabled ? (
          <div style={{ fontSize: 12, color: "#fbbf24", lineHeight: 1.35 }}>
            Overrides are currently <span style={{ color: "#fde68a", fontWeight: 700 }}>disabled</span>. You can still
            edit values here, but they won’t affect runs until you enable overrides.
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="checkbox"
              checked={controller.enabled}
              onChange={(e) => controller.setEnabled(e.target.checked)}
              disabled={disabled}
            />
            <span style={{ fontSize: 12, color: "#e5e7eb" }}>Enable overrides</span>
          </label>

          <button
            onClick={controller.reset}
            style={{ ...buttonStyle, padding: "6px 10px", opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
            type="button"
          >
            Reset to base
          </button>

          <button
            onClick={() => {
              controller.setValue(applyCirculationV2Preset(controller.value) as TConfig);
              controller.setEnabled(true);
            }}
            style={{ ...buttonStyle, padding: "6px 10px", opacity: disabled ? 0.6 : 1 }}
            disabled={disabled}
            type="button"
          >
            Apply circulation v2
          </button>

          <div style={{ flex: 1 }} />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => controller.setTab("form")}
              style={{
                ...buttonStyle,
                padding: "6px 10px",
                opacity: controller.tab === "form" ? 1 : 0.75,
              }}
              type="button"
            >
              Form
            </button>
            <button
              onClick={() => controller.setTab("json")}
              style={{
                ...buttonStyle,
                padding: "6px 10px",
                opacity: controller.tab === "json" ? 1 : 0.75,
              }}
              type="button"
            >
              JSON
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0, overflow: "auto", paddingRight: 2 }}>
          {controller.tab === "form" ? (
            <SchemaForm
              schema={focused?.schema ?? rjsfSchema}
              uiSchema={uiSchema}
              formContext={focused?.formContext ?? formContext}
              value={(focused?.value ?? controller.value) as any}
              // Toggling disabled on a huge RJSF subtree is very expensive. "Enable overrides"
              // controls whether values apply to the next run, not whether the form is editable.
              disabled={disabled}
              onChange={(next) => {
                if (!focused) {
                  controller.setValue(next as TConfig);
                  return;
                }
                controller.setValue(setAtPath(controller.value, focused.path, next) as TConfig);
              }}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, height: "100%" }}>
              <textarea
                value={controller.jsonText}
                onChange={(e) => controller.setJsonText(e.target.value)}
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
                disabled={disabled}
              />
              {controller.jsonError ? (
                <div style={{ fontSize: 12, color: "#fca5a5", whiteSpace: "pre-wrap" }}>
                  {controller.jsonError}
                </div>
              ) : null}
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button
                  onClick={() => {
                    controller.applyJson();
                  }}
                  style={{ ...buttonStyle, padding: "6px 10px" }}
                  disabled={disabled}
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
  );
}

// This panel can contain a very large RJSF form. Memoize it so high-frequency
// viz streaming updates don't re-render the entire overrides UI.
export const ConfigOverridesPanel = memo(ConfigOverridesPanelImpl) as typeof ConfigOverridesPanelImpl;
