import { GameConsole, TooltipProvider } from "mapgen-studio";

// GameConsole is the live-Civ7 command cluster (live status chip + autoplay /
// explore / Run-in-Game controls) composed into the header's Game bar.
// cardMode:column gives it full width.
const noop = () => {};

function Bar({ children }) {
  return (
    <div
      className="relative bg-background"
      style={{ padding: 16, borderRadius: 8, display: "flex", justifyContent: "center" }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}

export const LiveReady = () => (
  <Bar>
    <GameConsole
      liveRuntime={{ status: "ok", turn: 42, seed: "1474829", readiness: "Civ7 ready", autoplayActive: false }}
      liveGameStudioRelation="current"
      onSyncFromLiveGame={noop}
      onToggleAutoplay={noop}
      onExplore={noop}
      operationControlsDisabled={false}
      isRunInGameRunning={false}
      runInGameStatus={null}
      runInGameCurrentRelation="current"
      onRunInGame={noop}
      onCopyRunInGameDiagnostics={noop}
      saveDeployStatus={null}
    />
  </Bar>
);

export const NoLiveGame = () => (
  <Bar>
    <GameConsole
      liveRuntime={undefined}
      operationControlsDisabled={false}
      isRunInGameRunning={false}
      runInGameStatus={null}
      onRunInGame={noop}
      saveDeployStatus={null}
    />
  </Bar>
);
