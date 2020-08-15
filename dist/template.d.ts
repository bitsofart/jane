declare type ContentOptionsFirstRun = {
    content: string;
    content_creator_url: string;
    content_creator_handle: string;
};
declare type ContentOptionsSecondRun = {
    style_creator_url: string;
    style_creator_handle: string;
};
declare type ContentOptions = ContentOptionsFirstRun | ContentOptionsSecondRun;
export declare function buildContent(templateContent: string, opts: ContentOptions, base64Encoded?: boolean): Promise<string>;
export declare function prepareContentFile(opts: ContentOptions, path?: string): Promise<string>;
export {};
