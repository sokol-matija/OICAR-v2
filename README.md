# 🛍️ OICAR E-commerce Platform

A modern, full-stack e-commerce platform built with .NET 9.0 API, React Native mobile app, and comprehensive testing infrastructure. Features automated CI/CD deployment to Azure and Vercel with 18 automated tests ensuring quality.

## 🏗️ **Architecture Overview**

- **🔧 .NET 9.0 API**: RESTful backend with Entity Framework + Azure SQL
- **📱 React Native Mobile App**: Cross-platform Expo application  
- **🌐 ASP.NET Web Portal**: Administrative interface
- **☁️ Cloud Infrastructure**: Azure App Service + Azure SQL Database
- **🚀 CI/CD Pipeline**: GitHub Actions → Azure + Vercel deployment
- **🧪 Automated Testing**: 18 tests (API + Mobile) with deployment protection

## 🌐 **Live Deployment URLs**

### **Production Endpoints:**
- **API Backend**: `https://oicar-api-ms1749710600.azurewebsites.net`
- **API Health Check**: `https://oicar-api-ms1749710600.azurewebsites.net/health`
- **API Documentation**: `https://oicar-api-ms1749710600.azurewebsites.net/swagger`
- **Mobile Web App**: Deployed via Vercel CDN

### **Database:**
- **Azure SQL Server**: `oicar-sql-server-ms1749709920.database.windows.net`
- **Database**: `SnjofkaloDB`
- **Management**: Connect via DBeaver (see connection guide)

## 🧪 **Testing Infrastructure** ⭐ **18 AUTOMATED TESTS**

### **Testing Strategy:**
- **API Tests (10)**: XUnit + Moq + FluentAssertions
- **Mobile Tests (8)**: Jest + jest-expo + React Native Testing Library  
- **Integration**: Tests run before every deployment
- **Protection**: Deployments blocked if tests fail

### **Test Categories:**
```
API Tests (10):
├─ Unit Tests (8)
│  ├─ AuthController Tests (3) 
│  └─ Utility Tests (5)
└─ Integration Tests (2)

Mobile Tests (8):
├─ Unit Tests (6)
│  ├─ Component Tests (2)
│  └─ Utility Tests (4)  
└─ Integration Tests (2)

Total: 18 tests, 100% passing ✅
```

## 🚀 **Quick Start**

### **Prerequisites**
- .NET 9.0 SDK
- Node.js 18+ with npm
- Git

### **1. Clone and Setup**
```bash
git clone [repository-url]
cd OICAR
```

### **2. Run API Locally**
```bash
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
dotnet restore
dotnet run
# API available at: http://localhost:5042
# Swagger UI: http://localhost:5042/swagger
```

### **3. Run Mobile App Locally** 
```bash
cd OICAR-MobileApp
npm install
npm start
# Expo development server starts
# Scan QR code with Expo Go app
```

### **4. Run Web Portal Locally**
```bash
cd OICAR-WebApp
dotnet restore  
dotnet run
# Web portal available at: http://localhost:5082
```

## 🧪 **Manual Testing Commands**

### **API Tests:**
```bash
cd SnjofkaloAPI.Tests
dotnet test                           # Run all tests
dotnet test --verbosity detailed      # Detailed output  
dotnet test --filter "AuthController" # Specific test class
```

### **Mobile Tests:**
```bash
cd OICAR-MobileApp
npm test -- --watchAll=false          # Run all tests
npm test -- --watch                   # Interactive mode
npm test -- --coverage                # Coverage report
```

## ⚙️ **Development Workflow**

### **Automated Deployment Pipeline:**
1. **Push to GitHub** → Triggers automated workflow
2. **Run Tests** → API (10 tests) + Mobile (8 tests) 
3. **Build Applications** → Compile .NET API + Expo web build
4. **Deploy to Cloud** → Azure App Service + Vercel CDN
5. **Health Checks** → Verify deployment success

### **Deployment Protection:**
- ❌ **Any test fails** → Deployment blocked
- ✅ **All tests pass** → Deployment continues
- 📊 **Visual feedback** in GitHub Actions + Vercel

## 🗄️ **Database Connection**

### **Azure SQL Database:**
- **Server**: `oicar-sql-server-ms1749709920.database.windows.net`
- **Database**: `SnjofkaloDB`  
- **Authentication**: SQL Server authentication
- **Encryption**: TLS required

### **Connect with DBeaver:**
1. Create new SQL Server connection
2. Host: `oicar-sql-server-ms1749709920.database.windows.net`
3. Port: `1433`
4. Database: `SnjofkaloDB`
5. Enable SSL and trust server certificate

📋 **Detailed guide**: `Documents/local-documentation/DBeaver-Connection-Guide.md`

## 📊 **Project Structure**

```
OICAR/
├── SnjofkaloAPI - Copy/SnjofkaloAPI/    # 🔧 .NET 9.0 API (ACTIVE)
├── SnjofkaloAPI.Tests/                  # 🧪 API unit tests (10 tests)
├── OICAR-MobileApp/                     # 📱 React Native Expo app  
│   └── __tests__/                       # 🧪 Mobile tests (8 tests)
├── OICAR-WebApp/                        # 🌐 ASP.NET web portal
├── .github/workflows/                   # 🚀 CI/CD automation
├── Documents/local-documentation/       # 📚 Current documentation
├── Documents/old-documents/             # 🗂️ Archived design files
├── Database/                            # 💾 Database schemas (legacy)
└── scripts/                             # 🔧 Utility scripts
```

## 📚 **Documentation**

### **📖 Complete Documentation Suite:**
- **[📋 PROJECT_OVERVIEW.md](Documents/local-documentation/PROJECT_OVERVIEW.md)** - High-level summary  
- **[🧪 TESTING_DOCUMENTATION.md](Documents/TESTING_DOCUMENTATION.md)** - Testing guide
- **[🚀 DEPLOYMENT_GUIDE.md](Documents/local-documentation/DEPLOYMENT_GUIDE.md)** - Deployment process
- **[🏗️ ARCHITECTURE_OVERVIEW.md](Documents/local-documentation/ARCHITECTURE_OVERVIEW.md)** - Technical architecture
- **[📋 FUNCTIONAL_SPECIFICATION.md](Documents/local-documentation/FUNCTIONAL_SPECIFICATION.md)** - Requirements
- **[📅 APPLICATION_DEVELOPMENT_PLAN.md](Documents/local-documentation/APPLICATION_DEVELOPMENT_PLAN.md)** - 16-week plan
- **[🔧 ENV_SETUP.md](ENV_SETUP.md)** - Environment configuration

### **🗄️ Database Connection:**
- **[🔗 DBeaver-Connection-Guide.md](Documents/local-documentation/DBeaver-Connection-Guide.md)**

## 🔧 **Environment Configuration**

The API supports environment variables for secure configuration:

```bash
# Example .env file (create in API directory)
DB_SERVER=your-server.database.windows.net
DB_NAME=SnjofkaloDB  
DB_USER=your-username
DB_PASSWORD=your-password
JWT_SECRET_KEY=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

📋 **Complete guide**: `ENV_SETUP.md`

## 🎯 **Key Features**

### **✅ Modern Technology Stack:**
- .NET 9.0 with Entity Framework Core
- React Native with Expo SDK 
- Azure SQL with encryption at rest
- JWT authentication with refresh tokens
- Automated testing with jest-expo (2024-2025 best practices)

### **✅ Professional Development Practices:**
- Comprehensive automated testing (18 tests)
- CI/CD pipeline with quality gates
- Cloud-native architecture  
- GDPR-compliant data handling
- Structured logging with Serilog
- API documentation with Swagger

### **✅ Production-Ready Deployment:**
- Azure App Service hosting
- Vercel CDN for mobile web
- Automated health checks
- Performance monitoring
- Security scanning

## 🔍 **API Endpoints**

### **Authentication:**
- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/auth/refresh` - Token refresh

### **Product Management:**
- `GET /api/items` - Get products
- `POST /api/items` - Create product
- `PUT /api/items/{id}` - Update product
- `DELETE /api/items/{id}` - Delete product

### **Order Management:**
- `GET /api/orders` - Get orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details

### **System:**
- `GET /health` - Health check endpoint
- `GET /swagger` - API documentation

📖 **Full API documentation**: Available at `/swagger` when running

## ⚠️ **Troubleshooting**

### **API Issues:**
```bash
# Check API health
curl https://oicar-api-ms1749710600.azurewebsites.net/health

# View local logs  
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
dotnet run --verbosity detailed
```

### **Mobile App Issues:**
```bash
# Clear cache and reinstall
cd OICAR-MobileApp
rm -rf node_modules package-lock.json
npm install
npm start -- --clear
```

### **Database Connection Issues:**
- Verify Azure SQL firewall rules allow your IP
- Check connection string in `appsettings.json`
- Test connectivity via DBeaver
- Ensure TLS/SSL is enabled

## 🎉 **Project Highlights**

### **🏆 Technical Excellence:**
- **Modern Architecture**: Latest .NET 9.0 + React Native + Azure
- **Quality Assurance**: 18 automated tests with CI/CD integration
- **Cloud-Native**: Scalable Azure infrastructure
- **Security**: JWT auth + data encryption + HTTPS
- **Documentation**: Comprehensive guides and architecture docs

### **📈 Professional Standards:**
- Industry-standard testing practices (2024-2025)
- Automated deployment pipeline
- Production monitoring and health checks
- GDPR compliance implementation
- Clean code architecture with separation of concerns

---

## 🛠️ **Development Team**

**Course Project**: Software Engineering  
**Technologies**: .NET 9.0, React Native, Azure, Jest, XUnit  
**Features**: E-commerce platform with testing and automated deployment  

---

*Last Updated: December 2024*  
*API Status: ✅ Live at Azure App Service*  
*Mobile Status: ✅ Deployed via Vercel*  
*Tests: 18 automated, 100% passing*  
*Database: ✅ Azure SQL with encrypted data*

# OICAR UI - Angular Frontend

This is the Angular frontend for the OICAR marketplace application.

## 🚀 Live Demo
- **Production**: Auto-deployed via Vercel
- **API**: Connected to Azure-hosted backend

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## 📦 Deployment

This project is automatically deployed to Vercel on every push to main branch.

## 🔗 API Configuration

The app connects to the live Azure API:
- **API Endpoint**: `https://oicar-api-ms1749710600.azurewebsites.net/api`
- **CORS**: Configured to allow all Vercel.app domains

## 🏗️ Built With

- Angular 17
- Angular Material
- TypeScript
- SCSS
