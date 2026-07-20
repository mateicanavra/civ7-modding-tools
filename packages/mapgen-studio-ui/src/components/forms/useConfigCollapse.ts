import { useCallback, useMemo, useState } from "react";
import type { ConfigCollapseContext } from "./rjsfTemplates.js";

// ============================================================================
// CONFIG COLLAPSE (Pass-4 config-collapse spec; flat-and-flush delta 6
// removed the sticky auto-expand-on-scroll engine)
// ============================================================================
// Owns the expansion state for the config form's collapsible objects. State
// is keyed by JSON pointer — pointers are identical in focused and unfocused
// modes (focused mode wraps the stage under its own key), so expansion
// survives mode switches. Expansion is purely manual: explicit user choices
// plus the focused-root default.
// ============================================================================

export type UseConfigCollapseArgs = Readonly<{
  /**
   * Pointer of the focused stage root, or null in unfocused mode. The
   * focused root defaults expanded (focusing a stage means "show me this
   * one"); everything else defaults collapsed.
   */
  focusRootPointer: string | null;
}>;

export function useConfigCollapse(args: UseConfigCollapseArgs): ConfigCollapseContext {
  const { focusRootPointer } = args;

  // Explicit user choices only — absence means "default", so the focused-root
  // default never fights a deliberate collapse.
  const [choices, setChoices] = useState<ReadonlyMap<string, boolean>>(new Map());

  // The RESOLVED expanded set (defaults applied) — exposed as data because
  // rjsf's deepEquals treats functions as always-equal; only content changes
  // in this Set make the form re-render (see ConfigCollapseContext).
  const expandedPointers = useMemo<ReadonlySet<string>>(() => {
    const out = new Set<string>();
    for (const [pointer, expanded] of choices) {
      if (expanded) out.add(pointer);
    }
    if (focusRootPointer && choices.get(focusRootPointer) !== false) {
      out.add(focusRootPointer);
    }
    return out;
  }, [choices, focusRootPointer]);

  const toggle = useCallback(
    (pointer: string) => {
      // Flip from the rendered state so the first click on a defaulted-open
      // focused root collapses it rather than re-recording "open".
      const current = expandedPointers.has(pointer);
      setChoices((prev) => {
        const next = new Map(prev);
        next.set(pointer, !current);
        return next;
      });
    },
    [expandedPointers]
  );

  return useMemo(() => ({ expandedPointers, toggle }), [expandedPointers, toggle]);
}
