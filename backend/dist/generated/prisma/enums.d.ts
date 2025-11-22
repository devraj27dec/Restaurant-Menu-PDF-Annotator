export declare const FileStatus: {
    readonly uploaded: "uploaded";
    readonly annotated: "annotated";
    readonly extracted: "extracted";
};
export type FileStatus = (typeof FileStatus)[keyof typeof FileStatus];
export declare const AnnotationType: {
    readonly item: "item";
    readonly price: "price";
    readonly description: "description";
    readonly category: "category";
};
export type AnnotationType = (typeof AnnotationType)[keyof typeof AnnotationType];
//# sourceMappingURL=enums.d.ts.map