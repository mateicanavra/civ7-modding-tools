/**
 * model-civilopedia.ts
 * @copyright 2024, Firaxis Games
 * @description Data model for the Civilopedia
 */
export interface Page {
    sectionID: string;
    pageID: string;
}
export declare enum DetailsType {
    Section = 0,
    PageGroup = 1,
    Page = 2
}
export interface PageGroupDetails {
    detailsType: DetailsType.PageGroup;
    sectionID: string;
    pageGroupID: string;
    nameKey: string;
    tabText: string;
    visibleIfEmpty: boolean;
    sortIndex: number;
    collapsed: boolean;
}
export interface PageDetails {
    detailsType: DetailsType.Page;
    sectionID: string;
    pageID: string;
    nameKey: string;
    tabText: string;
    titleText: string | null;
    subTitleText: string | null;
    pageGroupID: string | null;
    pageLayoutID: string;
    sortIndex: number;
    textKeyPrefix: string | null;
}
export interface SectionDetails {
    detailsType: DetailsType.Section;
    sectionID: string;
    nameKey: string;
    tabText: string | null;
    icon?: string;
    sortIndex: number;
}
export interface ChapterParagraph {
    textKey: string;
    sortIndex: number;
}
export interface ChapterOverrideDetails {
    headerKey: string | null;
    body: ChapterParagraph[];
}
export interface ChapterDetails {
    chapterID: string;
    pageLayoutID: string;
    headerKey: string | null;
    sortIndex: number;
}
export interface CivilopediaSearchResult {
    page: Page;
    details?: SearchResult;
}
declare class Civilopedia {
    private _NavigatePageEvent;
    private _History;
    private _HomePage;
    private _CurrentPage;
    private _CurrentHistoryIndex;
    private _MaxHistoricEntries;
    private _isOpen;
    private sections;
    private chapterOverrides;
    private chapterBodyQueries;
    private chaptersByLayout;
    private pageGroupsBySection;
    private pagesBySection;
    private pagesByUUID;
    private civilopediaHotkeyListener;
    constructor();
    set isOpen(value: boolean);
    get isOpen(): boolean;
    /**
     * The intro/home page of the pedia.
     */
    get homePage(): Page;
    /**
     * The current page the user is viewing.
     */
    get currentPage(): Page;
    /**
     * This value represents the index into the history array that the current page is at.
     * 0 = The most recent page.
     */
    get currentHistoryIndex(): number;
    /**
     * The list of pages visited by the user in chronological order.
     */
    get history(): Page[];
    get maxHistoricEntries(): number;
    set maxHistoricEntries(value: number);
    /**
     * Returns true if the user can navigate forward in the history.
     */
    canNavigateForward(): boolean;
    /**
     * Returns false if the user can navigate backwards in the history.
     */
    canNavigateBackwards(): boolean;
    /**
     * Purges all history.
     */
    clearHistory(): void;
    /**
     * Reduces the history to the `maxItems` recent items.
     * @param maxItems The maximum items to include in the history.
     */
    truncateHistory(maxItems: number): void;
    /**
     * Navigates to the front/home page of the pedia.
     */
    navigateHome(): void;
    /**
     * Navigates back in the history.
     * Returns false if page no longer exists or there is no further pages in the history.
     */
    navigateBack(numPagesBack?: number): boolean;
    /**
     * Navigate forward in the history.
     * Returns false if page no longer exists or there is no further pages in the history.
     */
    navigateForward(numPagesForward?: number): boolean;
    /**
     * Navigate to the desired page.
     */
    navigateTo(page: Page): boolean;
    /**
     * Navigate to the page we were on when we closed the civilopedia
     */
    navigateToLastPageInHistory(): boolean;
    /**
     * Perform a search with the given term.
     * @param term The term(s) to search for.
     * @returns The results from the search, which can then be fed into `navigateTo`.
     */
    search(term: string, maxResults?: number): CivilopediaSearchResult[];
    get onNavigatePage(): ILiteEvent<Page>;
    /**
     * Perform the actual navigation.
     * @param page The page to navigate to.
     * @returns True if navigated to a new page.
     */
    private doNavigate;
    /**
     * Returns left-to-right list of sections w/ information.
     */
    getSections(): SectionDetails[];
    /**
     * Returns top - to - bottom list of pages including groups
     * @param sectionID
     * @returns
     */
    getPages(sectionID: string): PageDetails[] | null;
    /**
     * Returns the first page structure with the specified section id and page id.
     * @param sectionID
     * @param pageID
     * @returns
     */
    getPage(sectionID: string, pageID: string): PageDetails | null;
    /**
     * Returns the page groups in top-to-bottom order.
     * @param sectionID
     * @returns
     */
    getPageGroups(sectionID: string): PageGroupDetails[] | null;
    /**
     * Returns the first page group structure with the specified section id and page group id.
     * @param sectionID
     * @param pageGroupID
     * @returns
     */
    getPageGroup(sectionID: string, pageGroupID: string): PageGroupDetails | null;
    /**
     * Returns a list of ChapterIds pre - sorted.
     * @param pageLayoutID
     * @returns
     */
    getPageChapters(pageLayoutID: string): ChapterDetails[] | null;
    /**
     * Returns a single text key representing the heading of the chapter.
     * @param sectionID
     * @param pageID
     * @param chapterID
     * @returns
     */
    getChapterHeader(sectionID: string, pageID: string, chapterID: string): string | null;
    /**
     * Returns a list of text keys representing separate paragraphs of a chapter.
     * @param sectionID
     * @param pageID
     * @param chapterID
     * @returns
     */
    getChapterBody(sectionID: string, pageID: string, chapterID: string, pageLayoutID: string): string[] | null;
    /**
     * Returns the first found text key that conforms to the section search patterns.
     * @param sectionID
     * @param tag
     */
    findSectionTextKey(sectionID: string, tag: string): string | null;
    /**
     * Returns the first found text key that conforms to the page search patterns.
     * @param sectionID
     * @param pageID
     * @param tag
     */
    findPageTextKey(sectionID: string, pageID: string, tag: string): string | null;
    /**
     * Returns the first found text key that conforms to the chapter search patterns
     * @param sectionID
     * @param pageID
     * @param chapterID
     * @param tag
     * @returns
     */
    findChapterTextKey(sectionID: string, pageID: string, chapterID: string, tag: string): string | null;
    private initialize;
    /**
     * Indexes cached data into a search database.
     */
    private populateSearchData;
    private onCivilopediaHotkey;
}
export declare const instance: Civilopedia;
export {};
