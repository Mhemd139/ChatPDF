# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for your ChatPDF application.

## Prerequisites

1. A Google Cloud Console account
2. Node.js and npm installed
3. Your ChatPDF project running

## Step 1: Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (if not already enabled)

## Step 2: Configure OAuth 2.0 Credentials

1. In the Google Cloud Console, go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add the following authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add the following authorized redirect URIs:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 3: Configure Environment Variables

### Backend (.env file in backend directory)

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Other existing variables...
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env.local file in frontend directory)

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Other existing variables...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

## Step 4: Install Dependencies

The required dependencies have already been installed:

### Backend
```bash
cd backend
npm install google-auth-library
```

### Frontend
```bash
cd frontend
npm install @react-oauth/google
```

## Step 5: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to `http://localhost:3000/login`
4. Click the "Continue with Google" button
5. Complete the Google OAuth flow

## Features Implemented

### Backend
- ✅ Google OAuth service with token verification
- ✅ User creation/update with Google ID
- ✅ JWT token generation for authenticated users
- ✅ Database support for Google OAuth users
- ✅ Error handling for invalid tokens

### Frontend
- ✅ Google OAuth provider wrapper
- ✅ Google Sign-In button component
- ✅ Integration with existing auth system
- ✅ Loading states and error handling
- ✅ Responsive design with dark mode support

## Security Features

1. **Token Verification**: Backend verifies Google ID tokens
2. **Email Verification**: Only verified Google emails are accepted
3. **JWT Tokens**: Secure session management
4. **Error Handling**: Comprehensive error messages
5. **CORS Protection**: Configured for your domains

## User Flow

1. User clicks "Continue with Google"
2. Google OAuth popup opens
3. User authenticates with Google
4. Frontend receives Google access token
5. Frontend sends token to backend
6. Backend verifies token with Google
7. Backend creates/updates user and generates JWT
8. Frontend stores JWT and user data
9. User is redirected to the main application

## Troubleshooting

### Common Issues

1. **"Invalid Google token"**
   - Check that your Google Client ID is correct
   - Ensure the domain is authorized in Google Console

2. **"Email not verified with Google"**
   - User must have a verified email address with Google

3. **CORS errors**
   - Check that your frontend domain is in the authorized origins

4. **"Google login failed"**
   - Check browser console for detailed error messages
   - Verify Google OAuth is properly configured

### Debug Steps

1. Check browser console for JavaScript errors
2. Check backend console for server errors
3. Verify environment variables are set correctly
4. Ensure Google Cloud Console configuration is correct

## Production Deployment

When deploying to production:

1. Update authorized origins in Google Cloud Console
2. Set production environment variables
3. Use HTTPS for all URLs
4. Configure proper CORS settings
5. Set secure JWT secrets

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the backend console for server logs
3. Verify all environment variables are set
4. Ensure Google Cloud Console configuration is correct 