"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
class InMemoryDatabase {
    constructor() {
        this.users = new Map();
        this.pdfs = new Map();
        this.conversations = new Map();
        this.messages = new Map();
        this.dataFile = './data.json';
        this.loadData();
        if (this.users.size === 0) {
            this.createTestUser();
        }
    }
    createTestUser() {
        const testUser = {
            id: 'test-user-id',
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed-password',
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(testUser.id, testUser);
    }
    async createUser(userData) {
        const user = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.users.set(user.id, user);
        this.saveData();
        return user;
    }
    async findUserByEmail(email) {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }
    async findUserByGoogleId(googleId) {
        for (const user of this.users.values()) {
            if (user.googleId === googleId) {
                return user;
            }
        }
        return null;
    }
    async findUserById(id) {
        return this.users.get(id) || null;
    }
    async updateUserGoogleId(userId, googleId, avatar) {
        const user = this.users.get(userId);
        if (!user)
            return null;
        const updatedUser = {
            ...user,
            googleId,
            avatar: avatar || user.avatar,
            updatedAt: new Date()
        };
        this.users.set(userId, updatedUser);
        return updatedUser;
    }
    async createPDF(pdfData) {
        const pdf = {
            id: this.generateId(),
            ...pdfData,
            pages: 0,
            status: 'processing',
            uploadedAt: new Date(),
        };
        this.pdfs.set(pdf.id, pdf);
        this.saveData();
        return pdf;
    }
    async findPDFById(id) {
        return this.pdfs.get(id) || null;
    }
    async findPDFsByUserId(userId) {
        return Array.from(this.pdfs.values()).filter(pdf => pdf.userId === userId);
    }
    async findPDFsByUserEmail(email) {
        const user = await this.findUserByEmail(email);
        if (!user)
            return [];
        return Array.from(this.pdfs.values()).filter(pdf => pdf.userId === user.id);
    }
    async getAllPDFs() {
        return Array.from(this.pdfs.values());
    }
    async removePDF(id) {
        const pdf = this.pdfs.get(id);
        if (!pdf)
            return false;
        this.pdfs.delete(id);
        this.saveData();
        return true;
    }
    async updatePDF(id, updates) {
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
        }
        catch (error) {
            console.error(`❌ Database: Error updating PDF ${id}:`, error);
            throw error;
        }
    }
    async createConversation(conversationData) {
        const conversation = {
            id: this.generateId(),
            ...conversationData,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.conversations.set(conversation.id, conversation);
        this.messages.set(conversation.id, []);
        return conversation;
    }
    async findConversationById(id) {
        return this.conversations.get(id) || null;
    }
    async findConversationsByUserId(userId) {
        return Array.from(this.conversations.values()).filter(conv => conv.userId === userId);
    }
    async addMessage(conversationId, message) {
        const newMessage = {
            id: this.generateId(),
            ...message,
        };
        const messages = this.messages.get(conversationId) || [];
        messages.push(newMessage);
        this.messages.set(conversationId, messages);
        const conversation = this.conversations.get(conversationId);
        if (conversation) {
            conversation.updatedAt = new Date();
        }
        return newMessage;
    }
    async getMessages(conversationId) {
        return this.messages.get(conversationId) || [];
    }
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    saveData() {
        try {
            const data = {
                users: Array.from(this.users.entries()),
                pdfs: Array.from(this.pdfs.entries()),
                conversations: Array.from(this.conversations.entries()),
                messages: Array.from(this.messages.entries()),
            };
            const fs = require('fs');
            fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Failed to save data to file:', error);
        }
    }
    loadData() {
        try {
            const fs = require('fs');
            if (fs.existsSync(this.dataFile)) {
                const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
                this.users = new Map((data.users || []).map(([id, user]) => [
                    id,
                    {
                        ...user,
                        createdAt: new Date(user.createdAt),
                        updatedAt: new Date(user.updatedAt),
                    }
                ]));
                this.pdfs = new Map((data.pdfs || []).map(([id, pdf]) => [
                    id,
                    {
                        ...pdf,
                        uploadedAt: new Date(pdf.uploadedAt),
                        processedAt: pdf.processedAt ? new Date(pdf.processedAt) : undefined,
                    }
                ]));
                this.conversations = new Map((data.conversations || []).map(([id, conv]) => [
                    id,
                    {
                        ...conv,
                        createdAt: new Date(conv.createdAt),
                        updatedAt: new Date(conv.updatedAt),
                    }
                ]));
                this.messages = new Map((data.messages || []).map(([id, msgs]) => [
                    id,
                    msgs.map(msg => ({
                        ...msg,
                        timestamp: new Date(msg.timestamp),
                    }))
                ]));
                console.log(`Loaded ${this.users.size} users, ${this.pdfs.size} PDFs from persistent storage`);
            }
        }
        catch (error) {
            console.error('Failed to load data from file:', error);
        }
    }
}
exports.db = new InMemoryDatabase();
//# sourceMappingURL=database.js.map