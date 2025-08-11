# AWS S3 Setup Guide for ChatPDF

This guide will help you set up AWS S3 for cloud storage of PDF files in your ChatPDF application.

## 🎯 Why AWS S3?

- **Scalability**: Handle unlimited PDF uploads
- **Reliability**: 99.99% availability guarantee
- **Cost-effective**: Pay only for what you use
- **Security**: Private access with signed URLs
- **Global**: Access from anywhere in the world

## 📋 Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI** (optional): For advanced management
3. **Node.js**: Your backend should be running

## 🚀 Quick Setup

### Step 1: Create S3 Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter a unique bucket name (e.g., `chatpdf-storage-123`)
4. Choose your preferred region (e.g., `us-east-1`)
5. Keep default settings for now
6. Click "Create bucket"

### Step 2: Create IAM User

1. Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
2. Click "Users" → "Create user"
3. Enter username: `chatpdf-s3-user`
4. Select "Programmatic access"
5. Click "Next: Permissions"
6. Click "Attach existing policies directly"
7. Search for and select `AmazonS3FullAccess`
8. Click "Next: Tags" (optional)
9. Click "Next: Review"
10. Click "Create user"
11. **IMPORTANT**: Save the Access Key ID and Secret Access Key

### Step 3: Configure Environment

1. In your `backend/.env` file, add:
```env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

2. Replace the values with your actual credentials

### Step 4: Run Setup Script

```bash
cd backend
npm run setup-s3
```

This script will:
- Verify your credentials
- Create the bucket if it doesn't exist
- Set up proper security policies
- Test the connection

## 🔒 Security Configuration

### Bucket Policy
The setup script automatically configures a secure bucket policy that:
- Denies public access to all objects
- Only allows access through your application
- Uses signed URLs for temporary access

### CORS Configuration (if needed)
If you encounter CORS issues, add this to your S3 bucket:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
        "ExposeHeaders": []
    }
]
```

## 💰 Cost Optimization

### S3 Storage Classes
- **Standard**: For frequently accessed files
- **Standard-IA**: For infrequently accessed files (cheaper)
- **Glacier**: For long-term storage (very cheap)

### Lifecycle Policies
Set up automatic transitions to cheaper storage classes:

1. Go to S3 bucket → Management → Lifecycle
2. Create rule for "Move current versions of objects between storage classes"
3. Transition to Standard-IA after 30 days
4. Transition to Glacier after 90 days

### Cost Monitoring
- Set up AWS Budgets to monitor spending
- Enable S3 Storage Lens for detailed analytics
- Set up CloudWatch alarms for unusual usage

## 🧪 Testing Your Setup

### 1. Test Upload
```bash
# Start your backend
npm run dev

# Upload a PDF through your frontend
# Check the S3 console to see the file
```

### 2. Test Download
```bash
# The PDF processor should automatically download from S3
# Check your backend logs for S3 operations
```

### 3. Test Deletion
```bash
# Delete a PDF through your frontend
# Verify it's removed from S3
```

## 🔧 Troubleshooting

### Common Issues

#### 1. "Access Denied" Error
- Check IAM user permissions
- Verify bucket policy
- Ensure credentials are correct

#### 2. "Bucket Not Found" Error
- Verify bucket name spelling
- Check AWS region
- Ensure bucket exists

#### 3. "Invalid Access Key" Error
- Regenerate access keys
- Check environment variables
- Restart your application

#### 4. CORS Errors
- Add CORS configuration to S3 bucket
- Check allowed origins
- Verify request headers

### Debug Commands

```bash
# Check environment variables
echo $AWS_ACCESS_KEY_ID
echo $AWS_S3_BUCKET

# Test S3 connection
aws s3 ls s3://your-bucket-name

# Check bucket policy
aws s3api get-bucket-policy --bucket your-bucket-name
```

## 📊 Monitoring & Maintenance

### CloudWatch Metrics
- Monitor S3 requests and errors
- Set up alerts for high usage
- Track storage costs

### S3 Analytics
- Enable storage class analysis
- Monitor access patterns
- Optimize storage costs

### Regular Maintenance
- Review access logs monthly
- Clean up unused objects
- Update IAM policies as needed

## 🚀 Production Considerations

### Multi-Region Setup
- Use S3 Cross-Region Replication
- Choose regions close to your users
- Consider compliance requirements

### Backup Strategy
- Enable versioning for critical files
- Set up cross-region replication
- Regular backup testing

### Performance Optimization
- Use CloudFront CDN for global access
- Implement proper caching headers
- Monitor and optimize request patterns

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [S3 Best Practices](https://docs.aws.amazon.com/AmazonS3/latest/userguide/best-practices.html)
- [IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [S3 Pricing](https://aws.amazon.com/s3/pricing/)

## 🆘 Getting Help

If you encounter issues:

1. Check AWS CloudTrail for API call logs
2. Review S3 server access logs
3. Check IAM user permissions
4. Verify bucket policies
5. Test with AWS CLI
6. Check AWS Support Center

---

**Need help?** Check the troubleshooting section above or refer to AWS documentation.
