"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    pineconeApiKey: process.env.PINECONE_API_KEY || '',
    pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || '',
    pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'chatpdf-embeddings',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    awsRegion: process.env.AWS_REGION || 'us-east-1',
    awsS3Bucket: process.env.AWS_S3_BUCKET || '',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
//# sourceMappingURL=env.js.map