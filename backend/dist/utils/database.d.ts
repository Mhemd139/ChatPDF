import { User, CreateUserData } from '../models/User';
import { PDF, CreatePDFData } from '../models/PDF';
import { Conversation, CreateConversationData, Message } from '../models/Chat';
declare class InMemoryDatabase {
    private users;
    private pdfs;
    private conversations;
    private messages;
    private dataFile;
    constructor();
    private createTestUser;
    createUser(userData: CreateUserData): Promise<User>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByGoogleId(googleId: string): Promise<User | null>;
    findUserById(id: string): Promise<User | null>;
    updateUserGoogleId(userId: string, googleId: string, avatar?: string): Promise<User | null>;
    createPDF(pdfData: CreatePDFData): Promise<PDF>;
    findPDFById(id: string): Promise<PDF | null>;
    findPDFsByUserId(userId: string): Promise<PDF[]>;
    findPDFsByUserEmail(email: string): Promise<PDF[]>;
    getAllPDFs(): Promise<PDF[]>;
    removePDF(id: string): Promise<boolean>;
    updatePDF(id: string, updates: Partial<PDF>): Promise<PDF | null>;
    createConversation(conversationData: CreateConversationData): Promise<Conversation>;
    findConversationById(id: string): Promise<Conversation | null>;
    findConversationsByUserId(userId: string): Promise<Conversation[]>;
    addMessage(conversationId: string, message: Omit<Message, 'id'>): Promise<Message>;
    getMessages(conversationId: string): Promise<Message[]>;
    private generateId;
    private saveData;
    private loadData;
}
export declare const db: InMemoryDatabase;
export {};
//# sourceMappingURL=database.d.ts.map