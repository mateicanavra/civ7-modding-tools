/**
 * This file contains constants that are used in the network utilities. Do not include any imports in this file.
 * @copyright 2025, Firaxis Games
 */
export declare const abandonStrToErrorBody: any;
export declare const abandonStrToErrorTitle: any;
export declare const gameListUpdateTypeToErrorBody: any;
export declare const lobbyErrorTypeToErrorBody: any;
export declare const joinGameErrorTypeToErrorBody: any;
export declare const serverTypeToGameModeType: any;
export declare const multiplayerTeamColors: string[];
/**
 * Values for the AccountLinkResult message.  These are mostly standard HTTP result codes, but some
 * values have different meanings (notably 400 and 409).
 */
export declare enum LoginResults {
    SUCCESS = 0,
    INCORRECT_USERNAME_PWD = 400,// normally "Bad Request"
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    ALREADY_LINKED = 409,// normally "Conflict"
    UNSUPPORTED_MEDIA = 415,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
    UNABLE_TO_LOGIN = 600
}
