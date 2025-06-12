# Azure CI/CD Setup Guide for OICAR API

## 🚀 **GitHub Actions CI/CD Pipeline**

### **What This Does:**
- ✅ **Automatic builds** on every push to main branch
- ✅ **Automatic testing** before deployment
- ✅ **Automatic deployment** to Azure App Service
- ✅ **Only deploys API changes** (path filtering)
- ✅ **Production environment protection**

## 📋 **Setup Steps**

### **Step 1: Add GitHub Secret**

1. **Copy the publish profile** (from the Azure CLI output above):
   ```xml
   <publishData><publishProfile profileName="oicar-api-ms1749710600 - Web Deploy" publishMethod="MSDeploy" publishUrl="oicar-api-ms1749710600.scm.azurewebsites.net:443" msdeploySite="oicar-api-ms1749710600" userName="$oicar-api-ms1749710600" userPWD="mBKlZqBxZa5NApTgpvq3lDmqMtE9bzJxg4aDd0lkbqzvvXSscEpB0Qj7L3Pe" destinationAppUrl="http://oicar-api-ms1749710600.azurewebsites.net" SQLServerDBConnectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100"><databases><add name="DefaultConnection" connectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" providerName="System.Data.SqlClient" type="Sql" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100" /></databases></publishProfile><publishProfile profileName="oicar-api-ms1749710600 - FTP" publishMethod="FTP" publishUrl="ftps://waws-prod-mwh-111.ftp.azurewebsites.windows.net/site/wwwroot" ftpPassiveMode="True" userName="oicar-api-ms1749710600\$oicar-api-ms1749710600" userPWD="mBKlZqBxZa5NApTgpvq3lDmqMtE9bzJxg4aDd0lkbqzvvXSscEpB0Qj7L3Pe" destinationAppUrl="http://oicar-api-ms1749710600.azurewebsites.net" SQLServerDBConnectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100"><databases><add name="DefaultConnection" connectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" providerName="System.Data.SqlClient" type="Sql" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100" /></databases></publishProfile><publishProfile profileName="oicar-api-ms1749710600 - Zip Deploy" publishMethod="ZipDeploy" publishUrl="oicar-api-ms1749710600.scm.azurewebsites.net:443" userName="$oicar-api-ms1749710600" userPWD="mBKlZqBxZa5NApTgpvq3lDmqMtE9bzJxg4aDd0lkbqzvvXSscEpB0Qj7L3Pe" destinationAppUrl="http://oicar-api-ms1749710600.azurewebsites.net" SQLServerDBConnectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" mySQLDBConnectionString="" hostingProviderForumLink="" controlPanelLink="https://portal.azure.com" webSystem="WebSites" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100"><databases><add name="DefaultConnection" connectionString="Server=oicar-sql-server-ms1749709920.database.windows.net;Database=SnjofkaloDB;User Id=sqladmin;Password=OicarAdmin2024!;MultipleActiveResultSets=true;Encrypt=true;TrustServerCertificate=false;Connection Timeout=30;" providerName="System.Data.SqlClient" type="Sql" targetDatabaseEngineType="sqlazuredatabase" targetServerVersion="Version100" /></databases></publishProfile></publishData>
   ```

2. **Go to your GitHub repository**:
   - Navigate to: `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret`
   - **Name**: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value**: Paste the entire XML above
   - Click `Add secret`

### **Step 2: Commit and Push the Workflow**

```bash
git add .github/workflows/azure-api-deploy.yml
git commit -m "Add Azure CI/CD pipeline for API deployment"
git push origin main
```

### **Step 3: Test the Pipeline**

1. **Make a small change** to your API (e.g., add a comment)
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin main
   ```
3. **Watch the deployment**: Go to your GitHub repo → `Actions` tab

## 🔧 **Alternative: Azure DevOps Setup**

If you prefer Azure DevOps instead of GitHub Actions:

```bash
# Create Azure DevOps project (if you don't have one)
az devops project create --name "OICAR" --organization "https://dev.azure.com/your-org"

# Setup build pipeline
az pipelines create --name "OICAR-API-CI-CD" \
  --repository https://github.com/sokol-matija/OICAR-v2 \
  --branch main \
  --yaml-path azure-pipelines.yml
```

## 🔧 **Option 3: Direct Azure Deployment Center**

Using Azure CLI to setup deployment center:

```bash
# Connect GitHub repo to Azure App Service
az webapp deployment source config \
  --resource-group OICAR-ResourceGroup \
  --name oicar-api-ms1749710600 \
  --repo-url https://github.com/sokol-matija/OICAR-v2 \
  --branch main \
  --manual-integration
```

## ✅ **What You Get**

### **GitHub Actions Pipeline Features:**
- 🔨 **Build & Test**: Automatic .NET build and test execution
- 🚀 **Auto-Deploy**: Deploys only when tests pass
- 🎯 **Path Filtering**: Only triggers on API code changes
- 🔐 **Secure**: Uses Azure publish profile secrets
- 📊 **Status Badges**: Shows build/deploy status
- 🔄 **Rollback**: Easy rollback through GitHub interface

### **Pipeline Triggers:**
- ✅ **Push to main**: Automatic deployment
- ✅ **Pull Requests**: Build and test only (no deployment)
- ✅ **Path filtering**: Only `SnjofkaloAPI - Copy/SnjofkaloAPI/**` changes

## 🎯 **Complete CI/CD Flow**

1. **Developer pushes code** → GitHub
2. **GitHub Actions triggers** → Build & Test
3. **Tests pass** → Deploy to Azure
4. **Azure restarts app** → New version live
5. **Notification** → Success/failure status

**Total time**: ~2-3 minutes from push to live deployment!

## 🔍 **Monitoring**

After setup, monitor deployments:
- **GitHub**: Repository → Actions tab
- **Azure**: App Service → Deployment Center
- **Logs**: Azure App Service → Log stream
- **Health**: https://oicar-api-ms1749710600.azurewebsites.net/health 