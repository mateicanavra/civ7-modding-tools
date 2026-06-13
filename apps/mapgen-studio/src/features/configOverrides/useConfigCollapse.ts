import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { ConfigCollapseContext } from "./rjsfTemplates";

// ============================================================================
// CONFIG COLLAPSE (Pass-4 config-collapse spec)
// ============================================================================
// Owns the expansion state for the config form's collapsible objects and the
// optional sticky auto-expand-on-scroll engine. State is keyed by JSON
// pointer — pointers are identical in focused and unfocused modes (focused
// mode wraps the stage under its own key), so expansion survives mode
// switches. The engine is DOM-driven: templates stamp `data-config-header` +
// `data-config-pointer`, and the hook queries them on scroll — no ref
// registry to keep alive across rjsf re-renders.
// ============================================================================

/**
 * Distance (px) from the top of the scroll viewport to the sticky "focus
 * line": the header that most recently crossed it owns the expansion chain.
 */
const FOCUS_LINE_OFFSET = 56;

/** "/a/b/c" → ["/a", "/a/b", "/a/b/c"] — a pointer plus all its ancestors. */
export function pointerPrefixes(pointer: string): string[] {
  const parts = pointer.split("/").filter(Boolean);
  const out: string[] = [];
  let acc = "";
  for (const part of parts) {
    acc += `/${part}`;
    out.push(acc);
  }
  return out;
}

/**
 * The active chain for sticky mode: the candidate is the LAST header sitting
 * at/above the focus line (the section the reader is inside); with none
 * above it yet, the first header. The chain is the candidate plus its
 * ancestor pointers — ancestors are string prefixes, no tree bookkeeping.
 */
export function computeActiveChain(
  headers: ReadonlyArray<{ pointer: string; top: number }>,
  focusLine: number
): ReadonlySet<string> {
  if (headers.length === 0) return new Set();
  let candidate = headers[0];
  for (const header of headers) {
    if (header.top <= focusLine) candidate = header;
  }
  return new Set(pointerPrefixes(candidate.pointer));
}

function setsEqual(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  if (a.size !== b.size) return false;
  for (const v of a) if (!b.has(v)) return false;
  return true;
}

export type UseConfigCollapseArgs = Readonly<{
  /** The form's scroll container (the config section of the recipe panel). */
  scrollRootRef: RefObject<HTMLElement | null>;
  /** Sticky auto-expand-on-scroll mode (config toolbar toggle, default OFF). */
  sticky: boolean;
  /**
   * Pointer of the focused stage root, or null in unfocused mode. The
   * focused root defaults expanded (focusing a stage means "show me this
   * one"); everything else defaults collapsed.
   */
  focusRootPointer: string | null;
}>;

export function useConfigCollapse(args: UseConfigCollapseArgs): ConfigCollapseContext {
  const { scrollRootRef, sticky, focusRootPointer } = args;

  // Explicit user choices only — absence means "default", so the focused-root
  // default never fights a deliberate collapse.
  const [choices, setChoices] = useState<ReadonlyMap<string, boolean>>(new Map());
  const [activeChain, setActiveChain] = useState<ReadonlySet<string>>(new Set());
  // Scroll anchor: the deepest active header's viewport offset, recorded when
  // the chain changes and restored after render so the reading position never
  // visibly teleports when content above the focus line collapses.
  const anchorRef = useRef<{ pointer: string; top: number } | null>(null);

  // The RESOLVED expanded set (defaults applied) — exposed as data because
  // rjsf's deepEquals treats functions as always-equal; only content changes
  // in this Set make the form re-render (see ConfigCollapseContext).
  const expandedPointers = useMemo<ReadonlySet<string>>(() => {
    if (sticky) return activeChain;
    const out = new Set<string>();
    for (const [pointer, expanded] of choices) {
      if (expanded) out.add(pointer);
    }
    if (focusRootPointer && choices.get(focusRootPointer) !== false) {
      out.add(focusRootPointer);
    }
    return out;
  }, [sticky, activeChain, choices, focusRootPointer]);

  const toggle = useCallback(
    (pointer: string) => {
      // Flip from the rendered state. In sticky mode the click is recorded as
      // a manual choice (it applies when the mode turns off); the next scroll
      // recomputation keeps owning the visible state.
      const current = expandedPointers.has(pointer);
      setChoices((prev) => {
        const next = new Map(prev);
        next.set(pointer, !current);
        return next;
      });
    },
    [expandedPointers]
  );

  useEffect(() => {
    if (!sticky) return;
    const root = scrollRootRef.current;
    if (!root) return;
    let raf = 0;
    const recompute = () => {
      raf = 0;
      const rootTop = root.getBoundingClientRect().top;
      const focusLine = rootTop + FOCUS_LINE_OFFSET;
      const headerEls = Array.from(
        root.querySelectorAll<HTMLElement>("[data-config-header][data-config-pointer]")
      );
      const headers = headerEls
        .map((el) => ({
          pointer: el.getAttribute("data-config-pointer") ?? "",
          top: el.getBoundingClientRect().top,
          el,
        }))
        .filter((h) => h.pointer.length > 0);
      const chain = computeActiveChain(headers, focusLine);
      setActiveChain((prev) => {
        if (setsEqual(prev, chain)) return prev;
        let deepest: string | null = null;
        for (const pointer of chain) {
          if (deepest === null || pointer.length > deepest.length) deepest = pointer;
        }
        const anchorEl = deepest ? headers.find((h) => h.pointer === deepest)?.el : undefined;
        anchorRef.current =
          deepest && anchorEl
            ? { pointer: deepest, top: anchorEl.getBoundingClientRect().top }
            : null;
        return chain;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(recompute);
    };
    root.addEventListener("scroll", onScroll, { passive: true });
    recompute();
    return () => {
      root.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sticky, scrollRootRef]);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    anchorRef.current = null;
    const root = scrollRootRef.current;
    if (!root) return;
    const el = root.querySelector<HTMLElement>(
      `[data-config-header][data-config-pointer="${anchor.pointer}"]`
    );
    if (!el) return;
    const delta = el.getBoundingClientRect().top - anchor.top;
    if (delta !== 0) root.scrollTop += delta;
  }, [activeChain, scrollRootRef]);

  return useMemo(() => ({ expandedPointers, toggle }), [expandedPointers, toggle]);
}
