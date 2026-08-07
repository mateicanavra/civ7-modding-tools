declare enum XRTeleportTestState {
    Teleporting = 0,
    ReturningHome = 1,
    Moving = 2,
    Complete = 3
}
export declare class AutomationTestXRTeleportZones {
    testingZoneFromName: string;
    testingZoneToName: string;
    testingOuterIndex: number;
    testingInnerIndex: number;
    testingHomeName: string;
    testingShouldReturnHome: boolean;
    testingIsMovingToNewLocation: boolean;
    allStartingZones: string[];
    state: XRTeleportTestState;
    private automationTestXRTeleportZonesListener;
    register(): void;
    private onAutomationEvent;
    initialise(): void;
    run(): void;
    stop(): void;
    onTeleportCompleted(_data: XRTeleportCompleted_EventData): void;
    updateTestState(): void;
    testSelfTeleportation(): void;
    configureNextTeleport(): void;
    performNextTeleport(): void;
    validateTeleport(): void;
}
export {};
