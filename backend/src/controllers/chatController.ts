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

    // Find existing conversation for this PDF and user, or create a new one
    let conversation = await db.findConversationsByUserId(userId)
      .then(conversations => conversations.find(conv => conv.pdfId === pdfId));

    if (!conversation) {
      // Create new conversation
      conversation = await db.createConversation({
        userId,
        pdfId,
        title: `Chat about ${pdf.originalName || pdf.name}`,
      });
    }

    // Store user message
    const userMessage = await db.addMessage(conversation.id, {
      conversationId: conversation.id,
      content: message,
      role: 'user',
      timestamp: new Date(),
    });

    // Prepare conversation history for AI (get from database)
    const storedMessages = await db.getMessages(conversation.id);
    const messages: ChatMessage[] = [
      ...storedMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message }
    ];

    // Generate AI response
    const aiResponse = await AIService.generateResponse(messages, pdfId);

    // Store AI response
    const assistantMessage = await db.addMessage(conversation.id, {
      conversationId: conversation.id,
      content: aiResponse.content,
      role: 'assistant',
      timestamp: new Date(),
      sources: [], // Initialize with empty sources array since AI response doesn't provide them
    });

    // Create response object
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
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process message. Please try again.' 
    });
  }
};

export const getConversationHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { pdfId } = req.params;
    const userId = req.userId!;

    console.log('getConversationHistory called with:', { pdfId, userId });

    if (!pdfId) {
      res.status(400).json({ error: 'PDF ID is required' });
      return;
    }

    // Verify PDF exists and belongs to user
    const pdf = await db.findPDFById(pdfId);
    console.log('Found PDF:', pdf);
    
    if (!pdf) {
      res.status(404).json({ error: 'PDF not found' });
      return;
    }

    // Find conversation for this PDF and user
    const conversations = await db.findConversationsByUserId(userId);
    console.log('All conversations for user:', conversations);
    
    const conversation = conversations.find(conv => conv.pdfId === pdfId);
    console.log('Found conversation for PDF:', conversation);

    if (!conversation) {
      // No conversation exists yet, return empty array
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

    // Get messages for this conversation
    const messages = await db.getMessages(conversation.id);
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
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to retrieve conversation history. Please try again.' 
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