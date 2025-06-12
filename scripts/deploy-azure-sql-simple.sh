#!/bin/bash

# Simplified Azure SQL Database Deployment Script for OICAR Project
echo "🚀 Starting OICAR Azure SQL Database Deployment (Free Tier)..."

# Set variables
RESOURCE_GROUP="OICAR-ResourceGroup"
LOCATION="eastus"
SERVER_NAME="oicar-sql-server-ms$(date +%s)"  # Adding timestamp for uniqueness
DATABASE_NAME="SnjofkaloDB"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="OicarAdmin2024!"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Server: $SERVER_NAME"
echo "  Database: $DATABASE_NAME"
echo ""

# Check if Microsoft.Sql provider is registered
echo "1️⃣ Checking SQL provider registration..."
REGISTRATION_STATE=$(az provider show -n Microsoft.Sql --query "registrationState" -o tsv)
echo "Provider state: $REGISTRATION_STATE"

if [ "$REGISTRATION_STATE" != "Registered" ]; then
    echo "⏳ Waiting for Microsoft.Sql provider to register..."
    while [ "$REGISTRATION_STATE" != "Registered" ]; do
        sleep 5
        REGISTRATION_STATE=$(az provider show -n Microsoft.Sql --query "registrationState" -o tsv)
        echo "Current state: $REGISTRATION_STATE"
    done
fi

echo "✅ Microsoft.Sql provider is registered!"

# Create SQL Server
echo "2️⃣ Creating SQL Server..."
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

# Configure Firewall Rules
echo "3️⃣ Configuring Firewall Rules..."

# Allow Azure services
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "AllowAzureServices" \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# Allow your current IP
YOUR_IP=$(curl -s https://ifconfig.me)
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name "AllowMyIP" \
  --start-ip-address $YOUR_IP \
  --end-ip-address $YOUR_IP

# Create SQL Database (Free Tier)
echo "4️⃣ Creating SQL Database (Free Tier)..."
az sql db create \
  --resource-group $RESOURCE_GROUP \
  --server $SERVER_NAME \
  --name $DATABASE_NAME \
  --edition Basic \
  --capacity 5

echo ""
echo "🎉 Database created successfully!"
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
echo "1. Copy the connection string above"
echo "2. Update your appsettings.json"
echo "3. Run your Database.sql script"
echo "4. Deploy your API to Azure App Service" 