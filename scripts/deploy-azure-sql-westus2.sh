#!/bin/bash

# Azure SQL Database Deployment Script for OICAR Project - West US 2
echo "🚀 Starting OICAR Azure SQL Database Deployment (West US 2)..."

# Set variables
RESOURCE_GROUP="OICAR-ResourceGroup"
LOCATION="westus2"  # Changed from eastus
SERVER_NAME="oicar-sql-server-ms$(date +%s)"
DATABASE_NAME="SnjofkaloDB"
ADMIN_USER="sqladmin"
ADMIN_PASSWORD="OicarAdmin2024!"

echo "📋 Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  Location: $LOCATION"
echo "  Server: $SERVER_NAME"
echo "  Database: $DATABASE_NAME"
echo ""

# Create SQL Server in West US 2
echo "1️⃣ Creating SQL Server in West US 2..."
az sql server create \
  --name $SERVER_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --admin-user $ADMIN_USER \
  --admin-password $ADMIN_PASSWORD

if [ $? -eq 0 ]; then
    echo "✅ SQL Server created successfully!"
    
    # Configure Firewall Rules
    echo "2️⃣ Configuring Firewall Rules..."
    
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

    # Create SQL Database
    echo "3️⃣ Creating SQL Database (Basic Tier)..."
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
    echo "3. Run your Database.sql script using Azure Query Editor"
    echo "4. Deploy your API to Azure App Service"
else
    echo "❌ Failed to create SQL Server. Please try a different region."
fi 