#!/usr/bin/env node

/**
 * PDF Reprocessing Script for ChatPDF
 * This script reprocesses a PDF that failed due to S3 permission issues
 */

require('dotenv').config();
const { PDFProcessor } = require('../dist/services/pdfProcessor');

async function reprocessPDF(pdfId) {
  try {
    console.log(`🔄 Reprocessing PDF ${pdfId}...`);
    
    // Process the PDF
    const result = await PDFProcessor.processPDF(pdfId);
    console.log(`✅ PDF ${pdfId} reprocessed successfully!`);
    console.log(`   Pages: ${result.pages}`);
    console.log(`   Chunks: ${result.chunks.length}`);
    
    // Update status to ready
    await PDFProcessor.updatePDFStatus(pdfId, 'ready', result.pages, result.chunks);
    console.log(`🎉 PDF ${pdfId} status updated to 'ready'`);
    
  } catch (error) {
    console.error(`❌ Failed to reprocess PDF ${pdfId}:`, error.message);
  }
}

// Get PDF ID from command line argument
const pdfId = process.argv[2];

if (!pdfId) {
  console.error('❌ Please provide a PDF ID as an argument');
  console.error('Usage: node scripts/reprocess-pdf.js <pdf-id>');
  console.error('Example: node scripts/reprocess-pdf.js 6t5kl6vgo');
  process.exit(1);
}

reprocessPDF(pdfId);
