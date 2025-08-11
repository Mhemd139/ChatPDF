import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { db } from '../utils/database';
import { config } from '../config/env';
import { PDFProcessor } from '../services/pdfProcessor';
import { s3Service } from '../services/s3Service';
import path from 'path';
import fs from 'fs';

export const uploadPDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    
    if (!req.file) {
      res.status(400).json({ error: 'No PDF file uploaded' });
      return;
    }

    const { originalname, filename, size } = req.file;
    
    // Validate file type
    if (!originalname.toLowerCase().endsWith('.pdf')) {
      res.status(400).json({ error: 'Only PDF files are allowed' });
      return;
    }

    // Validate file size
    if (size > config.maxFileSize) {
      res.status(400).json({ error: 'File size exceeds maximum limit' });
      return;
    }

    console.log(`📁 Creating PDF record for user ${userId}, file: ${originalname}`);
    console.log(`📁 File details - filename: ${filename}, size: ${size}, path: ${req.file.path}`);

    // Generate S3 key
    const s3Key = s3Service.generateS3Key(originalname, userId);
    
    // Read file buffer for S3 upload
    const fileBuffer = fs.readFileSync(req.file.path);
    
    // Upload to S3
    console.log(`☁️ Uploading file to S3 with key: ${s3Key}`);
    const s3Url = await s3Service.uploadFile(fileBuffer, s3Key, 'application/pdf');
    console.log(`✅ File uploaded to S3: ${s3Url}`);

    // Create PDF record in database
    const pdf = await db.createPDF({
      userId,
      name: filename,
      originalName: originalname,
      size,
      filePath: req.file.path, // Keep for backward compatibility
      s3Key,
      s3Url,
    });

    console.log(`✅ PDF record created with ID: ${pdf.id}`);
    console.log(`📁 Stored S3 key in database: ${s3Key}`);

    // Clean up local file after S3 upload
    try {
      fs.unlinkSync(req.file.path);
      console.log(`🗑️ Local file cleaned up: ${req.file.path}`);
    } catch (cleanupError) {
      console.warn(`⚠️ Failed to clean up local file: ${cleanupError}`);
    }

    // Process PDF in background with proper error handling
    console.log(`🚀 Starting background processing for PDF ${pdf.id}...`);
    processPDFInBackground(pdf.id).catch(error => {
      console.error(`❌ Failed to start PDF processing for ${pdf.id}:`, error);
    });

    // Return PDF data
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
  } catch (error) {
    console.error('Upload PDF error:', error);
    
    // Clean up local file if S3 upload failed
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
        console.log(`🗑️ Cleaned up local file after upload failure: ${req.file.path}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to clean up local file after upload failure: ${cleanupError}`);
      }
    }
    
    res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed' 
    });
  }
};

// Helper function to process PDF in background
export async function processPDFInBackground(pdfId: string): Promise<void> {
  try {
    console.log(`🚀 Starting PDF processing for ${pdfId}...`);
    
    // Update status to processing
    console.log(`📝 Updating PDF ${pdfId} status to 'processing'...`);
    await PDFProcessor.updatePDFStatus(pdfId, 'processing');
    console.log(`✅ PDF ${pdfId} status updated to 'processing'`);
    
    // Process the PDF
    console.log(`🔍 Processing PDF content for ${pdfId}...`);
    const result = await PDFProcessor.processPDF(pdfId);
    console.log(`✅ PDF ${pdfId} content processed. Pages: ${result.pages}, Chunks: ${result.chunks.length}`);
    
    // Update status to ready with page count
    console.log(`📝 Updating PDF ${pdfId} status to 'ready' with ${result.pages} pages...`);
    await PDFProcessor.updatePDFStatus(pdfId, 'ready', result.pages, result.chunks);
    console.log(`🎉 PDF ${pdfId} status updated to 'ready' with ${result.pages} pages`);
    
  } catch (error) {
    console.error(`❌ Error processing PDF ${pdfId}:`, error);
    console.error(`❌ Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
    
    try {
      console.log(`⚠️ Attempting to update PDF ${pdfId} status to 'error'...`);
      await PDFProcessor.updatePDFStatus(pdfId, 'error');
      console.log(`✅ PDF ${pdfId} status updated to 'error'`);
    } catch (updateError) {
      console.error(`💥 Failed to update PDF ${pdfId} status to 'error':`, updateError);
    }
  }
}

export const getPDFs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const userEmail = req.userEmail; // We'll need to add this to the auth middleware
    
    // Try to get PDFs by user ID first
    let pdfs = await db.findPDFsByUserId(userId);
    
    // If no PDFs found, try to find by email (for persistent access)
    if (pdfs.length === 0 && userEmail) {
      pdfs = await db.findPDFsByUserEmail(userEmail);
      console.log(`Found ${pdfs.length} PDFs by email for user: ${userEmail}`);
      
      // If we found PDFs by email, update their userId to the current session for future access
      if (pdfs.length > 0) {
        for (const pdf of pdfs) {
          await db.updatePDF(pdf.id, { userId: userId });
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

    res.json({ pdfs: pdfResponses });
  } catch (error) {
    console.error('Get PDFs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const pdf = await db.findPDFById(id);
    if (!pdf) {
      res.status(404).json({ error: 'PDF not found' });
      return;
    }

    if (pdf.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
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

    res.json({ pdf: pdfResponse });
  } catch (error) {
    console.error('Get PDF error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePDF = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    console.log(`🗑️ Delete PDF request: User ${userId} wants to delete PDF ${id}`);

    const pdf = await db.findPDFById(id);
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

    // Delete from S3 if available
    if (pdf.s3Key) {
      try {
        await s3Service.deleteFile(pdf.s3Key);
        console.log(`🗑️ Deleted file from S3: ${pdf.s3Key}`);
      } catch (s3Error) {
        console.error('Error deleting file from S3:', s3Error);
        // Continue with local cleanup even if S3 delete fails
      }
    }

    // Delete local file if it exists (for backward compatibility)
    if (pdf.filePath && fs.existsSync(pdf.filePath)) {
      try {
        fs.unlinkSync(pdf.filePath);
        console.log(`🗑️ Deleted local file: ${pdf.filePath}`);
      } catch (localError) {
        console.error('Error deleting local file:', localError);
      }
    }

    // Delete from database
    const deleted = await db.removePDF(id);
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
  } catch (error) {
    console.error('Delete PDF error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}; 