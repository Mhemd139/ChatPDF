import { Request, Response } from 'express';
import { ChatMessage } from '../services/aiService';
interface AuthenticatedRequest extends Request {
    userId?: string;
}
export interface SendMessageRequest {
    message: string;
    pdfId: string;
    conversationHistory?: ChatMessage[];
}
export declare const sendMessage: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const testAIConnection: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=chatController.d.ts.map