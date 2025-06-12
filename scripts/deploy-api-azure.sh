#!/bin/bash

# Azure App Service Deployment Script for OICAR API
echo "🚀 Starting OICAR API Deployment to Azure App Service..."

# Set variables
RESOURCE_GROUP="OICAR-ResourceGroup"
LOCATION="westus2"
APP_SERVICE_PLAN="OICAR-AppServicePlan"
WEB_APP_NAME="oicar-api-ms$(date +%s)"  # Must be globally unique
PROJECT_PATH="SnjofkaloAPI - Copy/SnjofkaloAPI"
ZIP_FILE="oicar-api-deployment.zip"

echo "📋 Deployment Configuration:"
echo "  Resource Group: $RESOURCE_GROUP"
echo "  App Service Plan: $APP_SERVICE_PLAN"
echo "  Web App Name: $WEB_APP_NAME"
echo "  Location: $LOCATION"
echo ""

# Step 1: Create App Service Plan (Free Tier)
echo "1️⃣ Creating App Service Plan (Free Tier)..."
az appservice plan create \
  --name $APP_SERVICE_PLAN \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION \
  --sku F1

if [ $? -ne 0 ]; then
    echo "❌ Failed to create App Service Plan"
    exit 1
fi

# Step 2: Create Web App
echo "2️⃣ Creating Web App..."
az webapp create \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --plan $APP_SERVICE_PLAN \
  --runtime "dotnet:9"

if [ $? -ne 0 ]; then
    echo "❌ Failed to create Web App"
    exit 1
fi

# Step 3: Configure Connection String
echo "3️⃣ Configuring database connection string..."
CONNECTION_STRING="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;"

az webapp config connection-string set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --connection-string-type SQLAzure \
  --settings DefaultConnection="$CONNECTION_STRING"

# Step 4: Configure App Settings
echo "4️⃣ Configuring app settings..."
az webapp config appsettings set \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --settings \
    ASPNETCORE_ENVIRONMENT="Production" \
    Logging__LogLevel__Default="Information" \
    Logging__LogLevel__Microsoft="Warning"

# Step 5: Build and Publish API
echo "5️⃣ Building and publishing .NET API..."
cd "$PROJECT_PATH"

# Clean and restore
dotnet clean
dotnet restore

# Publish to a folder
dotnet publish -c Release -o ./publish

if [ $? -ne 0 ]; then
    echo "❌ Failed to build/publish .NET project"
    exit 1
fi

# Step 6: Create deployment ZIP
echo "6️⃣ Creating deployment package..."
cd publish
zip -r "../../$ZIP_FILE" .
cd ../..

# Step 7: Deploy to Azure
echo "7️⃣ Deploying to Azure App Service..."
az webapp deploy \
  --name $WEB_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --src-path $ZIP_FILE \
  --type zip \
  --async false

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 API Deployment Successful!"
    echo ""
    echo "📱 Your API URLs:"
    echo "  Main URL: https://$WEB_APP_NAME.azurewebsites.net"
    echo "  Swagger: https://$WEB_APP_NAME.azurewebsites.net/swagger"
    echo "  Health: https://$WEB_APP_NAME.azurewebsites.net/health"
    echo ""
    echo "🔗 Azure Resources:"
    echo "  Web App: $WEB_APP_NAME"
    echo "  Resource Group: $RESOURCE_GROUP"
    echo "  App Service Plan: $APP_SERVICE_PLAN"
    echo ""
    echo "🌐 Azure Portal: https://portal.azure.com"
    
    # Test API endpoint
    echo "8️⃣ Testing API endpoint..."
    sleep 30  # Wait for deployment to complete
    echo "Testing: https://$WEB_APP_NAME.azurewebsites.net/health"
    curl -s "https://$WEB_APP_NAME.azurewebsites.net/health" || echo "API might still be starting up..."
    
else
    echo "❌ API deployment failed"
    exit 1
fi

# Cleanup
echo "🧹 Cleaning up deployment files..."
rm -f $ZIP_FILE
rm -rf "$PROJECT_PATH/publish"

echo "✅ Deployment process complete!" 