export declare class S3Service {
    private s3Client;
    private bucketName;
    constructor();
    uploadFile(file: Buffer, key: string, contentType?: string): Promise<string>;
    getSignedDownloadUrl(key: string, expiresIn?: number): Promise<string>;
    deleteFile(key: string): Promise<void>;
    fileExists(key: string): Promise<boolean>;
    generateS3Key(originalName: string, userId: string): string;
    getFileMetadata(key: string): Promise<{
        size: number;
        lastModified: Date;
    } | null>;
}
export declare const s3Service: S3Service;
//# sourceMappingURL=s3Service.d.ts.map