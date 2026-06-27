/**
 * Design-system surface for the Claude Design sync (window.MapGenStudio).
 *
 * Curated re-export barrel that SCOPES the importable bundle to the design
 * system's public components — not the whole app. The two existing source
 * barrels cover the shadcn primitives and most composites; OptionSelect and
 * StageViewTabs are exported here explicitly because they aren't in
 * `src/ui/components/index.ts`.
 *
 * Owned by the design-sync workflow (config `entry`). Safe to regenerate.
 */
export * from "@/components/ui/index";
export * from "@/ui/components/index";
export { OptionSelect } from "@/ui/components/OptionSelect";
export { StageViewTabs } from "@/ui/components/StageViewTabs";
