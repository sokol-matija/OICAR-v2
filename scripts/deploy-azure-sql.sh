#!/bin/bash

# Azure SQL Database Deployment Script for OICAR Project
# Make sure you're logged in with: az login

echo "🚀 Starting OICAR Azure SQL Database Deployment..."

# Set variables (you can modify these)
RESOURCE_GROUP="OICAR-ResourceGroup"
LOCATION="eastus"  # Change to your preferred location
SERVER_NAME="oicar-sql-server-ms"  # Must be globally unique - add your initials
DATABASE_NAME="SnjofkaloDB"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="OicarAdmin2024!"  # Change this to a strong password

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Server: $SERVER_NAME"
echo "  Database: $DATABASE_NAME"
echo "  Admin User: $ADMIN_USER"
echo ""

# Step 1: Create Resource Group
echo "1️⃣ Creating Resource Group..."
az group create \
  --name $RESOURCE_GROUP \
  --location $LOCATION

# Step 2: Create SQL Server
echo "2️⃣ Creating SQL Server..."
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

# Step 3: Configure Firewall Rules
echo "3️⃣ Configuring Firewall Rules..."

# Allow Azure services
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your current IP
echo "Getting your current IP address..."
YOUR_IP=$(curl -s https://ifconfig.me)
echo "Your IP: $YOUR_IP"

az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "AllowMyIP" \
  --start-ip-address $YOUR_IP \
  --end-ip-address $YOUR_IP

# Step 4: Create SQL Database (FREE TIER)
echo "4️⃣ Creating SQL Database (Free Tier)..."
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --tier Free \
  --capacity 5 \
  --max-size 32GB

# Step 5: Get Connection String
echo "5️⃣ Database created successfully! 🎉"
echo ""
echo "📝 Connection Details:"
echo "  Server: $SERVER_NAME.database.windows.net"
echo "  Database: $DATABASE_NAME"
echo "  Username: $ADMIN_USER"
echo "  Password: $ADMIN_PASSWORD"
echo ""
echo "🔗 Connection String for appsettings.json:"
echo "Server=$SERVER_NAME.database.windows.net;Database=$DATABASE_NAME;User Id=$ADMIN_USER;Password=$ADMIN_PASSWORD;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;"
echo ""
echo "✅ Next Steps:"
echo "1. Update your appsettings.json with the connection string above"
echo "2. Run your Database.sql script to create tables"
echo "3. Deploy your API to Azure App Service"
echo ""
echo "🌐 Azure Portal: https://portal.azure.com" 