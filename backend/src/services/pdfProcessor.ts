import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';
import { PDF } from '../models/PDF';
import { db } from '../utils/database';
import { s3Service } from './s3Service';

export interface PDFProcessingResult {
  text: string;
  pages: number;
  chunks: string[];
}

export class PDFProcessor {
  static async processPDF(pdfId: string): Promise<PDFProcessingResult> {
    try {
      console.log(`🔍 PDFProcessor: Starting to process PDF ${pdfId}...`);
      
      const pdfRecord = await db.findPDFById(pdfId);
      if (!pdfRecord) {
        throw new Error(`PDF record not found for ID: ${pdfId}`);
      }
      
      let dataBuffer: Buffer;
      
      // Check if we have S3 storage
      if (pdfRecord.s3Key) {
        console.log(`☁️ PDFProcessor: Processing S3 file with key: ${pdfRecord.s3Key}`);
        
        // Get signed URL for S3 file
        const signedUrl = await s3Service.getSignedDownloadUrl(pdfRecord.s3Key);
        console.log(`🔗 PDFProcessor: Generated signed URL for S3 file`);
        
        // Download file from S3
        try {
          const response = await fetch(signedUrl);
          if (!response.ok) {
            throw new Error(`Failed to download from S3: ${response.statusText}`);
          }
          dataBuffer = Buffer.from(await response.arrayBuffer());
          console.log(`📥 PDFProcessor: Downloaded file from S3, size: ${dataBuffer.length} bytes`);
        } catch (downloadError) {
          console.error(`❌ PDFProcessor: S3 download failed:`, downloadError);
          throw new Error(`Failed to download file from S3: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`);
        }
      } else if (pdfRecord.filePath) {
        // Fallback to local file (for backward compatibility)
        console.log(`📁 PDFProcessor: Processing local file: ${pdfRecord.filePath}`);
        
        // Normalize the file path to handle Windows backslashes
        const normalizedPath = path.normalize(pdfRecord.filePath);
        
        // Check if file exists using normalized path
        if (!fs.existsSync(normalizedPath)) {
          throw new Error(`PDF file not found at normalized path: ${normalizedPath}`);
        }
        
        // Read PDF file using normalized path
        dataBuffer = fs.readFileSync(normalizedPath);
        console.log(`📊 PDFProcessor: File read, size: ${dataBuffer.length} bytes`);
      } else {
        throw new Error(`No file path or S3 key found for PDF ${pdfId}`);
      }
      
      // Extract text from PDF
      console.log(`🔍 PDFProcessor: Extracting text from PDF...`);
      let data;
      try {
        data = await pdf(dataBuffer);
        console.log(`📝 PDFProcessor: Text extracted, length: ${data.text.length} characters, pages: ${data.numpages}`);
      } catch (parseError) {
        console.error(`❌ PDFProcessor: PDF parsing failed:`, parseError);
        throw new Error(`Failed to parse PDF: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
      
      // Split text into chunks for AI processing
      console.log(`✂️ PDFProcessor: Splitting text into chunks...`);
      const chunks = this.splitTextIntoChunks(data.text);
      console.log(`📦 PDFProcessor: Text split into ${chunks.length} chunks`);
      
      return {
        text: data.text,
        pages: data.numpages,
        chunks: chunks,
      };
    } catch (error) {
      console.error(`❌ PDFProcessor: Error processing PDF ${pdfId}:`, error);
      throw error;
    }
  }

  private static splitTextIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk += sentence + '. ';
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  static async updatePDFStatus(pdfId: string, status: 'processing' | 'ready' | 'error', pages?: number, chunks?: string[]): Promise<void> {
    try {
      console.log(`📝 PDFProcessor: Updating PDF ${pdfId} status to '${status}'${pages ? ` with ${pages} pages` : ''}${chunks ? ` and ${chunks.length} chunks` : ''}...`);
      await db.updatePDF(pdfId, {
        status,
        pages: pages || 0,
        processedAt: new Date(),
        chunks: chunks || [],
      });
      console.log(`✅ PDFProcessor: Successfully updated PDF ${pdfId} status to '${status}'`);
    } catch (error) {
      console.error(`❌ PDFProcessor: Failed to update PDF ${pdfId} status:`, error);
      throw error;
    }
  }
} 