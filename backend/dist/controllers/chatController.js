"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAIConnection = exports.getConversationHistory = exports.sendMessage = void 0;
const aiService_1 = require("../services/aiService");
const database_1 = require("../utils/database");
const sendMessage = async (req, res) => {
    try {
        const body = req.body;
        const { message, pdfId, conversationHistory = [] } = body;
        const userId = req.userId;
        if (!message || !pdfId) {
            res.status(400).json({ error: 'Message and PDF ID are required' });
            return;
        }
        const pdf = await database_1.db.findPDFById(pdfId);
        if (!pdf) {
            res.status(404).json({ error: 'PDF not found' });
            return;
        }
        let conversation = await database_1.db.findConversationsByUserId(userId)
            .then(conversations => conversations.find(conv => conv.pdfId === pdfId));
        if (!conversation) {
            conversation = await database_1.db.createConversation({
                userId,
                pdfId,
                title: `Chat about ${pdf.originalName || pdf.name}`,
            });
        }
        const userMessage = await database_1.db.addMessage(conversation.id, {
            conversationId: conversation.id,
            content: message,
            role: 'user',
            timestamp: new Date(),
        });
        const storedMessages = await database_1.db.getMessages(conversation.id);
        const messages = [
            ...storedMessages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
            { role: 'user', content: message }
        ];
        const aiResponse = await aiService_1.AIService.generateResponse(messages, pdfId);
        const assistantMessage = await database_1.db.addMessage(conversation.id, {
            conversationId: conversation.id,
            content: aiResponse.content,
            role: 'assistant',
            timestamp: new Date(),
            sources: [],
        });
        const response = {
            success: true,
            data: {
                message: aiResponse.content,
                usage: aiResponse.usage,
                timestamp: new Date(),
                conversationId: conversation.id,
            }
        };
        res.json(response);
    }
    catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process message. Please try again.'
        });
    }
};
exports.sendMessage = sendMessage;
const getConversationHistory = async (req, res) => {
    try {
        const { pdfId } = req.params;
        const userId = req.userId;
        console.log('getConversationHistory called with:', { pdfId, userId });
        if (!pdfId) {
            res.status(400).json({ error: 'PDF ID is required' });
            return;
        }
        const pdf = await database_1.db.findPDFById(pdfId);
        console.log('Found PDF:', pdf);
        if (!pdf) {
            res.status(404).json({ error: 'PDF not found' });
            return;
        }
        const conversations = await database_1.db.findConversationsByUserId(userId);
        console.log('All conversations for user:', conversations);
        const conversation = conversations.find(conv => conv.pdfId === pdfId);
        console.log('Found conversation for PDF:', conversation);
        if (!conversation) {
            console.log('No conversation found, returning empty messages');
            res.json({
                success: true,
                data: {
                    messages: [],
                    conversationId: null,
                }
            });
            return;
        }
        const messages = await database_1.db.getMessages(conversation.id);
        console.log('Retrieved messages:', messages);
        const response = {
            success: true,
            data: {
                messages: messages.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    role: msg.role,
                    timestamp: msg.timestamp,
                    sources: msg.sources,
                })),
                conversationId: conversation.id,
            }
        };
        console.log('Sending response:', response);
        res.json(response);
    }
    catch (error) {
        console.error('Error in getConversationHistory:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve conversation history. Please try again.'
        });
    }
};
exports.getConversationHistory = getConversationHistory;
const testAIConnection = async (req, res) => {
    try {
        const isConnected = await aiService_1.AIService.testConnection();
        if (isConnected) {
            res.json({
                success: true,
                message: 'AI connection successful',
                data: { connected: true }
            });
        }
        else {
            res.status(500).json({
                success: false,
                error: 'AI connection failed',
                data: { connected: false }
            });
        }
    }
    catch (error) {
        console.error('Error testing AI connection:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to test AI connection',
            data: { connected: false }
        });
    }
};
exports.testAIConnection = testAIConnection;
//# sourceMappingURL=chatController.js.map