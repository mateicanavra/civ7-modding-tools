export declare enum AdvisorRecommendations {
    NO_ADVISOR = "recommendation-none",
    CULTURAL = "recommendation-cultural",
    ECONOMIC = "recommendation-economic",
    MILITARY = "recommendation-military",
    SCIENTIFIC = "recommendation-scientific"
}
export declare namespace AdvisorUtilities {
    interface AdvisorClassObject {
        class: AdvisorRecommendations;
    }
    function createAdvisorRecommendationTooltip(elements: AdvisorRecommendations[]): any;
    /**
     * Helper function to create recommendation icons. Can be used from binding models or manually
     * @returns elements with respective icons or icons bind to a container
     */
    function createAdvisorRecommendation(elements: string, container: HTMLElement): void;
    function createAdvisorRecommendation(elements: AdvisorRecommendations[]): HTMLElement;
    /**
     * Helper function to get the icon CSS classes for advisor recommendation gems
     * @returns array with CSS classes for gems
     */
    function getBuildRecommendationIcons(recommendations: BuildRecommendation[], type: string): AdvisorClassObject[];
    /**
     * Helper function to get the icon CSS classes for advisor recommendation gems
     * @returns array with CSS classes for gems
     */
    function getTreeRecommendationIcons(recommendations: TreeRecommendation[], nodeType: ProgressionTreeNodeType): AdvisorClassObject[];
    const getTreeRecommendations: (subject: typeof AdvisorySubjectTypes.CHOOSE_TECH | typeof AdvisorySubjectTypes.CHOOSE_CULTURE) => TreeRecommendation[];
}
