import { memo, useEffect, useMemo, useState } from "react";
import { SchemaConfigForm } from "./SchemaConfigForm";
import { normalizeSchemaForRjsf, toRjsfSchema, tryGetSchemaAtPath } from "./schemaPresentation";
import type { UseConfigOverridesResult } from "./useConfigOverrides";
import { getAtPath } from "./pathUtils";

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

  const focused = useMemo(() => {
    const focus = focusPath && focusPath.length > 0 ? [...focusPath] : null;
    if (!focus) return null;
    try {
      const normalized = toRjsfSchema(normalizeSchemaForRjsf(schema));
      const focusedSchema = tryGetSchemaAtPath(normalized, focus);
      if (!focusedSchema) return null;
      return {
        path: focus,
        value: getAtPath(controller.value, focus),
      } as const;
    } catch {
      return null;
    }
  }, [controller.value, focusPath, schema]);

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
            <SchemaConfigForm
              schema={schema}
              value={controller.value}
              focusPath={focused?.path ?? null}
              // Toggling disabled on a huge RJSF subtree is very expensive. "Enable overrides"
              // controls whether values apply to the next run, not whether the form is editable.
              disabled={disabled}
              onChange={(next) => controller.setValue(next)}
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
