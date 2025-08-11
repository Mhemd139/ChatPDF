"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pdfController_1 = require("../controllers/pdfController");
const auth_1 = require("../middleware/auth");
const env_1 = require("../config/env");
const database_1 = require("../utils/database");
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env_1.config.uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'pdf-' + uniqueSuffix + path_1.default.extname(file.originalname);
        console.log(`📁 Multer: Generated filename: ${filename}`);
        cb(null, filename);
    }
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        }
        else {
            cb(new Error('Only PDF files are allowed'));
        }
    },
    limits: {
        fileSize: env_1.config.maxFileSize
    }
});
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/upload', upload.single('pdf'), pdfController_1.uploadPDF);
router.get('/', pdfController_1.getPDFs);
router.get('/:id', pdfController_1.getPDF);
router.delete('/:id', pdfController_1.deletePDF);
router.post('/:id/process', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔧 Debug: Manually triggering PDF processing for ${id}`);
        const { processPDFInBackground } = require('../controllers/pdfController');
        processPDFInBackground(id).catch(error => {
            console.error(`❌ Debug: Failed to process PDF ${id}:`, error);
        });
        res.json({ message: `PDF processing triggered for ${id}` });
    }
    catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/reprocess-all', async (req, res) => {
    try {
        console.log(`🔧 Debug: Reprocessing all PDFs to store chunks...`);
        const { processPDFInBackground } = require('../controllers/pdfController');
        const userId = req.userId;
        const pdfs = await database_1.db.findPDFsByUserId(userId);
        console.log(`Found ${pdfs.length} PDFs to reprocess`);
        for (const pdf of pdfs) {
            if (pdf.status === 'ready') {
                console.log(`Reprocessing PDF ${pdf.id}: ${pdf.name}`);
                processPDFInBackground(pdf.id).catch(error => {
                    console.error(`❌ Failed to reprocess PDF ${pdf.id}:`, error);
                });
            }
        }
        res.json({ message: `Reprocessing ${pdfs.length} PDFs to store chunks` });
    }
    catch (error) {
        console.error('Reprocess all endpoint error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=pdf.js.map