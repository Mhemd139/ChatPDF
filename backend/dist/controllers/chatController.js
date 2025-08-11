"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAIConnection = exports.sendMessage = void 0;
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
        const messages = [
            ...conversationHistory,
            { role: 'user', content: message }
        ];
        const aiResponse = await aiService_1.AIService.generateResponse(messages, pdfId);
        const response = {
            success: true,
            data: {
                message: aiResponse.content,
                usage: aiResponse.usage,
                timestamp: new Date(),
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