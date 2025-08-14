# Railway Deployment Guide for ChatPDF

## Overview
This guide covers deploying your ChatPDF backend to Railway and configuring the necessary environment variables.

## Prerequisites
- Railway account (railway.app)
- All required API keys and services configured
- Frontend deployed (Vercel recommended)

## Step 1: Deploy Backend to Railway

1. **Connect your repository to Railway**
   - Go to railway.app
   - Create new project
   - Connect your GitHub repository
   - Select the `backend` directory as source

2. **Railway will automatically detect the configuration** from `backend/railway.json`

## Step 2: Configure Environment Variables

In your Railway backend service, set these environment variables:

### Required Variables

```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_here
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=sk-your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here
PINECONE_INDEX_NAME=chatpdf-embeddings

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Optional Variables

```bash
# Database Configuration (if using external database)
DATABASE_URL=your_database_connection_string

# Redis Configuration (if using Redis)
REDIS_URL=your_redis_connection_string
```

## Step 3: Update Frontend Environment Variables

In your frontend deployment (Vercel), set:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# API Configuration
NEXT_PUBLIC_API_URL=https://your-railway-service-name.railway.app/api

# Frontend Domain
NEXT_PUBLIC_FRONTEND_URL=https://your-frontend-domain.vercel.app

# Environment
NODE_ENV=production
```

## Step 4: Update Google OAuth Redirect URIs

1. Go to Google Cloud Console
2. Update your OAuth 2.0 client configuration
3. Add these redirect URIs:
   - `https://your-frontend-domain.vercel.app/auth/callback`
   - `https://your-railway-service-name.railway.app/auth/google/callback`

## Step 5: Deploy Frontend

1. Deploy your frontend to Vercel or your preferred platform
2. Ensure all environment variables are set
3. Update the `NEXT_PUBLIC_API_URL` to point to your Railway backend

## Step 6: Test Deployment

1. Test your Railway backend endpoint: `https://your-service-name.railway.app/health`
2. Test frontend-backend communication
3. Test OAuth flow
4. Test PDF upload and chat functionality

## Important Notes

- **Never commit real API keys** to your repository
- **Always use HTTPS** in production
- **Update CORS_ORIGIN** to match your actual frontend domain
- **Railway automatically provides HTTPS** for your backend
- **Environment variables are encrypted** in Railway

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure `CORS_ORIGIN` matches your frontend domain exactly
2. **OAuth redirect errors**: Check Google OAuth redirect URIs configuration
3. **API connection errors**: Verify `NEXT_PUBLIC_API_URL` in frontend
4. **File upload errors**: Check AWS S3 configuration and permissions

### Build and Runtime Issues

#### ✅ **Fixed: ts-node Permission Denied Error**
Your project has been updated to properly build TypeScript before running:

- **Build script**: `tsc` (compiles TypeScript to JavaScript)
- **Start script**: `node dist/index.js` (runs compiled JavaScript)
- **Railway command**: `npm run build && npm start`

#### **Previous Error (Now Fixed):**
```bash
sh: 1: ts-node: Permission denied
```

#### **Solution Applied:**
1. Moved `ts-node` and `typescript` to `devDependencies`
2. Added proper `build` script: `tsc`
3. Updated `start` script to use compiled JavaScript
4. Railway now builds TypeScript first, then runs the compiled code

### Railway Commands

```bash
# View logs
railway logs

# Check service status
railway status

# View environment variables
railway variables

# Restart service
railway service restart
```

## Security Best Practices

1. Use strong, unique JWT secrets
2. Rotate API keys regularly
3. Use environment-specific configurations
4. Enable Railway's built-in security features
5. Monitor your service logs for suspicious activity

## Cost Optimization

- Railway charges based on usage
- Consider using Railway's free tier for development
- Monitor your service usage in Railway dashboard
- Use appropriate instance sizes for your workload

