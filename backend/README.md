# ChatPDF Backend

Backend API for ChatPDF - AI-powered PDF conversations with OpenAI and LangChain.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **PDF Upload & Management**: Secure file upload with validation and storage
- **AI Integration**: OpenAI API integration with LangChain for RAG
- **Vector Database**: Pinecone integration for embeddings storage
- **RESTful API**: Clean, documented API endpoints

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **PDF Processing**: pdf-parse
- **AI**: OpenAI API + LangChain
- **Vector DB**: Pinecone
- **Security**: Helmet, CORS

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Data models and interfaces
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── index.ts         # Main server file
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### PDF Management
- `POST /api/pdfs/upload` - Upload PDF (protected)
- `GET /api/pdfs` - Get user's PDFs (protected)
- `GET /api/pdfs/:id` - Get specific PDF (protected)
- `DELETE /api/pdfs/:id` - Delete PDF (protected)

### Health Check
- `GET /api/health` - Server health status

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Copy .env.example to .env and fill in your values
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=chatpdf-embeddings

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=your_aws_region (e.g., us-east-1)
AWS_S3_BUCKET=your_s3_bucket_name

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## AWS S3 Setup

### 1. Create S3 Bucket
1. Go to AWS S3 Console
2. Create a new bucket with a unique name
3. Choose your preferred region
4. Keep default settings for now

### 2. Configure Bucket Permissions
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PrivateAccess",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*",
            "Condition": {
                "StringNotEquals": {
                    "aws:PrincipalArn": "arn:aws:iam::your-account-id:user/your-iam-user"
                }
            }
        }
    ]
}
```

### 3. Create IAM User
1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the `AmazonS3FullAccess` policy (or create custom policy)
4. Save the Access Key ID and Secret Access Key

### 4. Environment Variables
Add your AWS credentials to the `.env` file:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## Development

The backend uses an in-memory database for development. In production, you should:

1. Replace the in-memory database with a real database (PostgreSQL, MongoDB)
2. Add proper error handling and logging
3. Implement rate limiting
4. Add comprehensive testing
5. Set up proper file storage (AWS S3, etc.)

## Next Steps

- [ ] Implement PDF text extraction and chunking
- [ ] Add OpenAI embeddings generation
- [ ] Integrate Pinecone vector database
- [ ] Implement chat functionality with RAG
- [ ] Add conversation management
- [ ] Implement real-time chat with WebSockets 