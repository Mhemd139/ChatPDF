import { Request, Response } from 'express';
import { AIService, ChatMessage } from '../services/aiService';
import { db } from '../utils/database';

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export interface SendMessageRequest {
  message: string;
  pdfId: string;
  conversationHistory?: ChatMessage[];
}

export const sendMessage = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body as SendMessageRequest;
    const { message, pdfId, conversationHistory = [] } = body;
    const userId = req.userId!;

    if (!message || !pdfId) {
      res.status(400).json({ error: 'Message and PDF ID are required' });
      return;
    }

    // Verify PDF exists and belongs to user
    const pdf = await db.findPDFById(pdfId);
    if (!pdf) {
      res.status(404).json({ error: 'PDF not found' });
      return;
    }

    // Prepare conversation history for AI
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Generate AI response
    const aiResponse = await AIService.generateResponse(messages, pdfId);

    // Create response object
    const response = {
      success: true,
      data: {
        message: aiResponse.content,
        usage: aiResponse.usage,
        timestamp: new Date(),
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process message. Please try again.' 
    });
  }
};

export const testAIConnection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const isConnected = await AIService.testConnection();
    
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'AI connection successful',
        data: { connected: true }
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'AI connection failed',
        data: { connected: false }
      });
    }
  } catch (error) {
    console.error('Error testing AI connection:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to test AI connection',
      data: { connected: false }
    });
  }
}; 