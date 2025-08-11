#!/usr/bin/env node

/**
 * Check PDFs Script for ChatPDF
 * This script shows the status of all PDFs
 */

require('dotenv').config();
const { db } = require('../dist/utils/database');

async function checkPDFs() {
  try {
    console.log('📊 Checking PDF statuses...\n');
    
    const allPDFs = await db.getAllPDFs();
    
    console.log(`Total PDFs: ${allPDFs.length}\n`);
    
    const readyPDFs = allPDFs.filter(pdf => pdf.status === 'ready');
    const processingPDFs = allPDFs.filter(pdf => pdf.status === 'processing');
    const errorPDFs = allPDFs.filter(pdf => pdf.status === 'error');
    
    console.log(`✅ Ready: ${readyPDFs.length}`);
    readyPDFs.forEach(pdf => {
      console.log(`   - ${pdf.id}: ${pdf.originalName} (${pdf.pages} pages)`);
    });
    
    console.log(`\n🔄 Processing: ${processingPDFs.length}`);
    processingPDFs.forEach(pdf => {
      console.log(`   - ${pdf.id}: ${pdf.originalName}`);
    });
    
    console.log(`\n❌ Errors: ${errorPDFs.length}`);
    errorPDFs.forEach(pdf => {
      console.log(`   - ${pdf.id}: ${pdf.originalName}`);
    });
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkPDFs();
