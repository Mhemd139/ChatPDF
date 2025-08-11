import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
export declare const uploadPDF: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare function processPDFInBackground(pdfId: string): Promise<void>;
export declare const getPDFs: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPDF: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const deletePDF: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=pdfController.d.ts.map