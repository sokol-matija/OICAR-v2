# Deploy CORS Fixes to Azure API

## 🚨 **Why This Is Needed**

Your Azure API deployment still has the old CORS configuration. The CORS errors in your Vercel app will persist until we deploy these fixes.

## 📋 **Option 1: Build and Deploy via Visual Studio/CLI**

### Step 1: Build for Production
```bash
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
dotnet publish -c Release -o ./publish
```

### Step 2: Create Deployment Package
```bash
# Create new deployment zip
cd publish
zip -r ../deploy-cors-fix.zip ./*
```

### Step 3: Deploy to Azure
```bash
# Using Azure CLI (if available)
az webapp deployment source config-zip \
  --resource-group your-resource-group \
  --name oicar-api-ms1749710600 \
  --src deploy-cors-fix.zip
```

## 📋 **Option 2: Manual Azure Portal Deployment**

### Step 1: Build Locally
```bash
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
dotnet publish -c Release -o ./publish
```

### Step 2: Upload via Azure Portal
1. Go to: https://portal.azure.com
2. Navigate to your App Service: `oicar-api-ms1749710600`
3. Go to **Development Tools** → **Advanced Tools** → **Go**
4. Click **Debug console** → **CMD**
5. Navigate to `/site/wwwroot`
6. Upload your published files

## 📋 **Option 3: Using Existing deploy.zip**

If your existing `deploy.zip` is recent, you can:

1. **Extract existing deploy.zip**
2. **Update appsettings.json** with new CORS config
3. **Re-zip and upload**

## 🔧 **Quick Fix Commands**

```bash
# Navigate to API directory
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"

# Build and publish
dotnet clean
dotnet build -c Release
dotnet publish -c Release -o ./publish

# Create new deployment package
cd publish
zip -r ../deploy-cors-updated.zip ./*

# The deploy-cors-updated.zip file is ready for Azure upload
```

## ✅ **After Deployment**

1. **Test CORS immediately**: Visit your Vercel app
2. **Check browser console**: Should see no CORS errors
3. **Test login/register**: Should work without issues

## 🔍 **Verify Deployment Worked**

Visit: https://oicar-api-ms1749710600.azurewebsites.net/health

Should return JSON without CORS errors when accessed from Vercel domain.

## ⚠️ **Important Notes**

- The `appsettings.Production.json` will override `appsettings.json` in production
- Make sure both files have the correct CORS origins
- Azure takes 1-2 minutes to restart after deployment 