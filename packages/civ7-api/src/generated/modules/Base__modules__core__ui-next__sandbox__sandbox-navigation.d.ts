/**
 * A simple controller focus navigation service for use on in sandboxes
 */
export declare class SandboxNavigation {
    private targetElement;
    constructor();
    setFocus(element: HTMLElement): void;
    onEngineInput(name: string, status: InputActionStatuses, x: number, y: number): void;
}
