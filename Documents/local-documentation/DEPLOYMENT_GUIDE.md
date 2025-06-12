# 🚀 OICAR Deployment Guide

## Table of Contents
- [Overview](#overview)
- [Architecture](#architecture) 
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Azure Deployment](#azure-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Testing Integration](#testing-integration)
- [Live Deployment URLs](#live-deployment-urls)
- [Troubleshooting](#troubleshooting)

## Overview

This document explains our complete deployment strategy for the OICAR project. We use a **dual-platform approach** with automated testing to ensure quality deployments.

### 🎯 **Deployment Strategy:**
- **API Backend**: GitHub Actions → Azure App Service
- **Mobile Web App**: Vercel with integrated testing
- **Database**: Azure SQL Server
- **Testing**: Automated tests before every deployment

## Architecture

```
┌─────────────────┬─────────────────┬─────────────────┐
│   Development   │      CI/CD      │   Production    │
├─────────────────┼─────────────────┼─────────────────┤
│                 │                 │                 │
│ Local Dev       │ GitHub Actions  │ Azure App       │
│ ├─ .NET API     │ ├─ Run Tests    │ Service         │
│ ├─ React Native │ ├─ Build API    │ ├─ API Hosting  │
│ ├─ SQL Server   │ └─ Deploy       │ └─ Database     │
│                 │                 │                 │
│ Git Push        │ Vercel Build    │ Vercel Hosting  │
│ └─ Triggers →   │ ├─ Run Tests    │ ├─ Web App      │
│                 │ ├─ Build Web    │ └─ CDN          │
│                 │ └─ Deploy       │                 │
└─────────────────┴─────────────────┴─────────────────┘
```

## GitHub Actions CI/CD ⭐ **VERIFIED WORKING**

### **Configuration File:** `.github/workflows/azure-deployment.yml`

Our GitHub Actions pipeline automatically:
1. **Runs all API tests** (10 tests in <1 second)
2. **Builds the .NET application**
3. **Deploys to Azure App Service**

### **Live Deployment Timeline** *(verified from actual deployment)*:
```
✅ Set up job (5s)
✅ Checkout code (2s) 
✅ Setup .NET 9.0 (7s)
✅ Restore dependencies (6s)
✅ Build application (7s)
✅ Run tests (1s) ⚡ ← Tests block deployment if failed
✅ Publish application (1s)
✅ Deploy to Azure (2s)
```

### **Key Features:**
- **🛡️ Test Protection**: Deployment stops if tests fail
- **⚡ Fast Execution**: Complete pipeline in ~30 seconds
- **🔄 Automatic Triggers**: Every `git push` to main branch
- **📊 Visual Results**: See test results in GitHub Actions UI

### **Environment Variables:**
```yaml
AZURE_WEBAPP_NAME: oicar-api-ms1749710600
AZURE_WEBAPP_PACKAGE_PATH: ./SnjofkaloAPI - Copy/SnjofkaloAPI
DOTNET_VERSION: 9.0.x
```

## Azure Deployment

### **Services Used:**
1. **Azure App Service**: Hosts the .NET API
2. **Azure SQL Database**: Stores application data
3. **Azure DevOps**: Pipeline management (connected to GitHub)

### **Connection String Configuration:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:[server].database.windows.net,1433;Database=[database];User ID=[username];Password=[password];Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

### **Deployment Process:**
1. **GitHub Push** → Triggers workflow
2. **GitHub Actions** → Runs tests and builds
3. **Azure Deployment** → Receives compiled application
4. **Health Check** → Verifies deployment success

### **Live API Endpoint:**
- **URL**: `https://oicar-api-ms1749710600.azurewebsites.net`
- **Health Check**: `/health`
- **Swagger**: `/swagger`

## Vercel Deployment ⭐ **VERIFIED WORKING**

### **Configuration File:** `OICAR-MobileApp/vercel.json`
```json
{
  "buildCommand": "npm test -- --watchAll=false && npx expo export --platform web",
  "outputDirectory": "dist", 
  "framework": null,
  "installCommand": "npm install",
  "devCommand": "npx expo start --web",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### **Build Process** *(verified from actual deployment)*:
```bash
# Install dependencies
npm install (5s)

# Run tests FIRST
npm test -- --watchAll=false (4s)
├─ PASS __tests__/integration/AppToApiIntegration.test.ts
├─ PASS __tests__/utils.test.ts  
├─ PASS __tests__/HomeScreen.test.tsx
└─ Tests: 8 passed, 8 total ✅

# Build web version (only if tests pass)
npx expo export --platform web (14s)
├─ Starting Metro Bundler
├─ Web Bundled (332 modules)
└─ Exported: dist

# Deploy to Vercel CDN
Deploy to global CDN (5s)
```

### **Key Features:**
- **🧪 Test-First Deployment**: Tests run before build
- **📱 React Native Web**: Single codebase for mobile and web
- **🌐 Global CDN**: Fast worldwide access
- **🔄 Automatic Deployments**: Connected to Git

## Testing Integration

### **Dual Testing Strategy:**

#### **API Tests (GitHub Actions):**
```bash
✅ AuthController Tests (3 tests)
✅ Utility Tests (5 tests)  
✅ Integration Tests (2 tests)
Total: 10 tests in 0.37 seconds
```

#### **Mobile Tests (Vercel):**
```bash  
✅ Component Tests (2 tests)
✅ Utility Tests (4 tests)
✅ Integration Tests (2 tests) 
Total: 8 tests in 3.76 seconds
```

### **Failure Protection:**
- **❌ Any test fails** → Deployment blocked
- **✅ All tests pass** → Deployment continues
- **📊 Visual feedback** in both platforms

## Live Deployment URLs

### **Production Endpoints:**

#### **API (Azure App Service):**
- **Base URL**: `https://oicar-api-ms1749710600.azurewebsites.net`
- **Health Check**: `https://oicar-api-ms1749710600.azurewebsites.net/health`
- **API Documentation**: `https://oicar-api-ms1749710600.azurewebsites.net/swagger`

#### **Mobile Web App (Vercel):**
- **Live App**: `https://[your-vercel-deployment].vercel.app`
- **Dashboard**: Available in Vercel dashboard
- **Build Logs**: Viewable in Vercel deployment history

### **Monitoring URLs:**

#### **GitHub Actions:**
- **Workflows**: `https://github.com/sokol-matija/OICAR-v2/actions`
- **Latest Run**: Shows test results and deployment status

#### **Azure Portal:**
- **App Service**: Monitor performance and logs
- **SQL Database**: Database metrics and connections

## Troubleshooting

### **Common Deployment Issues:**

#### **1. GitHub Actions Failure**
**Symptoms**: Red X in Actions tab
**Solutions**:
```bash
# Check test failures
dotnet test --verbosity detailed

# Verify dependencies
dotnet restore
dotnet build

# Check secrets configuration
# Ensure AZURE_WEBAPP_PUBLISH_PROFILE is set
```

#### **2. Vercel Build Failure**
**Symptoms**: Deployment fails in Vercel dashboard
**Solutions**:
```bash
# Test locally first
npm test -- --watchAll=false
npx expo export --platform web

# Check package.json scripts
npm run test
npm run build

# Verify dependencies
npm install
npm audit fix
```

#### **3. Azure App Service Issues**
**Symptoms**: 500 errors or app won't start
**Solutions**:
- Check Azure App Service logs
- Verify connection strings
- Ensure .NET version compatibility
- Check health endpoint: `/health`

#### **4. Database Connection Issues**
**Symptoms**: API returns database errors
**Solutions**:
- Verify Azure SQL firewall rules
- Check connection string format
- Test connectivity from Azure portal
- Ensure database exists and accessible

### **Monitoring Commands:**

#### **Local Testing:**
```bash
# Test API locally
cd SnjofkaloAPI.Tests
dotnet test

# Test mobile locally  
cd OICAR-MobileApp
npm test

# Build mobile web locally
npx expo export --platform web
```

#### **Deployment Verification:**
```bash
# Check API health
curl https://oicar-api-ms1749710600.azurewebsites.net/health

# Check GitHub Actions status
# Visit: https://github.com/sokol-matija/OICAR-v2/actions

# Check Vercel deployment
# Visit: https://vercel.com/dashboard
```

## Best Practices

### **Development Workflow:**
1. **Write tests first** for new features
2. **Test locally** before pushing
3. **Make small, logical commits** 
4. **Push to trigger automated deployment**
5. **Monitor deployment results** in Actions/Vercel

### **Testing Strategy:**
- **Unit tests** for individual functions
- **Integration tests** for system interactions
- **Test both platforms** before deployment
- **Use meaningful test names** for easy debugging

### **Deployment Safety:**
- **Never skip tests** in deployment
- **Monitor health endpoints** after deployment
- **Keep local documentation updated** 
- **Use environment variables** for configuration

---

## 🎉 Summary

### **What We've Achieved:**
✅ **Automated CI/CD** with GitHub Actions  
✅ **Dual-platform deployment** (Azure + Vercel)  
✅ **Test-driven deployment** (18 total tests)  
✅ **Production-ready infrastructure**  
✅ **Professional monitoring** and logging  

### **Key Benefits:**
- **🛡️ Quality Assurance**: Tests prevent broken deployments
- **⚡ Fast Deployment**: 30-second full pipeline  
- **🔄 Automation**: No manual deployment steps
- **📊 Visibility**: Clear test and deployment status
- **🌐 Scalability**: Cloud-native architecture

---

*Last Updated: December 2024*  
*API Platform: GitHub Actions → Azure App Service*  
*Mobile Platform: Vercel with integrated testing*  
*Total Tests: 18 | All Automated ✅* 