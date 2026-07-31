// @vitest-environment jsdom
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppHeader, TooltipProvider } from "@swooper/mapgen-studio-ui";
import { fireEvent, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterAll, describe, expect, it } from "vitest";
import { deriveAppHeaderSetupState } from "../../src/app/hooks/useSetupControls";
import type { Civ7StudioSetupConfig } from "../../src/features/civ7Setup/setupConfig";

// AppHeader rendered-markup regression pin: the byte-exact markup AppHeader
// currently renders across 7 scenarios, so that any UNINTENDED markup change
// fails loudly. It is a regression pin, NOT an equivalence proof — the E4a
// redesign no-op verification it was born as (fixture captured pre-redesign at
// the B6 parent tip 1eb984728, reproduced byte-identically by the package
// AppHeader + container derivation) is permanently anchored in git history at
// the B6/B7 commits and is not re-proven here.
//
// The fixture advances only on a DELIBERATE markup change, and every advance is
// enumerated. Advance 1 (B8, E3 cleanup wave): `tabindex="0"` on the AppBrand
// root. Advance 2 (this initiative): ViewControls' theme + grid toggles became
// `IconButton` rather than hand-rolled `<button className={iconBtn}>` (attribute
// order + class list, all 7 scenes); the Re-apply affordance is wrapped in
// `<Badge asChild variant="warning">` (the two `modified: true` scenes); and the
// setup panel's `aria-controls`/`id` linkage moved from a hardcoded
// `app-header-setup-panel` to `React.useId()`, which the React-lint domain's
// `useUniqueElementIds` requires.
//
// Generated ids are NORMALIZED out of both capture and fixture (see
// `normalizeGeneratedIds`): a `useId()` value is a React implementation detail
// whose text depends on hook ordering and render entry point, so pinning it
// would make this test fail on refactors that change nothing a user can see.
// The linkage itself stays pinned — both sides collapse to the same token, so a
// broken `aria-controls` → `id` pairing still diverges.
//
// The scenarios: the two story scenes, the P7 precedence-pin scenes, a
// no-saved-config + gameConsole scene, and two OPEN setup-panel scenes
// (gear-click via jsdom) covering the leader/civ/difficulty/speed value paths
// including the difficulty game-over-player fallback — all rendered through the
// REAL app container derivation (`deriveAppHeaderSetupState`) composed with the
// package AppHeader. Static scenes render via renderToStaticMarkup; the two open
// scenes render via RTL + gear click.
//
// To advance the fixture after an intended markup change, re-run this file with
// `UPDATE_MARKUP_PIN=1` and review the resulting diff delta-by-delta — an
// unreviewed regeneration defeats the point of the pin.

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "fixtures",
  "appHeaderMarkup.json"
);

const fixture: Record<string, string> = JSON.parse(readFileSync(fixturePath, "utf8"));

const updateFixture = process.env.UPDATE_MARKUP_PIN === "1";
const captured: Record<string, string> = {};

// React's useId output (`_R_0_` server / `_r_0_` client in 19, `:r0:` in 18) is
// generated, not authored — its text depends on hook ordering and render entry
// point, so pinning it would fail on refactors that change nothing visible.
// Each DISTINCT generated id collapses to its own stable token in order of first
// appearance, so linkage stays pinned: a swapped or dangling
// `aria-controls` → `id` pairing still diverges from the fixture.
const GENERATED_ID = /_[Rr]_[0-9a-z]*_|:r[0-9a-z]+:/g;

function normalizeGeneratedIds(html: string): string {
  const seen = new Map<string, string>();
  return html.replace(GENERATED_ID, (raw) => {
    const token = seen.get(raw) ?? `«id:${seen.size}»`;
    seen.set(raw, token);
    return token;
  });
}

function pin(name: string, actual: string): void {
  captured[name] = actual;
  if (updateFixture) return;
  expect(fixture[name], name).toBeTypeOf("string");
  expect(actual, name).toBe(fixture[name]);
}

afterAll(() => {
  if (!updateFixture) return;
  writeFileSync(fixturePath, `${JSON.stringify(captured, null, 2)}\n`, "utf8");
});

const noop = () => {};

// --- scenario inputs, byte-identical to the parent-tip generator ---

const STORY_SETUP_CONFIG: Civ7StudioSetupConfig = {
  savedConfig: {
    id: "continents-std",
    displayName: "Continents — Standard",
    fileName: "continents-std.Civ7Cfg",
  },
  gameOptions: {},
  mapOptions: {},
  playerOptions: [{ playerId: 0, options: {} }],
};

const STORY_SETUP_OPTIONS = {
  savedConfigOptions: [
    { value: "continents-std", label: "Continents — Standard" },
    { value: "archipelago", label: "Archipelago" },
    { value: "pangaea", label: "Pangaea" },
  ],
  leaderOptions: [],
  civilizationOptions: [],
  difficultyOptions: [],
  gameSpeedOptions: [],
};

const PIN_SETUP_CONFIG: Civ7StudioSetupConfig = {
  savedConfig: {
    id: "tot-config",
    displayName: "ToT Config",
    fileName: "ToT Config.Civ7Cfg",
  },
  gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
  mapOptions: {},
  playerOptions: [{ playerId: 0, options: {} }],
};

const PIN_SETUP_OPTIONS = {
  savedConfigOptions: [
    { value: "", label: "No saved config" },
    { value: "tot-config", label: "ToT Config" },
  ],
  leaderOptions: [{ value: "", label: "Leader" }],
  civilizationOptions: [{ value: "", label: "Civilization" }],
  difficultyOptions: [{ value: "", label: "Difficulty" }],
  gameSpeedOptions: [{ value: "", label: "Speed" }],
};

const NO_SAVED_SETUP_CONFIG: Civ7StudioSetupConfig = {
  gameOptions: {},
  mapOptions: {},
  playerOptions: [{ playerId: 0, options: { PlayerLeader: "LEADER_AMINA" } }],
};

const OPEN_SETUP_OPTIONS = {
  savedConfigOptions: [
    { value: "", label: "No saved config" },
    { value: "tot-config", label: "ToT Config" },
  ],
  leaderOptions: [
    { value: "", label: "Leader" },
    { value: "LEADER_AMINA", label: "Amina" },
  ],
  civilizationOptions: [
    { value: "", label: "Civilization" },
    { value: "CIVILIZATION_AKSUM", label: "Aksum" },
  ],
  difficultyOptions: [
    { value: "", label: "Difficulty" },
    { value: "DIFFICULTY_KING", label: "King" },
    { value: "DIFFICULTY_DEITY", label: "Deity" },
  ],
  gameSpeedOptions: [
    { value: "", label: "Speed" },
    { value: "GAMESPEED_ONLINE", label: "Online" },
  ],
};

const OPEN_POPULATED_CONFIG: Civ7StudioSetupConfig = {
  savedConfig: PIN_SETUP_CONFIG.savedConfig,
  gameOptions: { Difficulty: "DIFFICULTY_DEITY", GameSpeeds: "GAMESPEED_ONLINE" },
  mapOptions: {},
  playerOptions: [
    {
      playerId: 0,
      options: { PlayerLeader: "LEADER_AMINA", PlayerCivilization: "CIVILIZATION_AKSUM" },
    },
  ],
};

const OPEN_FALLBACK_CONFIG: Civ7StudioSetupConfig = {
  savedConfig: PIN_SETUP_CONFIG.savedConfig,
  gameOptions: {},
  mapOptions: {},
  playerOptions: [{ playerId: 0, options: { PlayerDifficulty: "DIFFICULTY_KING" } }],
};

// Story wrapper, byte-identical to AppHeader.stories.tsx `Bar`.
function Bar({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 920, height: 72, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// --- new-contract prop plumbing: the REAL container derivation feeds the
// package AppHeader the view-model the deleted component computed inline ---
type Scene = { config: Civ7StudioSetupConfig } & Partial<{
  themePreference: "system" | "light" | "dark";
  showGrid: boolean;
  options: typeof PIN_SETUP_OPTIONS;
  modified: boolean;
  gameConsole: ReactNode;
}>;

function header(scene: Scene): ReactElement {
  return (
    <AppHeader
      themePreference={scene.themePreference ?? "dark"}
      onThemeCycle={noop}
      showGrid={scene.showGrid ?? false}
      onShowGridChange={noop}
      setup={deriveAppHeaderSetupState(scene.config)}
      setupOptions={scene.options ?? PIN_SETUP_OPTIONS}
      savedConfigModified={scene.modified ?? false}
      onSavedConfigChange={noop}
      onLeaderChange={noop}
      onCivilizationChange={noop}
      onDifficultyChange={noop}
      onGameSpeedChange={noop}
      gameConsole={scene.gameConsole}
    />
  );
}

function captureStatic(node: ReactElement): string {
  return normalizeGeneratedIds(renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>));
}

function captureOpen(node: ReactElement): string {
  const { container, unmount } = render(<TooltipProvider>{node}</TooltipProvider>);
  const gear = container.querySelector('button[aria-label="Game setup"]');
  if (!gear) throw new Error("gear button not found");
  fireEvent.click(gear);
  const html = container.innerHTML;
  unmount();
  return normalizeGeneratedIds(html);
}

describe("AppHeader rendered-markup regression pin (container derivation + package view)", () => {
  it("pins the closed-header scenes byte-identical to the recorded markup", () => {
    const scenes: Record<string, ReactElement> = {
      "story/Default": (
        <Bar>
          {header({
            config: STORY_SETUP_CONFIG,
            options: STORY_SETUP_OPTIONS,
            themePreference: "dark",
            showGrid: true,
            modified: false,
          })}
        </Bar>
      ),
      "story/ModifiedConfig": (
        <Bar>
          {header({
            config: STORY_SETUP_CONFIG,
            options: STORY_SETUP_OPTIONS,
            themePreference: "dark",
            showGrid: false,
            modified: true,
          })}
        </Bar>
      ),
      "pins/CleanSavedConfig": header({ config: PIN_SETUP_CONFIG }),
      "pins/DriftedSavedConfig": header({ config: PIN_SETUP_CONFIG, modified: true }),
      "pins/NoSavedConfigWithConsole": header({
        config: NO_SAVED_SETUP_CONFIG,
        gameConsole: <span>console</span>,
      }),
    };
    for (const [name, node] of Object.entries(scenes)) {
      pin(name, captureStatic(node));
    }
  });

  it("pins the OPEN setup panel byte-identical — the view-model value paths (generator order)", () => {
    pin(
      "open/PopulatedSetup",
      captureOpen(header({ config: OPEN_POPULATED_CONFIG, options: OPEN_SETUP_OPTIONS }))
    );
    pin(
      "open/FallbackDifficulty",
      captureOpen(header({ config: OPEN_FALLBACK_CONFIG, options: OPEN_SETUP_OPTIONS }))
    );
  });
});
