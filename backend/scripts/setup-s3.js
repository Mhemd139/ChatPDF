#!/usr/bin/env node

/**
 * S3 Setup Script for ChatPDF
 * This script helps you set up and test your AWS S3 configuration
 */

const { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const config = {
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsS3Bucket: process.env.AWS_S3_BUCKET,
};

async function setupS3() {
  console.log('🚀 Setting up AWS S3 for ChatPDF...\n');

  // Check environment variables
  if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsS3Bucket) {
    console.error('❌ Missing required environment variables:');
    console.error('   - AWS_ACCESS_KEY_ID');
    console.error('   - AWS_SECRET_ACCESS_KEY');
    console.error('   - AWS_S3_BUCKET');
    console.error('\nPlease check your .env file and try again.');
    process.exit(1);
  }

  console.log('✅ Environment variables found');
  console.log(`   Region: ${config.awsRegion}`);
  console.log(`   Bucket: ${config.awsS3Bucket}\n`);

  const s3Client = new S3Client({
    region: config.awsRegion,
    credentials: {
      accessKeyId: config.awsAccessKeyId,
      secretAccessKey: config.awsSecretAccessKey,
    },
  });

  try {
    // Check if bucket exists
    console.log('🔍 Checking if bucket exists...');
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: config.awsS3Bucket }));
      console.log('✅ Bucket already exists');
    } catch (error) {
      if (error.name === 'NotFound') {
        console.log('📦 Creating new bucket...');
        await s3Client.send(new CreateBucketCommand({ Bucket: config.awsS3Bucket }));
        console.log('✅ Bucket created successfully');
      } else {
        throw error;
      }
    }

    // Set bucket policy for proper access
    console.log('🔒 Setting bucket policy for secure access...');
    const bucketPolicy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AllowAppAccess',
          Effect: 'Allow',
          Principal: {
            AWS: `arn:aws:iam::898961939537:user/chatpdf-s3-user`
          },
          Action: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket'
          ],
          Resource: [
            `arn:aws:s3:::${config.awsS3Bucket}`,
            `arn:aws:s3:::${config.awsS3Bucket}/*`
          ]
        }
      ]
    };

    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: config.awsS3Bucket,
      Policy: JSON.stringify(bucketPolicy)
    }));
    console.log('✅ Bucket policy set successfully');

    console.log('\n🎉 S3 setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Test your configuration by uploading a PDF');
    console.log('   2. Check the S3 console to verify files are being uploaded');
    console.log('   3. Monitor your AWS billing to ensure costs are reasonable');

  } catch (error) {
    console.error('\n❌ S3 setup failed:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   - Verify your AWS credentials are correct');
    console.error('   - Ensure your IAM user has S3 permissions');
    console.error('   - Check if the bucket name is globally unique');
    console.error('   - Verify your AWS region is correct');
    process.exit(1);
  }
}

// Run the setup
setupS3().catch(console.error);
