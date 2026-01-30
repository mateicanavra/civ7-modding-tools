import { useEffect, useMemo, useState } from "react";
import type { RJSFSchema, UiSchema } from "@rjsf/utils";
import { SchemaForm } from "./SchemaForm";
import { collectTransparentPaths, normalizeSchemaForRjsf, toRjsfSchema } from "./schemaPresentation";
import type { BrowserConfigFormContext } from "./rjsfTemplates";
import type { UseConfigOverridesResult } from "./useConfigOverrides";

export type ConfigOverridesPanelProps<TConfig> = {
  open: boolean;
  onClose(): void;
  controller: UseConfigOverridesResult<TConfig>;
  disabled: boolean;
  schema: unknown;
};

export function ConfigOverridesPanel<TConfig>(props: ConfigOverridesPanelProps<TConfig>) {
  const { open, onClose, controller, disabled, schema } = props;
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
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

  const uiSchema = useMemo<UiSchema<TConfig, RJSFSchema, BrowserConfigFormContext>>(
    () => ({
      "ui:options": { label: false },
      foundation: {
        "ui:order": ["knobs", "advanced"],
      },
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
          <span style={{ color: "#e5e7eb" }}>BROWSER_TEST_RECIPE_CONFIG</span>.
        </div>

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
              schema={rjsfSchema}
              uiSchema={uiSchema}
              formContext={formContext}
              value={controller.value}
              disabled={disabled || !controller.enabled}
              onChange={controller.setValue}
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
                disabled={disabled || !controller.enabled}
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
                  disabled={disabled || !controller.enabled}
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
