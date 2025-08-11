import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadPDF, getPDFs, getPDF, deletePDF } from '../controllers/pdfController';
import { authenticateToken } from '../middleware/auth';
import { config } from '../config/env';
import { db } from '../utils/database';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Use forward slashes for consistency across platforms
    const filename = 'pdf-' + uniqueSuffix + path.extname(file.originalname);
    console.log(`📁 Multer: Generated filename: ${filename}`);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: config.maxFileSize
  }
});

const router = Router();

// All PDF routes require authentication
router.use(authenticateToken);

// PDF routes
router.post('/upload', upload.single('pdf'), uploadPDF);
router.get('/', getPDFs);
router.get('/:id', getPDF);
router.delete('/:id', deletePDF);

// Debug endpoint to manually trigger PDF processing
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔧 Debug: Manually triggering PDF processing for ${id}`);
    
    // Import the function from the controller
    const { processPDFInBackground } = require('../controllers/pdfController');
    
    // Start processing
    processPDFInBackground(id).catch(error => {
      console.error(`❌ Debug: Failed to process PDF ${id}:`, error);
    });
    
    res.json({ message: `PDF processing triggered for ${id}` });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to reprocess all PDFs to store chunks
router.post('/reprocess-all', async (req: any, res) => {
  try {
    console.log(`🔧 Debug: Reprocessing all PDFs to store chunks...`);
    
    // Import the function from the controller
    const { processPDFInBackground } = require('../controllers/pdfController');
    
    // Get all PDFs for the user
    const userId = req.userId!;
    const pdfs = await db.findPDFsByUserId(userId);
    
    console.log(`Found ${pdfs.length} PDFs to reprocess`);
    
    // Reprocess each PDF
    for (const pdf of pdfs) {
      if (pdf.status === 'ready') {
        console.log(`Reprocessing PDF ${pdf.id}: ${pdf.name}`);
        processPDFInBackground(pdf.id).catch(error => {
          console.error(`❌ Failed to reprocess PDF ${pdf.id}:`, error);
        });
      }
    }
    
    res.json({ message: `Reprocessing ${pdfs.length} PDFs to store chunks` });
  } catch (error) {
    console.error('Reprocess all endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 