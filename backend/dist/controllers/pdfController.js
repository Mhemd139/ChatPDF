"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePDF = exports.getPDF = exports.getPDFs = exports.uploadPDF = void 0;
exports.processPDFInBackground = processPDFInBackground;
const database_1 = require("../utils/database");
const env_1 = require("../config/env");
const pdfProcessor_1 = require("../services/pdfProcessor");
const s3Service_1 = require("../services/s3Service");
const fs_1 = __importDefault(require("fs"));
const uploadPDF = async (req, res) => {
    try {
        const userId = req.userId;
        if (!req.file) {
            res.status(400).json({ error: 'No PDF file uploaded' });
            return;
        }
        const { originalname, filename, size } = req.file;
        if (!originalname.toLowerCase().endsWith('.pdf')) {
            res.status(400).json({ error: 'Only PDF files are allowed' });
            return;
        }
        if (size > env_1.config.maxFileSize) {
            res.status(400).json({ error: 'File size exceeds maximum limit' });
            return;
        }
        console.log(`📁 Creating PDF record for user ${userId}, file: ${originalname}`);
        console.log(`📁 File details - filename: ${filename}, size: ${size}, path: ${req.file.path}`);
        const s3Key = s3Service_1.s3Service.generateS3Key(originalname, userId);
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        console.log(`☁️ Uploading file to S3 with key: ${s3Key}`);
        const s3Url = await s3Service_1.s3Service.uploadFile(fileBuffer, s3Key, 'application/pdf');
        console.log(`✅ File uploaded to S3: ${s3Url}`);
        const pdf = await database_1.db.createPDF({
            userId,
            name: filename,
            originalName: originalname,
            size,
            filePath: req.file.path,
            s3Key,
            s3Url,
        });
        console.log(`✅ PDF record created with ID: ${pdf.id}`);
        console.log(`📁 Stored S3 key in database: ${s3Key}`);
        try {
            fs_1.default.unlinkSync(req.file.path);
            console.log(`🗑️ Local file cleaned up: ${req.file.path}`);
        }
        catch (cleanupError) {
            console.warn(`⚠️ Failed to clean up local file: ${cleanupError}`);
        }
        console.log(`🚀 Starting background processing for PDF ${pdf.id}...`);
        processPDFInBackground(pdf.id).catch(error => {
            console.error(`❌ Failed to start PDF processing for ${pdf.id}:`, error);
        });
        const pdfResponse = {
            id: pdf.id,
            name: pdf.name,
            originalName: pdf.originalName,
            size: pdf.size,
            pages: pdf.pages,
            status: pdf.status,
            uploadedAt: pdf.uploadedAt,
        };
        res.status(201).json({
            success: true,
            message: 'PDF uploaded successfully',
            pdf: pdfResponse
        });
    }
    catch (error) {
        console.error('Upload PDF error:', error);
        if (req.file?.path && fs_1.default.existsSync(req.file.path)) {
            try {
                fs_1.default.unlinkSync(req.file.path);
                console.log(`🗑️ Cleaned up local file after upload failure: ${req.file.path}`);
            }
            catch (cleanupError) {
                console.warn(`⚠️ Failed to clean up local file after upload failure: ${cleanupError}`);
            }
        }
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        });
    }
};
exports.uploadPDF = uploadPDF;
async function processPDFInBackground(pdfId) {
    try {
        console.log(`🚀 Starting PDF processing for ${pdfId}...`);
        console.log(`📝 Updating PDF ${pdfId} status to 'processing'...`);
        await pdfProcessor_1.PDFProcessor.updatePDFStatus(pdfId, 'processing');
        console.log(`✅ PDF ${pdfId} status updated to 'processing'`);
        console.log(`🔍 Processing PDF content for ${pdfId}...`);
        const result = await pdfProcessor_1.PDFProcessor.processPDF(pdfId);
        console.log(`✅ PDF ${pdfId} content processed. Pages: ${result.pages}, Chunks: ${result.chunks.length}`);
        console.log(`📝 Updating PDF ${pdfId} status to 'ready' with ${result.pages} pages...`);
        await pdfProcessor_1.PDFProcessor.updatePDFStatus(pdfId, 'ready', result.pages, result.chunks);
        console.log(`🎉 PDF ${pdfId} status updated to 'ready' with ${result.pages} pages`);
    }
    catch (error) {
        console.error(`❌ Error processing PDF ${pdfId}:`, error);
        console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
        try {
            console.log(`⚠️ Attempting to update PDF ${pdfId} status to 'error'...`);
            await pdfProcessor_1.PDFProcessor.updatePDFStatus(pdfId, 'error');
            console.log(`✅ PDF ${pdfId} status updated to 'error'`);
        }
        catch (updateError) {
            console.error(`💥 Failed to update PDF ${pdfId} status to 'error':`, updateError);
        }
    }
}
const getPDFs = async (req, res) => {
    try {
        const userId = req.userId;
        const userEmail = req.userEmail;
        let pdfs = await database_1.db.findPDFsByUserId(userId);
        if (pdfs.length === 0 && userEmail) {
            pdfs = await database_1.db.findPDFsByUserEmail(userEmail);
            console.log(`Found ${pdfs.length} PDFs by email for user: ${userEmail}`);
            if (pdfs.length > 0) {
                for (const pdf of pdfs) {
                    await database_1.db.updatePDF(pdf.id, { userId: userId });
                }
                console.log(`Updated ${pdfs.length} PDFs to current user session`);
            }
        }
        const pdfResponses = pdfs.map(pdf => ({
            id: pdf.id,
            name: pdf.name,
            originalName: pdf.originalName,
            size: pdf.size,
            pages: pdf.pages,
            status: pdf.status,
            uploadedAt: pdf.uploadedAt,
            processedAt: pdf.processedAt,
        }));
        res.json({
            success: true,
            data: { pdfs: pdfResponses }
        });
    }
    catch (error) {
        console.error('Get PDFs error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getPDFs = getPDFs;
const getPDF = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const pdf = await database_1.db.findPDFById(id);
        if (!pdf) {
            res.status(404).json({
                success: false,
                error: 'PDF not found'
            });
            return;
        }
        if (pdf.userId !== userId) {
            res.status(403).json({
                success: false,
                error: 'Access denied'
            });
            return;
        }
        const pdfResponse = {
            id: pdf.id,
            name: pdf.name,
            originalName: pdf.originalName,
            size: pdf.size,
            pages: pdf.pages,
            status: pdf.status,
            uploadedAt: pdf.uploadedAt,
            processedAt: pdf.processedAt,
        };
        res.json({
            success: true,
            data: { pdf: pdfResponse }
        });
    }
    catch (error) {
        console.error('Get PDF error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.getPDF = getPDF;
const deletePDF = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        console.log(`🗑️ Delete PDF request: User ${userId} wants to delete PDF ${id}`);
        const pdf = await database_1.db.findPDFById(id);
        if (!pdf) {
            console.log(`❌ Delete PDF: PDF ${id} not found`);
            res.status(404).json({
                success: false,
                error: 'PDF not found'
            });
            return;
        }
        if (pdf.userId !== userId) {
            console.log(`❌ Delete PDF: Access denied for user ${userId} to PDF ${id} (owner: ${pdf.userId})`);
            res.status(403).json({
                success: false,
                error: 'Access denied'
            });
            return;
        }
        console.log(`✅ Delete PDF: User ${userId} authorized to delete PDF ${id}`);
        if (pdf.s3Key) {
            try {
                await s3Service_1.s3Service.deleteFile(pdf.s3Key);
                console.log(`🗑️ Deleted file from S3: ${pdf.s3Key}`);
            }
            catch (s3Error) {
                console.error('Error deleting file from S3:', s3Error);
            }
        }
        if (pdf.filePath && fs_1.default.existsSync(pdf.filePath)) {
            try {
                fs_1.default.unlinkSync(pdf.filePath);
                console.log(`🗑️ Deleted local file: ${pdf.filePath}`);
            }
            catch (localError) {
                console.error('Error deleting local file:', localError);
            }
        }
        const deleted = await database_1.db.removePDF(id);
        if (!deleted) {
            console.error(`❌ Delete PDF: Failed to remove PDF ${id} from database`);
            res.status(500).json({
                success: false,
                error: 'Failed to delete PDF from database'
            });
            return;
        }
        console.log(`✅ Delete PDF: Successfully deleted PDF ${id} from database`);
        res.json({
            success: true,
            message: 'PDF deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete PDF error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
exports.deletePDF = deletePDF;
//# sourceMappingURL=pdfController.js.map