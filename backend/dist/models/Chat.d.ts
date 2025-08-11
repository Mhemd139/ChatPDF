export interface Message {
    id: string;
    conversationId: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    sources?: Source[];
}
export interface Source {
    pageNumber: number;
    text: string;
    confidence: number;
}
export interface Conversation {
    id: string;
    userId: string;
    pdfId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateConversationData {
    userId: string;
    pdfId: string;
    title: string;
}
export interface ChatRequest {
    conversationId: string;
    message: string;
}
export interface ChatResponse {
    message: string;
    sources: Source[];
    conversationId: string;
}
//# sourceMappingURL=Chat.d.ts.map