import { User, CreateUserData } from '../models/User';
import { PDF, CreatePDFData } from '../models/PDF';
import { Conversation, CreateConversationData, Message } from '../models/Chat';

// In-memory storage for development with file persistence
// In production, this would be replaced with a real database
class InMemoryDatabase {
  private users: Map<string, User> = new Map();
  private pdfs: Map<string, PDF> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private dataFile = './data.json';

  constructor() {
    // Load existing data from file
    this.loadData();
    
    // Create a test user for development if none exists
    if (this.users.size === 0) {
      this.createTestUser();
    }
  }

  private createTestUser() {
    const testUser: User = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed-password',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(testUser.id, testUser);
  }

  // User methods
  async createUser(userData: CreateUserData): Promise<User> {
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, user);
    this.saveData();
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.googleId === googleId) {
        return user;
      }
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async updateUserGoogleId(userId: string, googleId: string, avatar?: string): Promise<User | null> {
    const user = this.users.get(userId);
    if (!user) return null;
    
    const updatedUser = { 
      ...user, 
      googleId, 
      avatar: avatar || user.avatar,
      updatedAt: new Date() 
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // PDF methods
  async createPDF(pdfData: CreatePDFData): Promise<PDF> {
    const pdf: PDF = {
      id: this.generateId(),
      ...pdfData,
      pages: 0, // Will be updated after processing
      status: 'processing',
      uploadedAt: new Date(),
    };
    this.pdfs.set(pdf.id, pdf);
    this.saveData();
    return pdf;
  }

  async findPDFById(id: string): Promise<PDF | null> {
    return this.pdfs.get(id) || null;
  }

  async findPDFsByUserId(userId: string): Promise<PDF[]> {
    return Array.from(this.pdfs.values()).filter(pdf => pdf.userId === userId);
  }

  async findPDFsByUserEmail(email: string): Promise<PDF[]> {
    // Find user by email first, then get their PDFs
    const user = await this.findUserByEmail(email);
    if (!user) return [];
    return Array.from(this.pdfs.values()).filter(pdf => pdf.userId === user.id);
  }

  async getAllPDFs(): Promise<PDF[]> {
    return Array.from(this.pdfs.values());
  }

  async removePDF(id: string): Promise<boolean> {
    const pdf = this.pdfs.get(id);
    if (!pdf) return false;
    
    this.pdfs.delete(id);
    this.saveData();
    return true;
  }

  async updatePDF(id: string, updates: Partial<PDF>): Promise<PDF | null> {
    try {
      console.log(`🗄️ Database: Updating PDF ${id} with:`, updates);
      
      const pdf = this.pdfs.get(id);
      if (!pdf) {
        console.log(`❌ Database: PDF ${id} not found for update`);
        return null;
      }
      
      const updatedPDF = { ...pdf, ...updates, updatedAt: new Date() };
      this.pdfs.set(id, updatedPDF);
      this.saveData();
      
      console.log(`✅ Database: Successfully updated PDF ${id}, new status: ${updatedPDF.status}`);
      return updatedPDF;
    } catch (error) {
      console.error(`❌ Database: Error updating PDF ${id}:`, error);
      throw error;
    }
  }

  // Conversation methods
  async createConversation(conversationData: CreateConversationData): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateId(),
      ...conversationData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, []);
    return conversation;
  }

  async findConversationById(id: string): Promise<Conversation | null> {
    return this.conversations.get(id) || null;
  }

  async findConversationsByUserId(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
  }

  // Message methods
  async addMessage(conversationId: string, message: Omit<Message, 'id'>): Promise<Message> {
    const newMessage: Message = {
      id: this.generateId(),
      ...message,
    };
    
    const messages = this.messages.get(conversationId) || [];
    messages.push(newMessage);
    this.messages.set(conversationId, messages);
    
    // Update conversation timestamp
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.updatedAt = new Date();
    }
    
    return newMessage;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return this.messages.get(conversationId) || [];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private saveData(): void {
    try {
      const data = {
        users: Array.from(this.users.entries()),
        pdfs: Array.from(this.pdfs.entries()),
        conversations: Array.from(this.conversations.entries()),
        messages: Array.from(this.messages.entries()),
      };
      
      const fs = require('fs');
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save data to file:', error);
    }
  }

  private loadData(): void {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        
        // Restore data from file with proper Date conversion
        this.users = new Map(
          (data.users || []).map(([id, user]: [string, any]) => [
            id,
            {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            }
          ])
        );
        
        this.pdfs = new Map(
          (data.pdfs || []).map(([id, pdf]: [string, any]) => [
            id,
            {
              ...pdf,
              uploadedAt: new Date(pdf.uploadedAt),
              processedAt: pdf.processedAt ? new Date(pdf.processedAt) : undefined,
            }
          ])
        );
        
        this.conversations = new Map(
          (data.conversations || []).map(([id, conv]: [string, any]) => [
            id,
            {
              ...conv,
              createdAt: new Date(conv.createdAt),
              updatedAt: new Date(conv.updatedAt),
            }
          ])
        );
        
        this.messages = new Map(
          (data.messages || []).map(([id, msgs]: [string, any[]]) => [
            id,
            msgs.map(msg => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }))
          ])
        );
        
        console.log(`Loaded ${this.users.size} users, ${this.pdfs.size} PDFs from persistent storage`);
      }
    } catch (error) {
      console.error('Failed to load data from file:', error);
    }
  }
}

export const db = new InMemoryDatabase(); 