import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // OpenAI Configuration
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  
  // Pinecone Configuration
  pineconeApiKey: process.env.PINECONE_API_KEY || '',
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT || '',
  pineconeIndexName: process.env.PINECONE_INDEX_NAME || 'chatpdf-embeddings',
  
  // Google OAuth Configuration
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // AWS S3 Configuration
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  
  // File Upload Configuration
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}; 