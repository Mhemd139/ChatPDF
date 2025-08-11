export interface PDFProcessingResult {
    text: string;
    pages: number;
    chunks: string[];
}
export declare class PDFProcessor {
    static processPDF(pdfId: string): Promise<PDFProcessingResult>;
    private static splitTextIntoChunks;
    static updatePDFStatus(pdfId: string, status: 'processing' | 'ready' | 'error', pages?: number, chunks?: string[]): Promise<void>;
}
//# sourceMappingURL=pdfProcessor.d.ts.map