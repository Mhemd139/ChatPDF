"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PDFProcessor = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const database_1 = require("../utils/database");
const s3Service_1 = require("./s3Service");
class PDFProcessor {
    static async processPDF(pdfId) {
        try {
            console.log(`🔍 PDFProcessor: Starting to process PDF ${pdfId}...`);
            const pdfRecord = await database_1.db.findPDFById(pdfId);
            if (!pdfRecord) {
                throw new Error(`PDF record not found for ID: ${pdfId}`);
            }
            let dataBuffer;
            if (pdfRecord.s3Key) {
                console.log(`☁️ PDFProcessor: Processing S3 file with key: ${pdfRecord.s3Key}`);
                const signedUrl = await s3Service_1.s3Service.getSignedDownloadUrl(pdfRecord.s3Key);
                console.log(`🔗 PDFProcessor: Generated signed URL for S3 file`);
                try {
                    const response = await fetch(signedUrl);
                    if (!response.ok) {
                        throw new Error(`Failed to download from S3: ${response.statusText}`);
                    }
                    dataBuffer = Buffer.from(await response.arrayBuffer());
                    console.log(`📥 PDFProcessor: Downloaded file from S3, size: ${dataBuffer.length} bytes`);
                }
                catch (downloadError) {
                    console.error(`❌ PDFProcessor: S3 download failed:`, downloadError);
                    throw new Error(`Failed to download file from S3: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`);
                }
            }
            else if (pdfRecord.filePath) {
                console.log(`📁 PDFProcessor: Processing local file: ${pdfRecord.filePath}`);
                const normalizedPath = path_1.default.normalize(pdfRecord.filePath);
                if (!fs_1.default.existsSync(normalizedPath)) {
                    throw new Error(`PDF file not found at normalized path: ${normalizedPath}`);
                }
                dataBuffer = fs_1.default.readFileSync(normalizedPath);
                console.log(`📊 PDFProcessor: File read, size: ${dataBuffer.length} bytes`);
            }
            else {
                throw new Error(`No file path or S3 key found for PDF ${pdfId}`);
            }
            console.log(`🔍 PDFProcessor: Extracting text from PDF...`);
            let data;
            try {
                data = await (0, pdf_parse_1.default)(dataBuffer);
                console.log(`📝 PDFProcessor: Text extracted, length: ${data.text.length} characters, pages: ${data.numpages}`);
            }
            catch (parseError) {
                console.error(`❌ PDFProcessor: PDF parsing failed:`, parseError);
                throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
            }
            console.log(`✂️ PDFProcessor: Splitting text into chunks...`);
            const chunks = this.splitTextIntoChunks(data.text);
            console.log(`📦 PDFProcessor: Text split into ${chunks.length} chunks`);
            return {
                text: data.text,
                pages: data.numpages,
                chunks: chunks,
            };
        }
        catch (error) {
            console.error(`❌ PDFProcessor: Error processing PDF ${pdfId}:`, error);
            throw error;
        }
    }
    static splitTextIntoChunks(text, maxChunkSize = 1000) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const chunks = [];
        let currentChunk = '';
        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            }
            else {
                currentChunk += sentence + '. ';
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    }
    static async updatePDFStatus(pdfId, status, pages, chunks) {
        try {
            console.log(`📝 PDFProcessor: Updating PDF ${pdfId} status to '${status}'${pages ? ` with ${pages} pages` : ''}${chunks ? ` and ${chunks.length} chunks` : ''}...`);
            await database_1.db.updatePDF(pdfId, {
                status,
                pages: pages || 0,
                processedAt: new Date(),
                chunks: chunks || [],
            });
            console.log(`✅ PDFProcessor: Successfully updated PDF ${pdfId} status to '${status}'`);
        }
        catch (error) {
            console.error(`❌ PDFProcessor: Failed to update PDF ${pdfId} status:`, error);
            throw error;
        }
    }
}
exports.PDFProcessor = PDFProcessor;
//# sourceMappingURL=pdfProcessor.js.map