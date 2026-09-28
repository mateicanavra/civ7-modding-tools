/**
 * @file narrative-event-panel.tsx
 * @copyright 2020-2026, Firaxis Games
 * @description Panel for the main body of small narrative events
 */
import { SmallNarrativeEventChoice } from "/base-standard/ui-next/screens/narrative-events/small-narrative-event-model.js";
export interface NarrativeEventPanelProps {
    bodyText: string;
    titleText?: string;
    choices: SmallNarrativeEventChoice[];
    storyType?: "LIGHT" | "DISCOVERY";
    leaderCiv?: string;
    backgroundImage?: string;
    onChoiceSelected: (choice: SmallNarrativeEventChoice) => void;
    onClose: () => void;
    panelID: string;
}
export declare const NarrativeEventPanel: (props: NarrativeEventPanelProps) => any;
