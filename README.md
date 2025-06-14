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

## **User Demo Videos**

Here are some quick demos showing how the app works in real life:

### **Web Marketplace Demo**
![OICAR Web Marketplace](CleanShot-Vivaldi-Snjofkalo%20Marketplace%20-%20Vivaldi-at.2025-06-14.gif)
*Web platform: Login → Browse marketplace → Secure shopping experience*

### **Mobile App User Journey**
![OICAR Mobile Demo](CleanShot-qemu-system-aarch64-Android%20Emulator%20-%20Medium_Phone_API_365554-at.2025-06-14.gif)
*Mobile app: Registration → Login → Browse Items → Add to Cart → Complete user experience*

*These GIFs show the actual user interface and user flows of both our web and mobile platforms.*

### **Admin Web Portal Demo** 
## **Google API Integration**

We've integrated Google services for enhanced functionality. You can download our Google API configuration and documentation:

**[Download Google API Setup Guide](https://drive.google.com/your-link-here)**

This includes:
- Google Maps integration for delivery tracking
- Google Authentication setup
- Google Cloud Storage configuration
- API keys and configuration examples

*Note: Replace the Google Drive link above with your actual download link.*

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

##  **Running Tests Manually**

So we have three different types of tests that you can run to make sure everything is working properly. Let me walk you through how to run each one.

### **API Tests (Unit & Integration):**
These test our .NET backend to make sure all the endpoints work correctly and the business logic is solid.
```bash
cd SnjofkaloAPI.Tests
dotnet test                           # Run all 41 tests
dotnet test --verbosity detailed      # See detailed output with more info
dotnet test --filter "AuthController" # Run just the authentication tests
dotnet test --logger "console;verbosity=detailed" # Even more detailed logging
```

The API tests are pretty fast - they usually finish in under a second. If any fail, you'll see exactly which test broke and why.

### **Mobile Tests (Jest + React Native):**
These test our React Native mobile app components and utilities to make sure the UI works correctly.
```bash
cd OICAR-MobileApp
npm test -- --watchAll=false          # Run all 17 mobile tests once
npm test -- --watch                   # Run tests and watch for changes
npm test -- --coverage                # Run tests and show code coverage
npm test --passWithNoTests --watchAll=false # Run even if no test files found
```

The mobile tests take a bit longer - usually around 3-4 seconds. They test things like user authentication, cart functionality, and API integration.

### **End-to-End Tests (Maestro):**
These are the really cool tests that actually simulate a real user using the app. They test the complete user journey from registration to checkout.
```bash
cd OICAR-MobileApp
./run-e2e-tests.sh                    # Run all 6 E2E test flows
```

The E2E tests take the longest - about 2-3 minutes total - because they're actually clicking through the app like a real user would. They test:
- User registration and login
- Browsing items and searching
- Adding items to cart
- Complete checkout process
- User logout

These tests are really valuable because they catch issues that unit tests might miss. They actually create real data in our Azure database, so you know the whole system is working together properly.

### **Viewing Test Results:**
When you run tests locally, you'll see the results right in your terminal. But if you want to see how tests run in our CI/CD pipeline, you can check the GitHub Actions tab in our repository. Every time we push code, all tests run automatically and you can see the live results there.

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

## Building APK for Android

So if you want to create an actual APK file that you can install on Android devices, here's how to do it. This is useful if you want to share the app with someone or test it on a real device without going through the app store.

First, make sure you're in the mobile app directory:
```bash
cd OICAR-MobileApp
```

Then you can build the APK using EAS Build, which is Expo's cloud build service:
```bash
npx eas build --platform android --profile preview
```

This will upload your code to Expo's servers and build the APK for you. It takes a few minutes, but when it's done you'll get a download link for the APK file.

If you don't have EAS CLI installed, you might need to install it first:
```bash
npm install -g @expo/eas-cli
```

The build process will ask you to log in to your Expo account if you haven't already. Once the build is complete, you can download the APK and install it on any Android device.

Just keep in mind that this creates a development build, so it's not optimized for production. But it's perfect for testing and sharing with your team.

## **Download Latest APK**

### **Direct APK Download:**
**Latest Version (v3)**: https://expo.dev/artifacts/eas/9rxozu3ceYzmH9Qq8LMzwo.apk

This APK can be installed directly on any Android device. Just download and install it to test the app without needing the Play Store.

### **Google Drive Backup:**

https://drive.google.com/drive/folders/1J2PYLjEgZNwkMuWmLByXAmeFHYRVgZqW?usp=sharing


