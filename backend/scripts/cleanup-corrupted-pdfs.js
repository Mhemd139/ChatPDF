#!/usr/bin/env node

/**
 * Cleanup Corrupted PDFs Script for ChatPDF
 * This script removes corrupted PDFs and resets their status
 */

require('dotenv').config();
const { db } = require('../dist/utils/database');

async function cleanupCorruptedPDFs() {
  try {
    console.log('🧹 Cleaning up corrupted PDFs...');
    
    // Get all PDFs with error status
    const allPDFs = await db.getAllPDFs();
    const errorPDFs = allPDFs.filter(pdf => pdf.status === 'error');
    
    console.log(`Found ${errorPDFs.length} PDFs with error status`);
    
    for (const pdf of errorPDFs) {
      console.log(`🗑️ Removing corrupted PDF: ${pdf.id} (${pdf.originalName})`);
      
      // Remove from database
      await db.removePDF(pdf.id);
      
      // Try to remove local file if it exists
      if (pdf.filePath) {
        try {
          const fs = require('fs');
          if (fs.existsSync(pdf.filePath)) {
            fs.unlinkSync(pdf.filePath);
            console.log(`   ✅ Local file removed: ${pdf.filePath}`);
          }
        } catch (fileError) {
          console.log(`   ⚠️ Could not remove local file: ${fileError.message}`);
        }
      }
    }
    
    console.log('✅ Cleanup completed successfully!');
    console.log(`Removed ${errorPDFs.length} corrupted PDFs`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

cleanupCorruptedPDFs();
