import { JSX } from "solid-js";
export declare enum CreateGameStageMode {
    Full = 0,
    StageOnly = 1,
    HeaderOnly = 2,
    None = 3
}
export interface CreateGameStageProps {
    header: JSX.Element;
    backgroundImage?: string;
    backgroundOpacity?: number;
    addTextBgGradient?: boolean;
    hideLowerHeaderFiligree?: boolean;
    /** Default: Full */
    mode?: CreateGameStageMode;
}
export declare const CreateGameStage: any;
export declare enum ExitButtonPosition {
    Left = 0,
    Right = 1,
    None = 2
}
export interface CreateGameStageHeaderProps {
    showSteps: boolean;
    title: string;
    exitText?: string;
    exitHotkey?: string;
    hideButtonText?: string;
    onBack?: () => void;
}
export declare const CreateGameStageHeader: any;
