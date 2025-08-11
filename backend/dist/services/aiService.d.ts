export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}
export interface ChatResponse {
    content: string;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}
export declare class AIService {
    static getPDFContext(pdfId: string, userQuestion: string): Promise<string>;
    private static findRelevantChunks;
    static generateResponse(messages: ChatMessage[], pdfId: string): Promise<ChatResponse>;
    static testConnection(): Promise<boolean>;
}
//# sourceMappingURL=aiService.d.ts.map