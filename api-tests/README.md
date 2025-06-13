# 🧪 OICAR API Testing with Bruno

## 📋 **Overview**

This folder contains **Bruno API collections** for testing the OICAR e-commerce platform API. Bruno is a Git-native API client that stores collections as files, making it perfect for team collaboration.

## 🚀 **Quick Start**

### **1. Install Bruno**
```bash
brew install --cask bruno
```

### **2. Open Bruno Collection**
1. Launch Bruno
2. Click "Open Collection"
3. Navigate to `OICAR/api-tests/` folder
4. Bruno will automatically load all collections

### **3. Select Environment**
- **Local Development**: Select `local` environment
- **Azure Production**: Select `azure` environment

### **4. Run Your First Test**
1. Start with `01-health.bru` to verify API is running
2. Then run `02-auth.bru` to register a test user
3. Follow with `03-auth-login.bru` to login
4. Use `04-auth-me.bru` to verify authentication works

## 📁 **Collection Structure**

```
api-tests/
├── bruno.json                   # Bruno configuration
├── environments/
│   ├── local.bru               # Local development (localhost:5042)
│   └── azure.bru               # Azure production
├── collections/
│   ├── 01-health.bru           # ✅ Health check endpoint
│   ├── 02-auth.bru             # 👤 User registration
│   ├── 03-auth-login.bru       # 🔐 User login
│   ├── 04-auth-me.bru          # 👤 Get current user profile
│   └── 05-items.bru            # 📦 Get items/products
└── README.md                   # This file
```

## 🌐 **Environments**

### **Local Environment**
- **Base URL**: `http://localhost:5042`
- **API URL**: `http://localhost:5042/api`
- **Health**: `http://localhost:5042/health`
- **Swagger**: `http://localhost:5042/swagger`

### **Azure Environment**
- **Base URL**: `https://oicar-api-ms1749710600.azurewebsites.net`
- **API URL**: `https://oicar-api-ms1749710600.azurewebsites.net/api`
- **Health**: `https://oicar-api-ms1749710600.azurewebsites.net/health`
- **Swagger**: `https://oicar-api-ms1749710600.azurewebsites.net/swagger`

## 🧪 **Testing Workflow**

### **Basic Authentication Flow**
1. **Register** (`02-auth.bru`)
   - Creates a new test user
   - Automatically saves JWT token
   - Saves username/password for login tests

2. **Login** (`03-auth-login.bru`)
   - Uses saved credentials
   - Updates JWT token
   - Verifies token format and expiration

3. **Get Profile** (`04-auth-me.bru`)
   - Tests authenticated endpoint
   - Verifies JWT token works
   - Returns user information

### **API Exploration**
4. **Browse Items** (`05-items.bru`)
   - Public endpoint (no auth required)
   - Tests pagination
   - Verifies response structure

## 🔐 **Authentication**

Bruno automatically manages JWT tokens through environment variables:

- `authToken`: Current JWT access token
- `refreshToken`: Refresh token for token renewal
- `testUsername`: Generated test username
- `testPassword`: Test user password

**Token is automatically set** when you run registration or login tests.

## ✅ **Test Assertions**

Each collection includes:
- **Status Code Checks**: Verify 200/201/400/401 responses
- **Response Structure**: Validate JSON structure
- **Data Validation**: Check required fields exist
- **Business Logic**: Verify API behavior

Example:
```javascript
assert {
  res.status: eq 200
  res.body.success: eq true
  res.body.data.token: isDefined
}
```

## 🔄 **Variables & Dynamic Data**

Bruno supports dynamic data:
- `{{$randomInt}}`: Random integer for unique usernames/emails
- `{{authToken}}`: Current authentication token
- `{{apiUrl}}`: Base API URL from environment
- `{{baseUrl}}`: Base application URL

## 🚀 **Team Collaboration**

### **Adding New Tests**
1. Create new `.bru` file in `collections/`
2. Follow naming convention: `##-description.bru`
3. Include documentation in `docs` section
4. Add assertions and tests
5. Commit to Git - team gets updates automatically

### **Sharing Collections**
- Collections are stored as **plain text files**
- **Version controlled** with Git
- **No cloud accounts** needed
- **Everyone gets same collections** when they pull

### **Environment Management**
- Add environment-specific variables to environment files
- Never commit secrets - use local environment variables
- Team members can override with local settings

## 🐛 **Troubleshooting**

### **API Not Responding**
- Check local API is running: `dotnet run` in API folder
- Verify health endpoint: `http://localhost:5042/health`

### **Authentication Failures**
- Run registration test first to create user
- Check token is saved in environment variables
- Verify token hasn't expired (tokens last ~60 minutes)

### **CORS Issues (Local Development)**
- Ensure local API CORS is configured for Bruno requests
- Check API allows `http://localhost` origins

### **Azure Connection Issues**
- Verify Azure API is deployed and healthy
- Check: `https://oicar-api-ms1749710600.azurewebsites.net/health`
- Azure may have cold start delays (wait 30 seconds)

## 📊 **Comparison with Existing Tests**

### **Bruno vs. XUnit Tests**
| Aspect | Bruno (API Testing) | XUnit (Unit Tests) |
|--------|-------------------|-------------------|
| **Purpose** | External API testing | Internal code testing |
| **Environment** | Real HTTP requests | Mocked dependencies |
| **Database** | Real Azure SQL | Mocked/Test DB |
| **Automation** | Manual testing | CI/CD automation |
| **Team Use** | Development & QA | Developer-focused |

### **Complementary Testing**
- **XUnit tests** (keep all 18 tests): Automated quality gates
- **Bruno tests** (add these): Manual API exploration and documentation

## 🎯 **Next Steps**

1. **Start with health check** to verify setup
2. **Test authentication flow** with registration → login → profile
3. **Explore item endpoints** to understand data structure
4. **Add new collections** for specific user stories
5. **Share with team** through Git commits

## 🔧 **Advanced Features**

### **Custom Scripts**
Bruno supports JavaScript in tests:
```javascript
script:post-response {
  if (res.getStatus() === 200) {
    bru.setVar("authToken", res.getBody().data.token);
  }
}
```

### **Environment-Specific Tests**
Different environments can have different assertions:
```javascript
tests {
  test("Response time", function() {
    const maxTime = bru.getEnvVar("environment") === "local" ? 1000 : 5000;
    expect(res.getResponseTime()).to.be.below(maxTime);
  });
}
```

---

## 📞 **Support**

- **Bruno Documentation**: https://docs.usebruno.com/
- **OICAR API Swagger**: `{baseUrl}/swagger`
- **Project Issues**: Create GitHub issue in OICAR repository 