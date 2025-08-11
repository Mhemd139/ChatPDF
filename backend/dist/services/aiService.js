"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIService = void 0;
const openai_1 = __importDefault(require("openai"));
const env_1 = require("../config/env");
const database_1 = require("../utils/database");
const pdfProcessor_1 = require("./pdfProcessor");
const openai = new openai_1.default({
    apiKey: env_1.config.openaiApiKey,
});
class AIService {
    static async getPDFContext(pdfId, userQuestion) {
        try {
            const pdf = await database_1.db.findPDFById(pdfId);
            if (!pdf) {
                throw new Error('PDF not found');
            }
            if (pdf.chunks && pdf.chunks.length > 0) {
                console.log(`PDF Context Debug: Using ${pdf.chunks.length} stored chunks for question: "${userQuestion}"`);
                const relevantChunks = this.findRelevantChunks(pdf.chunks, userQuestion);
                console.log(`PDF Context Debug: Found ${relevantChunks.length} relevant chunks for question: "${userQuestion}"`);
                if (relevantChunks.length > 0) {
                    console.log('First relevant chunk preview:', relevantChunks[0].substring(0, 200) + '...');
                }
                if (relevantChunks.length === 0) {
                    const fallbackChunks = pdf.chunks.slice(0, 5);
                    return `📚 **PDF Context for: ${pdf.name}** 📚

While I couldn't find specific content that directly answers your question, here's some general content from the PDF that might be relevant:

${fallbackChunks.join('\n\n')}

🔍 **What I'll do:** I'll analyze this content thoroughly to try to answer your question as best as I can! 💪`;
                }
                const context = relevantChunks.join('\n\n');
                return `📚 **Relevant Content from: ${pdf.name}** 📚

Here's the specific information I found that relates to your question:

${context}

🎯 **My task:** I'll use this information to give you a comprehensive, easy-to-understand answer! ✨`;
            }
            console.log(`PDF Context Debug: No stored chunks found, falling back to processing PDF ${pdfId}`);
            const processingResult = await pdfProcessor_1.PDFProcessor.processPDF(pdfId);
            const relevantChunks = this.findRelevantChunks(processingResult.chunks, userQuestion);
            console.log(`PDF Context Debug: Found ${relevantChunks.length} relevant chunks for question: "${userQuestion}"`);
            if (relevantChunks.length > 0) {
                console.log('First relevant chunk preview:', relevantChunks[0].substring(0, 200) + '...');
            }
            if (relevantChunks.length === 0) {
                const fallbackChunks = processingResult.chunks.slice(0, 5);
                return `📚 **PDF Context for: ${pdf.name}** 📚

While I couldn't find specific content that directly answers your question, here's some general content from the PDF that might be relevant:

${fallbackChunks.join('\n\n')}

🔍 **What I'll do:** I'll analyze this content thoroughly to try to answer your question as best as I can! 💪`;
            }
            const context = relevantChunks.join('\n\n');
            return `📚 **Relevant Content from: ${pdf.name}** 📚

Here's the specific information I found that relates to your question:

${context}

🎯 **My task:** I'll use this information to give you a comprehensive, easy-to-understand answer! ✨`;
        }
        catch (error) {
            console.error('Error getting PDF context:', error);
            return 'PDF context not available.';
        }
    }
    static findRelevantChunks(chunks, question) {
        const questionLower = question.toLowerCase();
        const relevantChunks = [];
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
            for (const [term, variations] of Object.entries(technicalTerms)) {
                for (const variation of variations) {
                    if (chunkLower.includes(variation)) {
                        relevanceScore += 2;
                        break;
                    }
                }
            }
            const questionWords = questionLower.split(/\s+/).filter(word => word.length > 2);
            for (const word of questionWords) {
                if (chunkLower.includes(word)) {
                    relevanceScore += 1;
                }
            }
            if (chunkLower.includes('=') || chunkLower.includes('{') || chunkLower.includes('}') ||
                chunkLower.includes('⟨') || chunkLower.includes('⟩') || chunkLower.includes('Δ')) {
                relevanceScore += 3;
            }
            if (chunkLower.includes('esp') || chunkLower.includes('microcontroller') ||
                chunkLower.includes('sensor') || chunkLower.includes('valve') ||
                chunkLower.includes('nfc') || chunkLower.includes('battery')) {
                relevanceScore += 2;
            }
            if (relevanceScore > 0) {
                relevantChunks.push({ chunk, score: relevanceScore });
            }
        }
        relevantChunks.sort((a, b) => b.score - a.score);
        return relevantChunks.slice(0, 5).map(item => item.chunk);
    }
    static async generateResponse(messages, pdfId) {
        try {
            const userMessages = messages.filter(m => m.role === 'user');
            const latestQuestion = userMessages[userMessages.length - 1]?.content || '';
            const pdfContext = await this.getPDFContext(pdfId, latestQuestion);
            const systemMessage = {
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
        }
        catch (error) {
            console.error('Error generating AI response:', error);
            if (error && typeof error === 'object' && 'status' in error) {
                if (error.status === 401) {
                    return {
                        content: 'OpenAI API key is invalid. Please check your configuration.',
                    };
                }
                else if (error.status === 429) {
                    return {
                        content: 'OpenAI rate limit exceeded. Please try again in a moment.',
                    };
                }
                else if (error.status === 402) {
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
    static async testConnection() {
        try {
            console.log('Testing OpenAI connection...');
            console.log('API Key available:', !!env_1.config.openaiApiKey);
            console.log('API Key length:', env_1.config.openaiApiKey?.length || 0);
            const completion = await openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 10,
            });
            console.log('OpenAI test successful:', !!completion.choices[0]?.message?.content);
            return !!completion.choices[0]?.message?.content;
        }
        catch (error) {
            console.error('OpenAI connection test failed:', error);
            if (error && typeof error === 'object' && 'status' in error) {
                if (error.status === 402) {
                    console.error('OpenAI quota exceeded. Please check billing.');
                }
                else if (error.status === 401) {
                    console.error('OpenAI API key is invalid.');
                }
                else if (error.status === 429) {
                    console.error('OpenAI rate limit exceeded.');
                }
            }
            return false;
        }
    }
}
exports.AIService = AIService;
//# sourceMappingURL=aiService.js.map