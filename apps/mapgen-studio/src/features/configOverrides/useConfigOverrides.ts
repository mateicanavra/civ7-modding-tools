import { useCallback, useMemo, useState } from "react";
import { buildOverridesPatch } from "./overridesPatch";
import { validateConfigOverridesJson } from "./validate";

export type ConfigOverridesTab = "form" | "json";

export type UseConfigOverridesArgs<TConfig> = {
  baseConfig: TConfig;
  schema: unknown;
  disabled?: boolean;
  basePathForErrors?: string;
};

export type UseConfigOverridesResult<TConfig> = {
  enabled: boolean;
  setEnabled(next: boolean): void;

  tab: ConfigOverridesTab;
  setTab(next: ConfigOverridesTab): void;

  value: TConfig;
  setValue(next: TConfig): void;

  jsonText: string;
  setJsonText(next: string): void;
  jsonError: string | null;

  reset(): void;
  applyJson(): { ok: boolean; value?: TConfig };

  /**
   * Sparse overrides object to be merged onto the recipe default config by the runner.
   * Kept stable across "reroll" clicks to avoid paying deep-diff/clone costs on every run.
   */
  patchForRun: unknown | undefined;
};

export function useConfigOverrides<TConfig>(
  args: UseConfigOverridesArgs<TConfig>
): UseConfigOverridesResult<TConfig> {
  const { baseConfig, schema, basePathForErrors = "/configOverrides" } = args;
  const [enabled, setEnabled] = useState(false);
  const [tab, setTabState] = useState<ConfigOverridesTab>("form");
  const [value, setValueState] = useState<TConfig>(baseConfig);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(baseConfig, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setValueState(baseConfig);
    setJsonText(JSON.stringify(baseConfig, null, 2));
    setJsonError(null);
  }, [baseConfig]);

  const applyJson = useCallback((): { ok: boolean; value?: TConfig } => {
    const result = validateConfigOverridesJson<TConfig>(schema, jsonText, basePathForErrors);
    if (!result.ok) {
      setJsonError(result.error);
      return { ok: false };
    }
    setValueState(result.value);
    setJsonError(null);
    return { ok: true, value: result.value };
  }, [schema, jsonText, basePathForErrors]);

  const setValue = useCallback((next: TConfig) => {
    setValueState(next);
    setJsonError(null);
  }, []);

  const setTab = useCallback(
    (next: ConfigOverridesTab) => {
      if (next === tab) return;
      if (next === "form") {
        const result = validateConfigOverridesJson<TConfig>(schema, jsonText, basePathForErrors);
        if (!result.ok) {
          setJsonError(result.error);
          return;
        }
        setValueState(result.value);
        setJsonError(null);
        setTabState("form");
        return;
      }
      setJsonText(JSON.stringify(value, null, 2));
      setJsonError(null);
      setTabState("json");
    },
    [tab, schema, jsonText, basePathForErrors, value]
  );

  const patchForRun = useMemo((): unknown | undefined => {
    if (!enabled) return undefined;
    // Fast-path: when we haven't changed anything yet, keep payload empty.
    if (Object.is(value, baseConfig)) return undefined;

    const patch = buildOverridesPatch(baseConfig, value);
    if (
      patch &&
      typeof patch === "object" &&
      !Array.isArray(patch) &&
      Object.keys(patch as Record<string, unknown>).length === 0
    ) {
      return undefined;
    }
    return patch;
  }, [enabled, baseConfig, value]);

  // Keep the controller reference stable across unrelated parent re-renders.
  // This is critical because the overrides UI (RJSF) can be very expensive to
  // re-render when a recipe schema is large.
  return useMemo(
    () => ({
      enabled,
      setEnabled,
      tab,
      setTab,
      value,
      setValue,
      jsonText,
      setJsonText,
      jsonError,
      reset,
      applyJson,
      patchForRun,
    }),
    [
      enabled,
      setEnabled,
      tab,
      setTab,
      value,
      setValue,
      jsonText,
      setJsonText,
      jsonError,
      reset,
      applyJson,
      patchForRun,
    ]
  );
}
