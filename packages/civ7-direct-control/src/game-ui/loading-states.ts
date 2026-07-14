export const CIV7_UI_LOADING_STATES = {
  NotStarted: 0,
  WaitingForGameplayData: 1,
  WaitingForLoadingCurtain: 2,
  WaitingForConfiguration: 3,
  WaitingForGameCore: 4,
  WaitingForVisualization: 5,
  WaitingForUIReady: 6,
  WaitingToStart: 7,
  GameStarted: 8,
  WaitingForGameUnloadScreenReady: 9,
} as const;

export type Civ7UiLoadingStateName = keyof typeof CIV7_UI_LOADING_STATES;
