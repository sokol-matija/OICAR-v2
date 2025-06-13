# OICAR E-commerce Platform

Okay, so my team and I have made a full-stack e-commerce platform that we have built with .NET 9.0 API. We have also used React Native Mobile App and comprehensive testing infrastructure. This also features automated CI / CD deployment to Azure and Vercel with 18 automated tests.

### Team:  
Matija Sokol, Dominik Despot, Dominik Cirko  

## **Architecture Overview**

We have used .NET 9.0 API using RESTful backend with Entity Framework and Azure SQL.    
  
For the mobile app we have used React Native expo application that is cross platformed.

For CI/CD pipeline we have used GitHub actions paired with Azure and Vercel deployment.
The deployment should trigger once we push the code to the to GitHub.

The web frontend is an angular application using angular 17 with all the best modern practices.

For start I have first dockerized the Microsoft SQL database but we have later moved on to using a live database that I have deployed on on Azure


## **Live Deployment URLs**

### **Production Endpoints:**

- **API Backend**: `https://oicar-api-ms1749710600.azurewebsites.net`  
  
  We also had swagger that was enabled for testing the endpoints before production, but we disabled it in production.
- **API Health Check**: `https://oicar-api-ms1749710600.azurewebsites.net/health`  
  
  We can test this to see if the API is running on my Azure.
- **Mobile Web App**: `https://oicar-mobile-app-v3.vercel.app`    
Since this is a React native app, it can also be run on the web. So I have decided to upload it to Vercel also.

- **Web Frontend**   
`https://snjofkalo-ui.vercel.app/items`  
This is our front end for the web.

### **Database:**
- **Azure SQL Server**: `oicar-sql-server-ms1749709920.database.windows.net`
- **Database**: `SnjofkaloDB`
- **Management**: Connect via DBeaver I recommend using DBeaver because our team is cross platform as one developer with me is developing on the Macbook and other are on the Windows machine.

##  **Testing Infrastructure**  

### **Testing Strategy:**
We have 10 API tests that are using XUnit + Moq + FluentAssertions

We also have 8 mobile tests that are using Jest + Jest Expo + React Native Testing Library.

The idea is that the test will run when deploying to production. So, integration tests should run before every deployment and that will protect and block deployment if those tests fail.


### **Test Categories:**

10 API tests:   
- 8 Unit
- - 3 for the AuthCOntroller
- - 5 utility
- 2 Integration 


##  **Quick Start**
This part should help you start the application on your machine.

### **Prerequisites**
- .NET 9.0 SDK
- Node.js 18+ with npm
- Git

### **1. Clone and Setup**
```bash
git clone https://github.com/sokol-matija/OICAR-v2.git
cd OICAR
```

### **2. Run API Locally**
First, we need to run the API locally, cause we will see swagger there. I have made it so swagger opens automatically.
Okay, we need to go into the Shn and because it's a .NET project, we need to first run .NET restore and .NET run.
.NET restore will download all the dependencies. In.NET run will run the API in in local development.
```bash
cd OICAR-v2
cd cd SnjofkaloAPI\ -\ Copy
cd SnjofkaloAPI - Copy/SnjofkaloAPI
cd SnjofkaloAPI/
dotnet restore
dotnet run
# API available at: http://localhost:5042
# Swagger UI: http://localhost:5042/swagger
```

### **3. Run Mobile App Locally** 
Then after we have run the API we'll also run the mobile app.
we go back to the root of the project.
a Then we download all the dependencies and try to start the application
```bash
cd OICAR-MobileApp
npm install
npm start
# Expo development server starts
# Scan QR code with Expo Go app
```
We can also use the command that I preferre 
```
npx expo start
```
We can also use the flag --android to opening directly in our Android emulator 
Also, if we run into any trouble, we can use the following command.
```
npx expo start --clear 
```

### **4. Run Web Frontend **
Then, to test we can also run the web frontend.
We go back to the root of the folder.
In this Angular project we need to use npm install and npm start to download and start the dependency and application.
```bash
cd snjofkalo-ui
npm install
nmp start 
# Web available at: http://localhost:4200/
```

##  **Manual Testing Commands**
For the testing of the application, we can run the test manually. Once we get into the API test directory.

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
