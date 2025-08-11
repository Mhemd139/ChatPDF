export interface PDF {
  id: string;
  userId: string;
  name: string;
  originalName: string;
  size: number;
  pages: number;
  status: 'processing' | 'ready' | 'error';
  filePath?: string; // Optional for backward compatibility
  s3Key?: string; // S3 object key
  s3Url?: string; // S3 URL
  uploadedAt: Date;
  processedAt?: Date;
  error?: string;
  chunks?: string[];
}

export interface PDFChunk {
  id: string;
  pdfId: string;
  text: string;
  pageNumber: number;
  chunkIndex: number;
  embedding?: number[];
}

export interface CreatePDFData {
  userId: string;
  name: string;
  originalName: string;
  size: number;
  filePath?: string;
  s3Key?: string;
  s3Url?: string;
}

export interface PDFResponse {
  id: string;
  name: string;
  originalName: string;
  size: number;
  pages: number;
  status: string;
  uploadedAt: Date;
  processedAt?: Date;
} 