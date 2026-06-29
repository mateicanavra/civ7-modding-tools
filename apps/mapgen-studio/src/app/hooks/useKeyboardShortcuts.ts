import { useEffect } from "react";

import { shouldIgnoreGlobalShortcutsInEditableTarget } from "../../shared/shortcuts/shortcutPolicy";
import type { DataTypeOption, StageOption, StepOption } from "../../ui/types";
import { useLatestRef } from "./useLatestRef";

/**
 * The live snapshot the global keydown listener dispatches into. The host
 * re-assembles this object every render from the current viz selection, run
 * actions, and panel toggles; `useKeyboardShortcuts` mirrors it through a
 * render-phase ref so the listener (installed once, deps `[]`) always reads the
 * latest values without re-subscribing. The keyboard domain owns *how* keys map
 * to actions; the host owns *what* those actions are (panel state, run wiring,
 * selection handlers all live elsewhere) and passes them in here.
 */
export type KeyboardShortcutContext = {
  stages: StageOption[];
  steps: StepOption[];
  dataTypeOptions: DataTypeOption[];
  selectedStageId: string;
  selectedStepId: string;
  selectedDataTypeId: string | null;
  handleStageChange(stageId: string): void;
  setSelectedStepId(stepId: string): void;
  handleDataTypeChange(dataTypeId: string): void;
  run(): void;
  reroll(): void;
  toggleRightPanel(): void;
  toggleLeftPanel(): void;
};

/**
 * `useKeyboardShortcuts` — installs the single global `keydown` listener that
 * drives run/re-roll, panel collapse, and stage/step/layer navigation.
 *
 * The listener is registered once (deps `[]`) and reads every live value via
 * `shortcutsRef.current`, which is rewritten in render scope by `useLatestRef`.
 * That indirection is deliberate: re-subscribing per render would let a keydown
 * fired between renders run a stale `triggerRun`/`reroll` or navigate a stale
 * option list. Reading the ref at invocation keeps dispatch correct without
 * tearing the listener down on every state change.
 */
export function useKeyboardShortcuts(context: KeyboardShortcutContext): void {
  const shortcutsRef = useLatestRef(context);

  useEffect(() => {
    const isEditableTarget = (target: EventTarget | null) => {
      const el = target as HTMLElement | null;
      if (!el) return false;
      if (el.isContentEditable) return true;
      const tag = el.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      return Boolean(
        el.closest?.(
          [
            "input",
            "textarea",
            "select",
            '[contenteditable="true"]',
            '[role="textbox"]',
            '[role="combobox"]',
            '[role="listbox"]',
            '[role="option"]',
            '[role="menu"]',
            '[role="menuitem"]',
            '[role="dialog"]',
            '[role="alertdialog"]',
          ].join(", ")
        )
      );
    };

    const clampIndex = (index: number, max: number) => Math.max(0, Math.min(max, index));

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.isComposing) return;

      const ctx = shortcutsRef.current;
      const isMod = event.metaKey || event.ctrlKey;
      const isEditable = isEditableTarget(event.target);

      // While typing in inputs/textareas/etc, ignore bare keys (so typing doesn't trigger app shortcuts).
      // Allow modifier+Arrow so Cmd/Opt shortcuts still work when focus is in a field.
      if (
        shouldIgnoreGlobalShortcutsInEditableTarget({
          isEditableTarget: isEditable,
          metaKey: event.metaKey,
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
        })
      )
        return;

      // Run / re-roll
      if (isMod && event.key === "Enter") {
        event.preventDefault();
        if (event.repeat) return;
        if (event.shiftKey) ctx.reroll();
        else ctx.run();
        return;
      }

      // Collapse panels
      if (isMod && (event.key === "b" || event.key === "B")) {
        event.preventDefault();
        if (event.repeat) return;
        ctx.toggleLeftPanel();
        return;
      }
      if (isMod && (event.key === "i" || event.key === "I")) {
        event.preventDefault();
        if (event.repeat) return;
        ctx.toggleRightPanel();
        return;
      }

      // Layer / step / stage navigation (arrows require modifiers so deck.gl can use bare arrows for panning).
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        const dir = event.key === "ArrowUp" ? -1 : 1;

        // Opt+Up/Down => layer
        if (event.altKey && !isMod) {
          if (!ctx.dataTypeOptions.length) return;
          event.preventDefault();
          const selected = ctx.selectedDataTypeId ?? ctx.dataTypeOptions[0]?.value ?? "";
          const idx = ctx.dataTypeOptions.findIndex((dt) => dt.value === selected);
          const nextIdx = clampIndex(idx + dir, ctx.dataTypeOptions.length - 1);
          const next = ctx.dataTypeOptions[nextIdx]?.value ?? null;
          if (!next || next === selected) return;
          ctx.handleDataTypeChange(next);
          return;
        }

        if (!isMod) return;

        // Cmd+Shift+Up/Down => step
        if (event.shiftKey) {
          if (!ctx.steps.length) return;
          event.preventDefault();
          const idx = ctx.steps.findIndex((s) => s.value === ctx.selectedStepId);
          const nextIdx = clampIndex(idx + dir, ctx.steps.length - 1);
          const nextStep = ctx.steps[nextIdx]?.value ?? null;
          if (!nextStep || nextStep === ctx.selectedStepId) return;
          ctx.setSelectedStepId(nextStep);
          return;
        }

        // Cmd+Up/Down => stage
        if (!ctx.stages.length) return;
        event.preventDefault();
        const idx = ctx.stages.findIndex((s) => s.value === ctx.selectedStageId);
        const nextIdx = clampIndex(idx + dir, ctx.stages.length - 1);
        const nextStage = ctx.stages[nextIdx]?.value ?? null;
        if (!nextStage || nextStage === ctx.selectedStageId) return;
        ctx.handleStageChange(nextStage);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // Installs once; reads the latest context via `shortcutsRef.current` (a
    // stable render-phase ref), so no reactive value belongs in deps.
  }, []);
}
