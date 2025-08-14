# Vercel Deployment Guide for ChatPDF

This guide will walk you through deploying your ChatPDF frontend to Vercel, the recommended hosting platform for Next.js applications.

## Prerequisites

- [Vercel account](https://vercel.com/signup) (free tier available)
- [Git](https://git-scm.com/) installed on your machine
- Your ChatPDF project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Security Note ⚠️

**Environment Variables**: Never commit sensitive information like API keys, database credentials, or OAuth secrets to your Git repository. These should be added securely through the Vercel dashboard during deployment.

## Step 1: Prepare Your Project

### 1.1 Environment Variables Setup

**IMPORTANT: Never commit environment variables to Git!**

#### For Local Development:
Create a `.env.local` file in your `frontend/` directory (this file is already in .gitignore):

```bash
# frontend/.env.local (for local development only)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

#### For Production:
You'll add these in the Vercel dashboard during deployment (see Step 2.4):
```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
NEXT_PUBLIC_API_URL=https://your-backend-service-name.railway.app/api
NEXT_PUBLIC_FRONTEND_URL=https://your-project-name.vercel.app
NODE_ENV=production
```

### 1.2 Update Google OAuth Redirect URIs
In your [Google Cloud Console](https://console.cloud.google.com/):
1. Go to APIs & Services > Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel domain to Authorized redirect URIs:
   - `https://your-project-name.vercel.app/api/auth/callback/google`
   - `https://your-project-name.vercel.app/auth/callback/google`

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git repository**
   ```bash
   cd frontend
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your Git repository
   - Select the repository containing your ChatPDF project

3. **Configure Project Settings**
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `frontend` (since your Next.js app is in the frontend folder)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   Add these in the Vercel dashboard:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_google_client_id
   NEXT_PUBLIC_API_URL=https://your-backend-service-name.railway.app/api
   NEXT_PUBLIC_FRONTEND_URL=https://your-project-name.vercel.app
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (usually 2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from frontend directory**
   ```bash
   cd frontend
   vercel
   ```

4. **Follow the prompts**
   - Link to existing project or create new
   - Set root directory to current directory
   - Confirm build settings

## Step 3: Post-Deployment Configuration

### 3.1 Update Google OAuth Redirect URIs
After deployment, update your Google OAuth redirect URIs with the actual Vercel domain:
- `https://your-actual-project-name.vercel.app/api/auth/callback/google`
- `https://your-actual-project-name.vercel.app/auth/callback/google`

### 3.2 Update Environment Variables
In Vercel dashboard, update `NEXT_PUBLIC_FRONTEND_URL` with your actual domain:
```
NEXT_PUBLIC_FRONTEND_URL=https://your-actual-project-name.vercel.app
```

### 3.3 Redeploy
After updating environment variables, redeploy your project:
- Go to Vercel dashboard
- Click "Redeploy" on your project

## Step 4: Custom Domain (Optional)

1. **Add Custom Domain**
   - In Vercel dashboard, go to your project
   - Click "Settings" > "Domains"
   - Add your custom domain

2. **Update DNS Records**
   - Add CNAME record pointing to `cname.vercel-dns.com`
   - Or A record pointing to Vercel's IP addresses

3. **Update Environment Variables**
   - Update `NEXT_PUBLIC_FRONTEND_URL` with your custom domain
   - Redeploy the project

## Step 5: Verify Deployment

1. **Check Build Logs**
   - Ensure build completed successfully
   - Check for any TypeScript or build errors

2. **Test Functionality**
   - Test Google OAuth login
   - Test PDF upload and chat functionality
   - Verify API calls to your Railway backend

3. **Performance Check**
   - Use Vercel Analytics (if enabled)
   - Check Core Web Vitals in Google PageSpeed Insights

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check TypeScript errors in build logs
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables Not Working**
   - Ensure variables start with `NEXT_PUBLIC_` for client-side access
   - Redeploy after adding new environment variables
   - Check variable names match exactly

3. **OAuth Issues**
   - Verify redirect URIs in Google Cloud Console
   - Check `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is correct
   - Ensure `NEXT_PUBLIC_FRONTEND_URL` matches your Vercel domain

4. **API Connection Issues**
   - Verify `NEXT_PUBLIC_API_URL` points to your Railway backend
   - Check CORS settings on your backend
   - Ensure backend is running and accessible

### Performance Optimization

1. **Enable Vercel Analytics**
   - Go to project settings
   - Enable Web Analytics for performance insights

2. **Image Optimization**
   - Use Next.js `Image` component for automatic optimization
   - Configure image domains in `next.config.ts` if needed

3. **Bundle Analysis**
   - Use `@next/bundle-analyzer` to identify large dependencies
   - Optimize imports and remove unused code

## Maintenance

### Regular Updates
- Keep Next.js and dependencies updated
- Monitor Vercel dashboard for any issues
- Check build logs for warnings or errors

### Monitoring
- Set up Vercel notifications for deployment status
- Monitor performance metrics
- Check error logs regularly

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

---

Your ChatPDF application should now be successfully deployed on Vercel! The platform will automatically handle SSL certificates, CDN distribution, and serverless functions for optimal performance.
