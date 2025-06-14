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
We have 41 API tests that are using XUnit + Moq + FluentAssertions

We also have 17 mobile tests that are using Jest + Jest Expo + React Native Testing Library.

The idea is that the test will run when deploying to production. So, integration tests should run before every deployment and that will protect and block deployment if those tests fail. 


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
npm test -- --coverage         
npm test --passWithNoTests --watchAll=false       
```

## **Development Workflow**

### **Automated Deployment Pipeline:**
Ok, so when we push to github and have made changes in the API, even a command, it will trigger an automated workflow. And when we open the github page and see actions, we can see the build being deployed live and being tested. So that satisfies our requirement for cdci in automatic testing.
and it also deploys the API to my Azure.

### **Deployment Protection:**
So if any build fails because of the test not passing, the deployment will be blocked.

## **Database Connection**

### **Azure SQL Database:**
  **Server**: `oicar-sql-server-ms1749709920.database.windows.net`
  **Database**: `SnjofkaloDB`  
  **Authentication**: SQL Server authentication
  **Encryption**: TLS required

### **Connect with DBeaver:**
Okay, so to connect with the dbeaver you need to put this into the host on the port 1433 and use this database name and also for the authentication it's SQL Server authentication with these credentials. And that's it. So you'll use the database name and the SQL Server login credentials in the connection string for the dbeaver.

oicar-sql-server-ms1749709920.database.windows.net

SnjofkaloDB

sql server auth

username: sqladmin
pw: Ask me 

## Environment Setup

So if you want to run this locally, you'll need to set up some environment variables. I've made it so the API can use different configurations depending on where it's running.

You can create a .env file in the API directory if you want to override the default settings:

```bash
# You can put this in the API folder if needed
DB_SERVER=your-server.database.windows.net
DB_NAME=SnjofkaloDB  
DB_USER=your-username
DB_PASSWORD=your-password
JWT_SECRET_KEY=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

But honestly, for development you probably don't need to mess with this since I've already configured everything to work with our Azure database.



## Common Issues and How to Fix Them

### API Problems:
If the API isn't working, first check if it's actually running:
```bash
curl https://oicar-api-ms1749710600.azurewebsites.net/health
```

If you're running locally and having issues, try this:
```bash
cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
dotnet run --verbosity detailed
```
This will show you more detailed logs so you can see what's going wrong.

### Mobile App Problems:
The mobile app can be tricky sometimes. If it's not working, try clearing everything and starting fresh:
```bash
cd OICAR-MobileApp
rm -rf node_modules package-lock.json
npm install
npx expo start --clear
```

Sometimes Expo gets confused with cached data, so the --clear flag usually fixes most issues.

### Database Connection Issues:
If you can't connect to the database, make sure:
- Your IP is allowed in the Azure SQL firewall (I think I set it to allow all IPs but double check)
- The connection string in appsettings.json is correct
- Try connecting with DBeaver first to make sure the credentials work
- Make sure you're using SSL/TLS connection


---


