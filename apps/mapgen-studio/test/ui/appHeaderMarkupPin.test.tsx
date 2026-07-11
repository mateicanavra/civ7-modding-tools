// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppHeader, TooltipProvider } from "@swooper/mapgen-studio-ui";
import { fireEvent, render } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { deriveAppHeaderSetupState } from "../../src/app/hooks/useSetupControls";
import type { Civ7StudioSetupConfig } from "../../src/features/civ7Setup/setupConfig";

// AppHeader rendered-markup regression pins. Originally the E4a redesign
// no-op verification (tasks.md 6.1): the fixture was the byte-exact markup of the
// PRE-redesign app-side AppHeader captured at the B6 parent tip
// (studio-ui-panels, 1eb984728), and the redesigned package AppHeader +
// container derivation reproduced it byte-identically — that verification is
// anchored in git history (the fixture as of the B6/B7 commits). The fixture
// has since advanced ONCE, for the E3 cleanup wave (B8): the only delta vs
// the B6 capture, enumerated across all 7 scenarios, is `tabindex="0"` on
// the AppBrand root — E3 item 2's keyboard-a11y intent (nothing else in the
// wave moved AppHeader's markup). The scenarios: the two story scenes, the
// P7 precedence-pin scenes, a no-saved-config + gameConsole scene, and two
// OPEN setup-panel scenes (gear-click via jsdom) covering the
// leader/civ/difficulty/speed value paths including the difficulty
// game-over-player fallback, all rendered through the REAL app container
// derivation (`deriveAppHeaderSetupState`) composed with the package
// AppHeader and required byte-equal.
//
// Static scenes render via renderToStaticMarkup (server ids, per-call
// deterministic); the two open scenes render via RTL + gear click in the
// generator's exact order (client useId parity — currently vacuous: the
// captured markup carries no generated ids, only the authored
// `app-header-setup-panel`).

const fixture: Record<string, string> = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "fixtures", "appHeaderMarkup.json"),
    "utf8"
  )
);

const noop = () => {};

// --- scenario inputs, byte-identical to the parent-tip generator ---

const STORY_SETUP_CONFIG: Civ7StudioSetupConfig = {
  savedConfig: {
    id: "continents-std",
    displayName: "Continents — Standard",
    fileName: "continents-std.json",
    path: "/configs/continents-std.json",
  },
  gameOptions: {},
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
    path: "/tmp/ToT Config.Civ7Cfg",
  },
  gameOptions: { Difficulty: "DIFFICULTY_CUSTOM" },
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
  return renderToStaticMarkup(<TooltipProvider>{node}</TooltipProvider>);
}

function captureOpen(node: ReactElement): string {
  const { container, unmount } = render(<TooltipProvider>{node}</TooltipProvider>);
  const gear = container.querySelector('button[aria-label="Game setup"]');
  if (!gear) throw new Error("gear button not found");
  fireEvent.click(gear);
  const html = container.innerHTML;
  unmount();
  return html;
}

describe("E4a AppHeader redesign is a rendered-markup no-op (container derivation + package view)", () => {
  it("pins the closed-header scenes byte-identical to the pre-redesign render", () => {
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
      expect(fixture[name], name).toBeTypeOf("string");
      expect(captureStatic(node), name).toBe(fixture[name]);
    }
  });

  it("pins the OPEN setup panel byte-identical — the view-model value paths (generator order)", () => {
    expect(
      captureOpen(header({ config: OPEN_POPULATED_CONFIG, options: OPEN_SETUP_OPTIONS }))
    ).toBe(fixture["open/PopulatedSetup"]);
    expect(captureOpen(header({ config: OPEN_FALLBACK_CONFIG, options: OPEN_SETUP_OPTIONS }))).toBe(
      fixture["open/FallbackDifficulty"]
    );
  });
});
