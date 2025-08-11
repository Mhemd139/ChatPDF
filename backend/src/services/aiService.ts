import OpenAI from 'openai';
import { config } from '../config/env';
import { db } from '../utils/database';
import { PDFProcessor } from './pdfProcessor';

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

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

export class AIService {
  static async getPDFContext(pdfId: string, userQuestion: string): Promise<string> {
    try {
      const pdf = await db.findPDFById(pdfId);
      if (!pdf) {
        throw new Error('PDF not found');
      }

      // Check if we have stored chunks
      if (pdf.chunks && pdf.chunks.length > 0) {
        console.log(`PDF Context Debug: Using ${pdf.chunks.length} stored chunks for question: "${userQuestion}"`);
        
        // Enhanced keyword-based retrieval for technical content
        const relevantChunks = this.findRelevantChunks(pdf.chunks, userQuestion);
        
        console.log(`PDF Context Debug: Found ${relevantChunks.length} relevant chunks for question: "${userQuestion}"`);
        if (relevantChunks.length > 0) {
          console.log('First relevant chunk preview:', relevantChunks[0].substring(0, 200) + '...');
        }
        
        if (relevantChunks.length === 0) {
          // Fallback: provide more context for technical questions
          const fallbackChunks = pdf.chunks.slice(0, 5); // Provide more fallback chunks
          return `📚 **PDF Context for: ${pdf.name}** 📚

While I couldn't find specific content that directly answers your question, here's some general content from the PDF that might be relevant:

${fallbackChunks.join('\n\n')}

🔍 **What I'll do:** I'll analyze this content thoroughly to try to answer your question as best as I can! 💪`;
        }

        // Combine relevant chunks into context
        const context = relevantChunks.join('\n\n');
        return `📚 **Relevant Content from: ${pdf.name}** 📚

Here's the specific information I found that relates to your question:

${context}

🎯 **My task:** I'll use this information to give you a comprehensive, easy-to-understand answer! ✨`;
      }

      // Fallback: if no stored chunks, process the PDF (this shouldn't happen normally)
      console.log(`PDF Context Debug: No stored chunks found, falling back to processing PDF ${pdfId}`);
      const processingResult = await PDFProcessor.processPDF(pdfId);
      
      // Enhanced keyword-based retrieval for technical content
      const relevantChunks = this.findRelevantChunks(processingResult.chunks, userQuestion);
      
      console.log(`PDF Context Debug: Found ${relevantChunks.length} relevant chunks for question: "${userQuestion}"`);
      if (relevantChunks.length > 0) {
        console.log('First relevant chunk preview:', relevantChunks[0].substring(0, 200) + '...');
      }
      
      if (relevantChunks.length === 0) {
        // Fallback: provide more context for technical questions
        const fallbackChunks = processingResult.chunks.slice(0, 5); // Provide more fallback chunks
        return `📚 **PDF Context for: ${pdf.name}** 📚

While I couldn't find specific content that directly answers your question, here's some general content from the PDF that might be relevant:

${fallbackChunks.join('\n\n')}

🔍 **What I'll do:** I'll analyze this content thoroughly to try to answer your question as best as I can! 💪`;
      }

      // Combine relevant chunks into context
      const context = relevantChunks.join('\n\n');
      return `📚 **Relevant Content from: ${pdf.name}** 📚

Here's the specific information I found that relates to your question:

${context}

🎯 **My task:** I'll use this information to give you a comprehensive, easy-to-understand answer! ✨`;
    } catch (error) {
      console.error('Error getting PDF context:', error);
      return 'PDF context not available.';
    }
  }

  private static findRelevantChunks(chunks: string[], question: string): string[] {
    const questionLower = question.toLowerCase();
    const relevantChunks: Array<{ chunk: string; score: number }> = [];

    // Define technical terms and their variations
    const technicalTerms = {
      'atomic event': ['atomic event', 'atomic events', 'aev', 'aevi'],
      'threshold': ['threshold', 'threshold level', 'level'],
      'edge phase': ['edge phase', 'phase', 'edge'],
      'elapsed time': ['elapsed time', 'time', 'eti'],
      'quantization': ['quantization', 'quantized', 'quantize'],
      'accuracy': ['accuracy', 'accurate', 'error'],
      'mathematical': ['mathematical', 'equation', 'formula', 'definition'],
      'signal': ['signal', 'signals', 'sensor'],
      'processing': ['processing', 'processor', 'processing unit'],
      'energy': ['energy', 'power', 'consumption'],
      'microcontroller': ['microcontroller', 'mcu', 'processor'],
      'event': ['event', 'events', 'event-driven'],
      'sampling': ['sampling', 'sample', 'sampled'],
      'converter': ['converter', 'conversion', 's2e', 'adc'],
      'spi': ['spi', 'serial peripheral interface', 'peripheral interface'],
      'i2c': ['i2c', 'inter-integrated circuit', 'i squared c'],
      'communication': ['communication', 'protocol', 'interface', 'bus'],
      'hardware': ['hardware', 'component', 'device', 'circuit'],
      'sequaya': ['sequaya', 'seqaya', 'soil', 'irrigation', 'device'],
      'soil': ['soil', 'moisture', 'irrigation', 'agriculture'],
      'irrigation': ['irrigation', 'watering', 'moisture', 'soil']
    };

    for (const chunk of chunks) {
      const chunkLower = chunk.toLowerCase();
      let relevanceScore = 0;

      // Check for technical terms
      for (const [term, variations] of Object.entries(technicalTerms)) {
        for (const variation of variations) {
          if (chunkLower.includes(variation)) {
            relevanceScore += 2; // Higher weight for technical terms
            break;
          }
        }
      }

      // Check for question words (with lower weight)
      const questionWords = questionLower.split(/\s+/).filter(word => word.length > 2);
      for (const word of questionWords) {
        if (chunkLower.includes(word)) {
          relevanceScore += 1;
        }
      }

      // Check for mathematical symbols and equations
      if (chunkLower.includes('=') || chunkLower.includes('{') || chunkLower.includes('}') || 
          chunkLower.includes('⟨') || chunkLower.includes('⟩') || chunkLower.includes('Δ')) {
        relevanceScore += 3; // High weight for mathematical content
      }

      // Check for hardware/technical content
      if (chunkLower.includes('esp') || chunkLower.includes('microcontroller') || 
          chunkLower.includes('sensor') || chunkLower.includes('valve') || 
          chunkLower.includes('nfc') || chunkLower.includes('battery')) {
        relevanceScore += 2; // Weight for hardware components
      }

      // If chunk is relevant, add it
      if (relevanceScore > 0) {
        relevantChunks.push({ chunk, score: relevanceScore });
      }
    }

    // Sort by relevance score and return top chunks
    relevantChunks.sort((a, b) => b.score - a.score);
    return relevantChunks.slice(0, 5).map(item => item.chunk); // Return more chunks for technical questions
  }

  static async generateResponse(
    messages: ChatMessage[],
    pdfId: string
  ): Promise<ChatResponse> {
    try {
      // Get the user's latest question
      const userMessages = messages.filter(m => m.role === 'user');
      const latestQuestion = userMessages[userMessages.length - 1]?.content || '';
      
      // Get PDF context based on the user's question
      const pdfContext = await this.getPDFContext(pdfId, latestQuestion);
      
      // Create system message with PDF context
      const systemMessage: ChatMessage = {
        role: 'system',
        content: `You are a helpful AI assistant that gives comprehensive and detailed answers about PDF documents! 🚀

You have access to the following PDF context:

${pdfContext}

Your response style:
🎯 **Be thorough and helpful** - Provide complete answers with relevant details
📝 **Give comprehensive responses** - Include important context and explanations
💡 **Be educational** - Help users understand the content deeply
🔍 **Use examples when helpful** - Illustrate concepts with specific details
😊 **Use emojis sparingly** - 1-2 relevant emojis max, don't overdo it

Response guidelines:
1. **Answer the question completely** with all relevant details
2. **Provide context** when it helps understanding
3. **Use clear language** - explain technical terms when needed
4. **Be conversational and helpful** - like talking to a knowledgeable friend
5. **Include supporting information** from the PDF when relevant
6. **Stay focused** on the topic but be thorough

For technical questions:
- Give the complete answer with necessary details
- Explain key concepts if they help understanding
- Provide context from the PDF when relevant

Current conversation:`
      };

      // Prepare messages for OpenAI
      const openaiMessages = [
        systemMessage,
        ...messages
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: openaiMessages,
        temperature: 0.7,
        stream: false,
      });

      const response = completion.choices[0]?.message?.content || 'Sorry, I encountered an error. Please try again.';

      return {
        content: response,
        usage: completion.usage ? {
          prompt_tokens: completion.usage.prompt_tokens,
          completion_tokens: completion.usage.completion_tokens,
          total_tokens: completion.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Check for specific OpenAI errors
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 401) {
          return {
            content: 'OpenAI API key is invalid. Please check your configuration.',
          };
        } else if (error.status === 429) {
          return {
            content: 'OpenAI rate limit exceeded. Please try again in a moment.',
          };
        } else if (error.status === 402) {
          return {
            content: 'OpenAI quota exceeded. Please check your billing and plan details.',
          };
        }
      }
      
      return {
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
      };
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing OpenAI connection...');
      console.log('API Key available:', !!config.openaiApiKey);
      console.log('API Key length:', config.openaiApiKey?.length || 0);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      
      console.log('OpenAI test successful:', !!completion.choices[0]?.message?.content);
      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      
      // Check for specific OpenAI errors
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 402) {
          console.error('OpenAI quota exceeded. Please check billing.');
        } else if (error.status === 401) {
          console.error('OpenAI API key is invalid.');
        } else if (error.status === 429) {
          console.error('OpenAI rate limit exceeded.');
        }
      }
      
      return false;
    }
  }
} 