import { Router } from 'express';
import { sendMessage, testAIConnection, getConversationHistory } from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

// Send a message to AI
router.post('/send', sendMessage);

// Get conversation history for a PDF
router.get('/conversation/:pdfId', getConversationHistory);

// Test AI connection
router.get('/test-connection', testAIConnection);

export default router; 