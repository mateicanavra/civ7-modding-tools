import type { ScreenMPChat } from "/core/ui/mp-chat/screen-mp-chat.js";
export declare enum NotificationType {
    PLAYER = "Player",
    ERROR = "Error",
    HELP = "Help"
}
export declare enum NotificationClassNames {
    PLAYER = "player-message",
    ERROR = "error-message",
    HELP = "help-message"
}
export default class ChatCommandManager {
    private chatComponent;
    private chatCommands;
    private chatCommandConfigs;
    constructor(component: ScreenMPChat);
    selectCommand(message: string): void;
    registerCommands(): void;
    private helpCommandHandler;
    private stylizeHelpListContent;
    private makeCommandList;
    private createCommandHelpLine;
    private joinPrompts;
    private privateMessageCommandHandler;
    private globalChatCommandHandler;
    private localTeamCommandHandler;
    private respondCommandHandler;
    unregisterCommands(): void;
    private registerChatCommand;
}
