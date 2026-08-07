export declare function asyncLoad(url: string): Promise<string>;
/**
 * Generates a solid resource for an asynchronously loaded JSON file
 * @param filename The JSON file to load
 * @returns A resource containing the json when loaded
 */
export declare function createJsonResource<T>(filename: string): any;
