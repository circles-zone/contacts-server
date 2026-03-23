#!/bin/bash

# TODO I'm not sure we need this file - Please delete it.

# AWS Deployment Script for Contacts Server

echo "🚀 Starting AWS deployment..."

# Build the project
echo "📦 Building project..."
npm run build

# Create RDS instance (if not exists)
echo "🗄️ Setting up RDS MySQL instance..."
aws rds create-db-instance \
  --db-instance-identifier contacts-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourSecurePassword123! \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxxxxx \
  --publicly-accessible \
  --no-multi-az \
  --storage-type gp2

# Deploy to EC2 or Lambda
echo "☁️ Deploying to AWS..."

# Update environment to cloud
export ENVIRONMENT=cloud
export AWS_RDS_HOST=contacts-db.xxxxxxxxx.us-east-1.rds.amazonaws.com
export AWS_RDS_USER=admin
export AWS_RDS_PASSWORD=YourSecurePassword123!
export AWS_RDS_DATABASE=contacts_db

echo "✅ Deployment complete!"
echo "📝 Don't forget to update your .env file with the RDS endpoint"
