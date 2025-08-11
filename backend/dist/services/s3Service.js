"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Service = exports.S3Service = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const env_1 = require("../config/env");
class S3Service {
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: env_1.config.awsRegion,
            credentials: {
                accessKeyId: env_1.config.awsAccessKeyId,
                secretAccessKey: env_1.config.awsSecretAccessKey,
            },
        });
        this.bucketName = env_1.config.awsS3Bucket;
    }
    async uploadFile(file, key, contentType = 'application/pdf') {
        try {
            const command = new client_s3_1.PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file,
                ContentType: contentType,
                ACL: 'private',
            });
            await this.s3Client.send(command);
            return `https://${this.bucketName}.s3.${env_1.config.awsRegion}.amazonaws.com/${key}`;
        }
        catch (error) {
            console.error('S3 upload error:', error);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSignedDownloadUrl(key, expiresIn = 3600) {
        try {
            const command = new client_s3_1.GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            console.error('S3 signed URL generation error:', error);
            throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFile(key) {
        try {
            const command = new client_s3_1.DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        }
        catch (error) {
            console.error('S3 delete error:', error);
            throw new Error(`Failed to delete file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async fileExists(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
            return true;
        }
        catch (error) {
            if (error.name === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    generateS3Key(originalName, userId) {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const extension = originalName.split('.').pop();
        return `pdfs/${userId}/${timestamp}-${randomSuffix}.${extension}`;
    }
    async getFileMetadata(key) {
        try {
            const command = new client_s3_1.HeadObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            const response = await this.s3Client.send(command);
            return {
                size: response.ContentLength || 0,
                lastModified: response.LastModified || new Date(),
            };
        }
        catch (error) {
            console.error('S3 metadata retrieval error:', error);
            return null;
        }
    }
}
exports.S3Service = S3Service;
exports.s3Service = new S3Service();
//# sourceMappingURL=s3Service.js.map