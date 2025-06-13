# 🧪 OICAR Mobile E2E Testing with Maestro

## 📋 **Overview**

This directory contains **Maestro E2E tests** for the OICAR React Native mobile app. These tests provide **complete integration validation** from UI interactions through the .NET API to Azure SQL Database.

## 🎯 **Why These Tests Are Critical**

### **✅ True End-to-End Integration**
```
📱 Real Device/Simulator
    ↓ User interactions (taps, inputs)
📱 React Native UI Components  
    ↓ HTTP requests
🔧 .NET API (Azure App Service)
    ↓ Entity Framework queries
💾 Azure SQL Database
    ↓ Real data persistence
📱 UI updates with real data
```

### **💾 Real Database Impact**
These tests create **actual data** in your Azure SQL Database:
- ✅ **User accounts** in Users table
- ✅ **Shopping cart items** in CartItems table  
- ✅ **Complete orders** in Orders table
- ✅ **Authentication logs** in Logs table

## 📁 **Test Structure**

```
.maestro/
├── 00-complete-user-journey.yaml    # 🚀 Master test (full flow)
├── 01-registration-flow.yaml        # 👤 User account creation
├── 02-login-flow.yaml              # 🔐 Authentication testing
├── 03-item-browsing-flow.yaml      # 📦 Product discovery
├── 04-add-to-cart-flow.yaml        # 🛒 Shopping cart operations
├── 05-complete-purchase-flow.yaml  # 💳 Full e-commerce transaction
├── 06-logout-flow.yaml             # 🚪 Session termination
└── README.md                       # This documentation
```

## 🚀 **Quick Start**

### **Prerequisites**
1. **Maestro installed**: ✅ Already installed via curl script
2. **Mobile app running**: Start Expo development server
3. **API accessible**: Ensure Azure API is running and healthy

### **Start Your Mobile App**
```bash
# In OICAR-MobileApp directory
npm start
# Choose your testing platform:
# - Press 'i' for iOS Simulator
# - Press 'a' for Android Emulator  
# - Scan QR code for physical device
```

### **Run Your First E2E Test**
```bash
# Navigate to mobile app directory
cd OICAR-MobileApp

# Run complete user journey (recommended first test)
maestro test .maestro/00-complete-user-journey.yaml

# Run individual test flows
maestro test .maestro/01-registration-flow.yaml
maestro test .maestro/02-login-flow.yaml
```

## 🧪 **Test Descriptions**

### **🚀 00-complete-user-journey.yaml**
**Duration**: 5-10 minutes  
**Purpose**: Complete OICAR user experience validation
```yaml
Registration → Login → Browse → Add to Cart → Purchase → Logout
```
**Database Impact**: Creates user, cart items, order records

### **👤 01-registration-flow.yaml**  
**Duration**: 1-2 minutes  
**Purpose**: User account creation and initial authentication
```yaml
Form filling → API validation → JWT token → User dashboard
```
**Database Impact**: New user record in Users table

### **🔐 02-login-flow.yaml**
**Duration**: 30-60 seconds  
**Purpose**: Authentication flow with existing credentials
```yaml
Login form → JWT validation → Session establishment → Protected routes
```
**Database Impact**: Authentication logs, session tracking

### **📦 03-item-browsing-flow.yaml**
**Duration**: 1-2 minutes  
**Purpose**: Product discovery and search functionality
```yaml
Item loading → Search → Filter → Category browsing → Item details
```
**Database Impact**: Query logs, search analytics

### **🛒 04-add-to-cart-flow.yaml**
**Duration**: 1-2 minutes  
**Purpose**: Shopping cart operations and state management
```yaml
Add items → Quantity adjustment → Remove items → Cart persistence
```
**Database Impact**: Cart items in CartItems table

### **💳 05-complete-purchase-flow.yaml**
**Duration**: 2-3 minutes  
**Purpose**: Full e-commerce transaction flow
```yaml
Checkout → Shipping → Payment → Order confirmation → Order history
```
**Database Impact**: Order records, payment logs, order items

### **🚪 06-logout-flow.yaml**
**Duration**: 30 seconds  
**Purpose**: Session termination and security cleanup
```yaml
Logout → JWT invalidation → UI state reset → Protected route restrictions
```
**Database Impact**: Session termination logs

## 🔧 **Running Tests**

### **Individual Test Execution**
```bash
# Run specific test with detailed output
maestro test .maestro/01-registration-flow.yaml --debug

# Run test with screenshot on failure
maestro test .maestro/02-login-flow.yaml --output screenshots/

# Run test with performance monitoring
maestro test .maestro/03-item-browsing-flow.yaml --timing
```

### **Batch Test Execution**
```bash
# Run all tests in sequence
maestro test .maestro/

# Run tests with report generation
maestro test .maestro/ --format junit --output test-results.xml
```

### **Continuous Testing**
```bash
# Watch mode (re-run on file changes)
maestro test .maestro/01-registration-flow.yaml --watch

# Scheduled testing (every 30 minutes)
watch -n 1800 maestro test .maestro/00-complete-user-journey.yaml
```

## 📊 **Integration with Your Testing Stack**

### **Current Testing Architecture**
```
🔺 E2E Mobile Tests (NEW - Maestro)
   ├─ Complete user workflows
   ├─ Real device interaction
   └─ Full stack integration

🔻 API Integration Tests (Bruno)
   ├─ HTTP endpoint validation  
   ├─ Real Azure SQL integration
   └─ Authentication flows

🔻 Component Tests (Jest - 8 tests)
   ├─ React Native UI logic
   ├─ Utility functions
   └─ Isolated component behavior

🔻 Unit Tests (XUnit - 10 tests)
   ├─ .NET business logic
   ├─ Service layer validation
   └─ Fast feedback loops
```

### **Testing Overlap Analysis**
| Test Aspect | XUnit | Jest | Bruno | Maestro |
|-------------|-------|------|-------|---------|
| **UI Interaction** | ❌ | ✅ Mocked | ❌ | ✅ Real |
| **API Calls** | ❌ Mocked | ❌ | ✅ Real | ✅ Real |
| **Database** | ❌ Mocked | ❌ | ✅ Azure SQL | ✅ Azure SQL |
| **User Flows** | ❌ | ❌ | ❌ | ✅ Complete |
| **Performance** | ❌ | ❌ | 📊 Response time | 📊 Full app |

## 🚨 **Database Management**

### **Test Data Lifecycle**
```bash
# Before running tests
1. Tests create NEW users with random usernames
2. No conflict with existing production data
3. Test orders use test payment methods

# After running tests  
1. Test user accounts remain in database
2. Test orders marked as "test" transactions
3. Consider periodic cleanup of test data
```

### **Test Data Cleanup (Optional)**
```sql
-- Clean up test users (run periodically)
DELETE FROM Users 
WHERE Username LIKE 'testuser_%' 
   OR Username LIKE 'e2euser_%'
   AND CreatedAt < DATEADD(day, -7, GETDATE());

-- Clean up test orders
DELETE FROM Orders 
WHERE CustomerEmail LIKE '%@example.com'
   OR CustomerEmail LIKE '%@oicar.com'
   AND CreatedAt < DATEADD(day, -7, GETDATE());
```

## 🔍 **Debugging & Troubleshooting**

### **Common Issues**

#### **❌ "App not found"**
```bash
# Ensure mobile app is running
npm start  # In OICAR-MobileApp directory

# Check app is detected by Maestro
maestro hierarchy
```

#### **❌ "Element not found"**
```bash
# Run with debug mode to see UI hierarchy
maestro test .maestro/01-registration-flow.yaml --debug

# Take screenshot to verify UI state  
maestro test .maestro/01-registration-flow.yaml --output debug/
```

#### **❌ "API timeout"**
```bash
# Verify Azure API is healthy
curl https://oicar-api-ms1749710600.azurewebsites.net/health

# Check mobile app API configuration
cat OICAR-MobileApp/config.ts
```

#### **❌ "Authentication failures"**
```bash
# Run registration test first to create user
maestro test .maestro/01-registration-flow.yaml

# Then run login test
maestro test .maestro/02-login-flow.yaml
```

### **Performance Optimization**
```bash
# Run tests on faster emulator
# iOS Simulator typically faster than Android

# Use local API for faster tests (development)
# Update config.ts to point to localhost:5042

# Parallel test execution (advanced)
maestro test .maestro/01-registration-flow.yaml &
maestro test .maestro/03-item-browsing-flow.yaml &
wait
```

## 📈 **CI/CD Integration (Future)**

### **GitHub Actions Example**
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Mobile Tests
on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd OICAR-MobileApp
          npm install
          
      - name: Install Maestro
        run: curl -Ls "https://get.maestro.mobile.dev" | bash
        
      - name: Start iOS Simulator
        run: xcrun simctl boot "iPhone 14"
        
      - name: Build and start app
        run: |
          cd OICAR-MobileApp
          npx expo start --ios &
          
      - name: Wait for app to load
        run: sleep 30
        
      - name: Run E2E tests
        run: |
          cd OICAR-MobileApp
          ~/.maestro/bin/maestro test .maestro/
          
      - name: Upload test results
        uses: actions/upload-artifact@v3
        with:
          name: e2e-test-results
          path: test-results/
```

## 🎯 **Success Metrics**

### **Test Coverage Achieved**
- ✅ **100% core user flows** (registration → purchase → logout)
- ✅ **Real integration validation** (UI → API → Database)
- ✅ **Cross-platform testing** (iOS + Android support)
- ✅ **Performance monitoring** (response times, app performance)

### **Quality Gates**
- ✅ **No test failures** = App ready for release
- ✅ **All database operations successful** = Data integrity verified
- ✅ **Complete user journeys working** = User experience validated
- ✅ **Authentication security verified** = Security requirements met

---

## 📞 **Support & Resources**

- **Maestro Documentation**: https://maestro.mobile.dev/
- **OICAR API Health**: https://oicar-api-ms1749710600.azurewebsites.net/health
- **Mobile App Config**: `OICAR-MobileApp/config.ts`
- **API Documentation**: `{API_URL}/swagger`

## 🚀 **Next Steps**

1. **Run your first test**: `maestro test .maestro/00-complete-user-journey.yaml`
2. **Verify database impact**: Check Azure SQL for new test records
3. **Add custom tests**: Create flows for your specific business logic
4. **CI/CD integration**: Add to GitHub Actions pipeline

**You now have complete E2E testing for the OICAR mobile application!** 🎉 