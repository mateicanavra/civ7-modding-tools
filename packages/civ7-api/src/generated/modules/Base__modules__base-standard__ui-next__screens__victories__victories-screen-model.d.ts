/**
 * @file victories-screen-model.ts
 * @copyright 2025-2026, Firaxis Games
 * @description SolidJS model for the victory screen.
 */
import { Accessor, Setter } from "solid-js";
import { LineGraphLine } from "/core/ui-next/components/line-graph.js";
import { OrnateFrameProps } from "/core/ui-next/components/ornate-panel.js";
import { TooltipBaseProps, TooltipHorizontalPosition, TooltipVerticalPosition } from "/core/ui-next/components/tooltip.js";
import { HotkeyContextProvider } from "/core/ui-next/services/hotkey.js";
import { PropsRef } from "/core/ui-next/utilities/solid-utilities.js";
export declare enum VictoryTabType {
    Military = 0,
    Cultural = 1,
    Economic = 2,
    Scientific = 3,
    Score = 4
}
export declare enum LaunchpadStatus {
    unset = 0,
    PreModern = 1,
    NeedRocketry = 2,
    NotBuilt = 3,
    Built = 4,
    InUse = 5,
    Damaged = 6
}
export interface VictoryDominantPlayer {
    name: string;
    id: number;
    turns: number;
    percent: number;
}
export interface SummaryVictoryProps {
    victoryType: number;
    victoryClass: string;
    victoryLogo: string;
    titleText: string;
    titleColor: string;
    description: string;
    divider: boolean;
    summaryBg: string;
    background: string;
    rules: string;
    goals: PointGoalProps;
    dominantPlayer: VictoryDominantPlayer[];
    tabId: string;
    hasFocus: boolean;
    visible: boolean;
}
export interface MilitaryStructureBreakdown {
    name: string;
    points: number;
    sortOrder: number;
}
export interface MilitaryStructureDetail {
    name: string;
    points: number;
    iconURL: string;
    iconClass: string;
    wasConqueredFromIdeologicalOpponent: boolean;
    breakdown: MilitaryStructureBreakdown[];
    hasMet: boolean;
}
export interface PlayerMilitaryDetail {
    playerInfo: VictoryRowPlayer;
    structures: MilitaryStructureDetail[];
}
export interface MilitaryDetailProps {
    headerText: string;
    targetScore: number;
    pointsForIdeologyMismatch: number;
    playerDetails: PlayerMilitaryDetail[];
    infoToggle: Accessor<boolean>;
    setInfoToggle: Setter<boolean>;
}
export interface PlayerEconomicDetail {
    playerInfo: VictoryRowPlayer;
    playerColor: string;
    playerDimColor: string;
}
export interface PlayerScoreDetail {
    playerInfo: VictoryRowPlayer;
    playerColor: string;
    playerDimColor: string;
}
export interface AgeItem {
    name: string;
    description: string;
}
export interface AgeProps {
    items: Map<AgeType, AgeItem>;
    selectedValue: Accessor<AgeType>;
    setSelectedValue: (value: AgeType) => void;
}
export interface EconomicDetailChart {
    graphTarget: number;
    graphLines: LineGraphLine[];
    maxTurn: number;
}
export interface EconomicDetailProps {
    headerText: string;
    targetScore: number;
    playerDetails: PlayerEconomicDetail[];
    ageOptions: AgeProps;
    ageCharts: Map<AgeType, EconomicDetailChart>;
    currentGDP: number;
    infoToggle: Accessor<boolean>;
    setInfoToggle: Setter<boolean>;
    currentChart: EconomicDetailChart;
}
export interface ScoreDetailProps {
    headerText: string;
    targetScore: number;
    playerDetails: PlayerScoreDetail[];
}
export interface LeaderBoardEntry {
    id: number;
    name: string;
    place: number;
    points: number;
    turnsProgress: number;
    turnsTotal: number;
    dominant: boolean;
    hasMet: boolean;
    winner: boolean;
}
export interface PointGoalProps {
    class: string;
    pointGoal: number;
    goalPercent: number;
    leaderBoard: LeaderBoardEntry[];
    noDomination: boolean;
    tooltipInfo: VictoryTooltipProps;
    rules: string;
    titleText: string;
    titleColor: string;
    hasFocus: boolean;
}
export interface SpreadsheetItem {
    name: string;
    points: number;
    target: number;
    turn: number;
    age: AgeType;
    trackerType: VictoryTrackerType;
}
export interface SpreadsheetProps {
    header: string;
    playerId: number;
    isDominant: boolean;
    points: number;
    lastTurnDelta: number;
    countdownTurns: number;
    title: string;
    showTotal: boolean;
    metPlayer: boolean;
    items: SpreadsheetItem[];
    prereqs: SpreadsheetItem[];
}
export interface VictoryTooltipProps extends TooltipBaseProps {
    descTitle: string;
    description: string;
    currentVictoryName: string;
    currentVictoryMult: number;
    currentVictoryPercent: number;
    nextVictoryName: string;
    nextVictoryMult: number;
    nextVictoryPercent: number;
}
export interface ScienceDetailStarInfo {
    accumulatedPoints: number;
    pointsValue: number;
    description: string;
    age: string;
    ageName: string;
    turn: number;
}
export interface PlayerScienceDetail {
    playerInfo: VictoryRowPlayer;
    rocketColor: string;
    fadedRocketColor: string;
    barColor: string;
    velocity: number;
    countdownProgress: number;
    launchpadStatus: {
        status: LaunchpadStatus;
        tooltipHeader: string;
        tooltipText: string;
    };
    starInfo: ScienceDetailStarInfo[];
}
export interface ScienceDetailProps {
    headerText: string;
    targetScore: number;
    playerDetails: PlayerScienceDetail[];
    pointsSectionHeaders: number[];
    countdownDuration: number;
    shortestRemainingCountdownDuration: number;
    infoToggle: Accessor<boolean>;
    setInfoToggle: Setter<boolean>;
}
export interface VictoryRowPlayer {
    playerName: string;
    leaderName: string;
    playerId: number;
    playerBanner: string;
    govType: string;
    playerIsMet: boolean;
    playerAtWarWith: boolean;
    score: number;
    spreadsheet: SpreadsheetProps;
    highlighted: Accessor<boolean>;
    setHighlighted: Setter<boolean>;
    focused: Accessor<boolean>;
    setFocused: Setter<boolean>;
    dimScore: Accessor<boolean>;
    setDimScore: Setter<boolean>;
    scoreColor?: string;
}
export interface CulturePipList {
    age: AgeType;
    pips: CulturePointPip[];
}
export interface CulturePointPip {
    position: number;
    sources: CulturePointsSourceData[];
    age: AgeType;
    ageName: string;
    points: number;
    location: float2;
}
export interface CulturePointsSourceData {
    isWonder: boolean;
    iconSrc: string;
    points: number;
    position: number;
    age: AgeType;
    turn: number;
    isBig?: boolean;
    typeName: string;
    sourceName?: string;
    id: number;
    trackerType: VictoryTrackerType;
}
export interface GreatWorksData {
    pointsTotal: string;
    sources: {
        icon: string;
        points: number;
        typeName: string;
    }[];
}
export interface PlayerCultureDetails {
    playerInfo: VictoryRowPlayer;
    allCulturePips: CulturePipList[];
    greatWorksData: GreatWorksData;
    playerColor: string;
}
export interface CultureDetailProps {
    headerText: string;
    targetScore: number;
    playerDetails: PlayerCultureDetails[];
    ageOptions: AgeProps;
    infoToggle: Accessor<boolean>;
    setInfoToggle: Setter<boolean>;
    countdownDuration: number;
    currentAgeProgressPercentage: number;
    turnPercentages: number[];
    ref?: PropsRef<HTMLDivElement> | undefined;
}
export interface VictoryRulesTooltipProps {
    class: string;
    size?: number;
    onActivate?: () => void;
    titleText: string;
    titleClass: string;
    tooltipText: string;
    initialVPosition?: TooltipVerticalPosition;
    initialHPosition?: TooltipHorizontalPosition;
    disableFocus?: boolean | undefined;
}
export interface VictoriesScreenData {
    ornatePanelData: OrnateFrameProps;
    panels: SummaryVictoryProps[];
    militaryDetails: MilitaryDetailProps;
    economicDetails: EconomicDetailProps;
    scienceDetails: ScienceDetailProps;
    cultureDetails: CultureDetailProps;
    scoreDetails: ScoreDetailProps;
    defaultTab: string;
    currentTab: Accessor<string>;
    setCurrentTab: Setter<string>;
    lastFocusedPlayer: PlayerId;
    lastInspectedPlayer: PlayerId;
    isInspecting: boolean;
    isEndGame?: boolean;
    allowOneMoreTurn?: boolean;
    showNextTurnButton?: boolean;
}
export interface VictoryPlayerColors {
    primary: RGBA;
    dim: RGBA;
}
export interface VictoriesScreenContextModel {
    data: VictoriesScreenData;
    tooltipToggle: boolean;
    clickCloseButton: () => void;
    onGamepadInspectButton: () => void;
    onGamepadInfoButton: () => void;
    highlightPlayer: (player: PlayerId, tabType: VictoryTabType) => void;
    unHighlightPlayer: (player: PlayerId, tabType: VictoryTabType) => void;
    focusPlayer: (player: PlayerId, tabType: VictoryTabType) => void;
    unFocusPlayer: (player: PlayerId, tabType: VictoryTabType) => void;
    unFocusAllPlayers: (tabType: string) => void;
    tabChanged: (tabId: string) => boolean;
    tabNavStartup: (hotkeyContext: HotkeyContextProvider) => void;
    tabNavShutdown: (hotkeyContext: HotkeyContextProvider) => void;
}
export declare function createVictoriesScreenModel(isEndGame?: boolean, allowOneMoreTurn?: boolean, showNextTurnButton?: boolean): any;
export declare const VictoriesScreenModel: any;
export declare const VictoriesScreenContext: any;
export declare function useVictoriesScreenContext(): any;
