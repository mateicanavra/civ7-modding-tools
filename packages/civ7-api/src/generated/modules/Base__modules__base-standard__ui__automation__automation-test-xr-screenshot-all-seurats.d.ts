declare enum XRScreenshotAllSeuratsScene {
    MainMenu = 0,
    Gameplay = 1
}
declare enum XRScreenshotAllSeuratsMenuState {
    Initialising = 0,
    Teleporting = 1,
    FreezingView = 2,
    Screenshotting = 3,
    UnFreezingView = 4,
    Deciding = 5,
    Moving = 6,
    Complete = 7
}
declare enum XRScreenshotAllSeuratsGameplayState {
    GameNotLoaded = 0,
    GameLoaded = 1,
    ChangingVista = 2,
    FreezingView = 3,
    Screenshotting = 4,
    UnFreezingView = 5,
    Complete = 6
}
declare enum XRScreenshotAllSeuratsPopulations {
    Low = 0,
    Medium = 1,
    High = 2
}
export declare class AutomationTestXRScreenshotAllSeurats {
    sceneIndex: number;
    sceneState: XRScreenshotAllSeuratsScene;
    menuZoneIndex: number;
    menuZones: string[];
    menuState: XRScreenshotAllSeuratsMenuState;
    gameplaySeuratIndex: number;
    gameplaySeuratPopulation: XRScreenshotAllSeuratsPopulations;
    gameplayState: XRScreenshotAllSeuratsGameplayState;
    orientationIndex: number;
    readonly orientations: {
        x: number;
        y: number;
        z: number;
    }[];
    readonly pauseTimeAny = 0.5;
    readonly pauseTimeStartDelay = 1;
    readonly pauseTimeTeleport = 0.5;
    readonly pauseTimeFreeze = 0.15;
    readonly pauseTimeTakeScreenshot = 0.15;
    readonly pauseTimeGameplayTurnModal = 5;
    readonly pauseTimeChangeVista = 0.2;
    private automationTestXRScreenshotAllSeuratsListener;
    register(): void;
    private onAutomationEvent;
    run(): void;
    initialise(): void;
    onUnpaused(): void;
    updateMainMenu(): void;
    updateGameplay(): void;
    stop(): void;
    teleportToNextLocation(): void;
    pause(time: number): void;
    applyOrientationIndex(): void;
    incrementOrientationIndex(): void;
}
export {};
