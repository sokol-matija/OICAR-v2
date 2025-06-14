# OICAR Functional Specification Document

Version: 1.0  
Date: December 2024  
Author: Development Team  
Status: Final

---

## Table of Contents

1. [Overview](#overview)
2. [Solution Scope](#solution-scope)
3. [System Actors](#system-actors)
4. [Assumptions and Dependencies](#assumptions-and-dependencies)
5. [First User-Facing Application (Mobile App)](#first-user-facing-application-mobile-app)
6. [Second User-Facing Application (Web Portal)](#second-user-facing-application-web-portal)
7. [Non-Functional Requirements](#non-functional-requirements)
8. [Data Privacy and Security](#data-privacy-and-security)

---

## Overview

### Project Description
OICAR is a modern e-commerce platform designed to provide seamless online shopping experiences across multiple digital touchpoints. The system consists of a mobile application for customers, a web portal for administrators, and a robust API backend supporting both applications.

### Business Objectives
- Create a user-friendly mobile shopping experience
- Provide comprehensive administrative tools for business management
- Ensure secure, GDPR-compliant data handling
- Enable scalable, cloud-based e-commerce operations

### Target Audience
- Primary: Mobile-first consumers seeking modern shopping experiences
- Secondary: Business administrators managing e-commerce operations
- Tertiary: Developers integrating with OICAR APIs

---

## Solution Scope

### In Scope
Mobile Customer Application (React Native/Expo)
- Product browsing and search
- Shopping cart management
- Order placement and tracking
- User account management
- Payment processing integration

Web Administrative Portal (ASP.NET)
- Product catalog management
- Order fulfillment workflows
- Customer service tools
- Analytics and reporting
- User management

Backend API (.NET 9.0)
- RESTful web services
- Database integration
- Authentication and authorization
- Payment gateway integration
- Real-time notifications

Cloud Infrastructure (Microsoft Azure)
- Database hosting (Azure SQL)
- Application hosting (App Service)
- CDN distribution
- Security monitoring

### Out of Scope
- Physical inventory management  
- Third-party marketplace integrations  
- Advanced analytics/ML recommendations  
- Multi-language internationalization  
- Cryptocurrency payment options

---

## System Actors

### 1. Customer
Role: End-user purchasing products through mobile application  
Responsibilities:
- Browse and search products
- Manage shopping cart
- Place and track orders
- Manage personal account
- Provide product reviews

Access Level: Standard user authentication

### 2. Administrator
Role: Business user managing e-commerce operations  
Responsibilities:
- Manage product catalog
- Process orders and fulfillment
- Handle customer service inquiries
- Generate business reports
- Configure system settings

Access Level: Elevated administrative privileges

### 3. API Consumer
Role: External systems or developers integrating with OICAR  
Responsibilities:
- Consume REST API endpoints
- Handle authentication tokens
- Process API responses
- Implement error handling

Access Level: API key-based authentication

### 4. System
Role: Automated processes and background services  
Responsibilities:
- Process scheduled tasks
- Send notifications
- Generate reports
- Maintain data integrity
- Execute business rules

Access Level: System-level privileges

---

## Assumptions and Dependencies

### Technical Assumptions
- Users have modern mobile devices (iOS 12+, Android 8+)
- Reliable internet connectivity for real-time features
- JavaScript enabled in web browsers
- Azure cloud services remain available and stable

### Business Assumptions
- Payment gateway partnerships established
- Product catalog data provided by business team
- Customer support processes defined
- Legal compliance requirements documented

### External Dependencies
- Payment Processing: Stripe/PayPal integration
- Email Services: SendGrid for transactional emails
- Cloud Hosting: Microsoft Azure infrastructure
- CDN Services: Azure CDN for content delivery
- Security Services: Azure Security Center

### Internal Dependencies
- Database schema design and implementation
- API development and testing completion
- UI/UX design system establishment
- DevOps pipeline configuration
- Security audit and penetration testing

---

## First User-Facing Application (Mobile App)

### FR-M01: User Authentication
Priority: High  
Description: Users must be able to create accounts, log in, and manage authentication

Detailed Requirements:
- FR-M01.1: Registration with email/password
- FR-M01.2: Login with existing credentials
- FR-M01.3: Password reset functionality
- FR-M01.4: Account verification via email
- FR-M01.5: Logout and session management
- FR-M01.6: Remember login preferences

Acceptance Criteria:
- New users can register with valid email
- Existing users can login successfully
- Password reset sends email within 5 minutes
- Sessions expire after 30 days of inactivity

### FR-M02: Product Browsing
Priority: High  
Description: Users must be able to browse and search for products

Detailed Requirements:
- FR-M02.1: Display featured products on home screen
- FR-M02.2: Browse products by category
- FR-M02.3: Search products by keyword
- FR-M02.4: Filter products by price, rating, availability
- FR-M02.5: Sort products by price, popularity, newest
- FR-M02.6: View detailed product information
- FR-M02.7: Display product images and descriptions

Acceptance Criteria:
- Product search returns results within 2 seconds
- Category browsing loads within 1 second
- Product details include images, price, description, reviews
- Filters apply immediately without page refresh

### FR-M03: Shopping Cart Management
Priority: High  
Description: Users must be able to manage items in their shopping cart

Detailed Requirements:
- **FR-M03.1**: Add products to cart with quantity selection
- **FR-M03.2**: View cart contents and total price
- **FR-M03.3**: Update item quantities in cart
- **FR-M03.4**: Remove items from cart
- **FR-M03.5**: Save cart for later (persistent cart)
- **FR-M03.6**: Apply discount codes/coupons
- **FR-M03.7**: Calculate shipping costs

**Acceptance Criteria**:
- Cart updates reflect immediately in UI
- Cart persists across app sessions
- Price calculations are accurate including tax/shipping
- Discount codes validate and apply correctly

### **FR-M04: Order Management**
**Priority**: High  
**Description**: Users must be able to place and track orders

**Detailed Requirements**:
- **FR-M04.1**: Checkout process with shipping information
- **FR-M04.2**: Payment processing integration
- **FR-M04.3**: Order confirmation and receipt
- **FR-M04.4**: View order history
- **FR-M04.5**: Track order status and shipping
- **FR-M04.6**: Cancel orders (if not shipped)
- **FR-M04.7**: Reorder previous purchases

**Acceptance Criteria**:
- Checkout completes within 3 clicks
- Payment processing succeeds with valid cards
- Order confirmation sent via email immediately
- Order tracking updates in real-time

### **FR-M05: User Profile Management**
**Priority**: Medium  
**Description**: Users must be able to manage their personal information

**Detailed Requirements**:
- **FR-M05.1**: Edit personal information (name, email, phone)
- **FR-M05.2**: Manage shipping addresses
- **FR-M05.3**: Update payment methods
- **FR-M05.4**: Set notification preferences
- **FR-M05.5**: View account activity history
- **FR-M05.6**: Delete account (GDPR compliance)

**Acceptance Criteria**:
- Profile updates save successfully
- Multiple shipping addresses supported
- Payment methods stored securely
- Account deletion removes all personal data

---

## 💻 Second User-Facing Application (Web Portal)

### **FR-W01: Administrative Authentication**
**Priority**: High  
**Description**: Administrators must have secure access to management functions

**Detailed Requirements**:
- **FR-W01.1**: Admin login with role-based access
- **FR-W01.2**: Multi-factor authentication (MFA)
- **FR-W01.3**: Session timeout for security
- **FR-W01.4**: Audit logging of admin actions
- **FR-W01.5**: Password complexity requirements
- **FR-W01.6**: Account lockout after failed attempts

**Acceptance Criteria**:
- Only authorized users can access admin portal
- MFA required for sensitive operations
- All admin actions logged with timestamps
- Sessions expire after 60 minutes of inactivity

### **FR-W02: Product Catalog Management**
**Priority**: High  
**Description**: Administrators must be able to manage the product catalog

**Detailed Requirements**:
- **FR-W02.1**: Add new products with details and images
- **FR-W02.2**: Edit existing product information
- **FR-W02.3**: Set product pricing and inventory levels
- **FR-W02.4**: Organize products into categories
- **FR-W02.5**: Enable/disable product availability
- **FR-W02.6**: Bulk import/export product data
- **FR-W02.7**: Schedule product promotions

**Acceptance Criteria**:
- Product changes reflect on mobile app within 5 minutes
- Image uploads support multiple formats (JPG, PNG, WebP)
- Bulk operations handle up to 1000 products
- Category hierarchies support unlimited depth

### **FR-W03: Order Processing**
**Priority**: High  
**Description**: Administrators must be able to manage customer orders

**Detailed Requirements**:
- **FR-W03.1**: View all incoming orders in real-time
- **FR-W03.2**: Update order status (processing, shipped, delivered)
- **FR-W03.3**: Generate shipping labels and tracking numbers
- **FR-W03.4**: Process refunds and returns
- **FR-W03.5**: Send customer notifications
- **FR-W03.6**: Generate order reports
- **FR-W03.7**: Handle order cancellations

**Acceptance Criteria**:
- New orders appear immediately in dashboard
- Status updates trigger customer notifications
- Refund processing completes within 24 hours
- Reports generate accurate data for specified date ranges

### **FR-W04: Customer Management**
**Priority**: Medium  
**Description**: Administrators must be able to manage customer accounts

**Detailed Requirements**:
- **FR-W04.1**: View customer profiles and order history
- **FR-W04.2**: Handle customer service inquiries
- **FR-W04.3**: Reset customer passwords
- **FR-W04.4**: Suspend/activate customer accounts
- **FR-W04.5**: Export customer data (GDPR requests)
- **FR-W04.6**: Process account deletion requests
- **FR-W04.7**: Generate customer analytics

**Acceptance Criteria**:
- Customer search returns results within 1 second
- Data exports complete within 10 minutes
- Account actions take effect immediately
- Analytics update daily at midnight

### **FR-W05: Business Analytics**
**Priority**: Medium  
**Description**: Administrators must have access to business insights and reports

**Detailed Requirements**:
- **FR-W05.1**: Sales performance dashboards
- **FR-W05.2**: Revenue and profit reports
- **FR-W05.3**: Product performance analytics
- **FR-W05.4**: Customer behavior insights
- **FR-W05.5**: Inventory level monitoring
- **FR-W05.6**: Export reports to PDF/Excel
- **FR-W05.7**: Schedule automated reports

**Acceptance Criteria**:
- Dashboards load within 3 seconds
- Reports reflect data up to previous day
- Exports include all filtered data
- Scheduled reports deliver via email

---

## ⚡ Non-Functional Requirements

### **Performance Requirements**
- **Response Time**: API responses < 200ms for 95% of requests
- **Throughput**: Support 1000 concurrent users
- **Mobile App**: App launch time < 3 seconds
- **Web Portal**: Page load time < 2 seconds
- **Database**: Query execution < 100ms average

### **Scalability Requirements**
- **Horizontal Scaling**: Auto-scale based on load
- **Database**: Handle 100,000+ products
- **Storage**: Support unlimited product images
- **Users**: Accommodate 50,000+ registered users
- **Orders**: Process 10,000+ daily transactions

### **Security Requirements**
- **Data Encryption**: TLS 1.3 for all data transmission
- **Authentication**: JWT tokens with 1-hour expiration
- **Authorization**: Role-based access control (RBAC)
- **Data Storage**: AES-256 encryption at rest
- **API Security**: Rate limiting and request validation
- **Compliance**: GDPR, PCI DSS compliance

### **Reliability Requirements**
- **Uptime**: 99.9% availability (< 8.76 hours downtime/year)
- **Backup**: Daily automated database backups
- **Recovery**: RTO < 4 hours, RPO < 1 hour
- **Monitoring**: 24/7 system health monitoring
- **Error Handling**: Graceful degradation of services

### **Usability Requirements**
- **Mobile App**: Intuitive navigation requiring no training
- **Web Portal**: Professional interface for business users
- **Accessibility**: WCAG 2.1 AA compliance
- **Languages**: English primary, extensible for localization
- **Documentation**: Complete user and technical guides

### **Compatibility Requirements**
- **Mobile**: iOS 12+, Android 8+ (API level 26+)
- **Web Browsers**: Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **API**: RESTful design following OpenAPI 3.0 specification
- **Database**: SQL Server 2019+ compatibility

---

## 🔒 Data Privacy and Security

### **Personal Data Collection**
**Scope**: Collection of user information necessary for e-commerce operations

**Data Types Collected**:
- **Account Information**: Name, email address, phone number
- **Shipping Information**: Delivery addresses, contact details
- **Payment Information**: Credit card details (tokenized)
- **Behavioral Data**: Purchase history, browsing patterns
- **Technical Data**: Device information, IP addresses, cookies

**Legal Basis for Collection**:
- **Contract Performance**: Order fulfillment and customer service
- **Legitimate Interest**: Fraud prevention and system security
- **Consent**: Marketing communications and analytics

### **Personal Data Storage**
**Security Measures**:
- **Encryption**: AES-256 encryption for data at rest
- **Access Control**: Role-based permissions with principle of least privilege
- **Data Segregation**: Separate environments for production/testing
- **Backup Security**: Encrypted backups with limited retention
- **Geographic Location**: Data stored in EU-compliant Azure regions

**Retention Policies**:
- **Active Accounts**: Data retained while account is active
- **Inactive Accounts**: Data deleted after 3 years of inactivity
- **Payment Data**: Tokenized data retained per PCI requirements
- **Legal Requirements**: Some data retained for tax/compliance purposes

### **Personal Data Access**
**User Rights**:
- **Access**: Users can request copy of their personal data
- **Rectification**: Users can update incorrect personal information
- **Portability**: Users can export their data in machine-readable format
- **Restriction**: Users can limit processing of their data
- **Objection**: Users can object to certain data processing activities

**Administrative Access**:
- **Customer Service**: Limited access for order support
- **Technical Support**: Access restricted to troubleshooting
- **Management**: Aggregated data only, no individual profiles
- **Audit Logging**: All access logged with user identification

### **Personal Data Security**
**Technical Safeguards**:
- **Transport Security**: TLS 1.3 encryption for all data transmission
- **Application Security**: Input validation, SQL injection prevention
- **Authentication**: Multi-factor authentication for admin access
- **Session Management**: Secure session handling with timeout
- **API Security**: Rate limiting, request signing, CORS protection

**Operational Safeguards**:
- **Staff Training**: Regular privacy and security training
- **Background Checks**: Verification for employees with data access
- **Incident Response**: Documented procedures for data breaches
- **Third-Party Audits**: Annual security assessments
- **Vulnerability Management**: Regular security scanning and patching

### **Right to be Forgotten**
**Implementation**:
- **Account Deletion**: Complete removal of personal data
- **Data Anonymization**: Conversion of data to anonymous form
- **Backup Removal**: Deletion from all backup systems
- **Third-Party Notification**: Informing processors of deletion requests
- **Verification**: Confirmation process for deletion completion

**Process**:
1. **Request Submission**: User submits deletion request via app/web
2. **Identity Verification**: Confirm user identity before processing
3. **Legal Review**: Ensure no legal obligations require data retention
4. **Data Mapping**: Identify all systems containing user data
5. **Deletion Execution**: Remove data from all identified systems
6. **Confirmation**: Notify user of successful deletion

**Timeline**: Deletion completed within 30 days of verified request

---

## 📋 Appendices

### **Glossary**
- **API**: Application Programming Interface
- **GDPR**: General Data Protection Regulation
- **JWT**: JSON Web Token
- **PCI DSS**: Payment Card Industry Data Security Standard
- **RBAC**: Role-Based Access Control
- **REST**: Representational State Transfer
- **TLS**: Transport Layer Security

### **References**
- [React Native Documentation](https://reactnative.dev/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [GDPR Compliance Guide](https://gdpr.eu/)

---

*Document Version: 1.0*  
*Last Updated: December 2024*  
*Next Review: Q2 2025* 