-- OICAR Database Schema Update for DBeaver
-- Drop old tables first, then create new schema

-- Drop existing tables (in correct order to handle foreign keys)
IF OBJECT_ID('CartItem', 'U') IS NOT NULL DROP TABLE CartItem;
IF OBJECT_ID('OrderItem', 'U') IS NOT NULL DROP TABLE OrderItem;
IF OBJECT_ID('ItemImage', 'U') IS NOT NULL DROP TABLE ItemImage;
IF OBJECT_ID('Order', 'U') IS NOT NULL DROP TABLE [Order];
IF OBJECT_ID('Item', 'U') IS NOT NULL DROP TABLE Item;
IF OBJECT_ID('ItemCategory', 'U') IS NOT NULL DROP TABLE ItemCategory;
IF OBJECT_ID('Cart', 'U') IS NOT NULL DROP TABLE Cart;
IF OBJECT_ID('Status', 'U') IS NOT NULL DROP TABLE [Status];
IF OBJECT_ID('Tag', 'U') IS NOT NULL DROP TABLE Tag;
IF OBJECT_ID('User', 'U') IS NOT NULL DROP TABLE [User];
IF OBJECT_ID('Logs', 'U') IS NOT NULL DROP TABLE Logs;

-- User table with increased column sizes for encrypted data
CREATE TABLE [User] (
    IDUser INT PRIMARY KEY IDENTITY(1,1),
    -- Encrypted fields - increased sizes to accommodate Base64 + ENC: prefix
    Username NVARCHAR(200) NOT NULL,           -- Was VARCHAR(50), now 200 for encryption
    FirstName NVARCHAR(200) NOT NULL,          -- Was VARCHAR(100), now 200 for encryption
    LastName NVARCHAR(200) NOT NULL,           -- Was VARCHAR(100), now 200 for encryption
    Email NVARCHAR(500) NOT NULL,              -- Was VARCHAR(254), now 500 for encryption
    PhoneNumber NVARCHAR(100) NULL,            -- Was VARCHAR(20), now 100 for encryption
    
    -- Non-encrypted fields
    PasswordHash NVARCHAR(255) NOT NULL,
    IsAdmin BIT NOT NULL DEFAULT 0,
    PasswordSalt VARBINARY(1024) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    LastLoginAt DATETIME2 NULL,
    FailedLoginAttempts INT NOT NULL DEFAULT 0,
    
    -- GDPR Anonymization Request Fields
    RequestedAnonymization BIT NOT NULL DEFAULT 0,
    AnonymizationRequestDate DATETIME2 NULL,
    AnonymizationReason NVARCHAR(1000) NULL,
    AnonymizationNotes NVARCHAR(1000) NULL,
    
    CONSTRAINT UQ_User_Email UNIQUE (Email),
    CONSTRAINT UQ_User_Username UNIQUE (Username),
    CONSTRAINT CK_User_AnonymizationRequest 
        CHECK (
            (RequestedAnonymization = 0 AND AnonymizationRequestDate IS NULL) OR
            (RequestedAnonymization = 1 AND AnonymizationRequestDate IS NOT NULL)
        )
);

CREATE TABLE [Status] (
    IDStatus INT PRIMARY KEY IDENTITY(1,1),
    [Name] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_Status_Name UNIQUE ([Name])
);

CREATE TABLE ItemCategory (
    IDItemCategory INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(100) NOT NULL,
    [Description] VARCHAR(500) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_ItemCategory_Name UNIQUE (CategoryName)
);

CREATE TABLE Item (
    IDItem INT PRIMARY KEY IDENTITY(1,1),
    ItemCategoryID INT NOT NULL,
    
    -- Seller Information (NULL for admin-created items, UserID for user-created items)
    SellerUserID INT NULL,                      -- Who is selling this item
    
    Title VARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX) NOT NULL,
    StockQuantity INT NOT NULL DEFAULT 0,
    Price DECIMAL(10, 2) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,
    
    -- Marketplace Features
    IsApproved BIT NOT NULL DEFAULT 1,          -- Admin approval for user-listed items
    ApprovedByAdminID INT NULL,                 -- Which admin approved the item
    ApprovalDate DATETIME2 NULL,               -- When was it approved
    RejectionReason NVARCHAR(500) NULL,        -- Why was it rejected (if applicable)
    
    -- Item Status for User Items
    ItemStatus VARCHAR(20) NOT NULL DEFAULT 'Active',  -- Active, Pending, Rejected, Sold, Removed
    
    -- Commission and Fees (for user-sold items)
    CommissionRate DECIMAL(5, 4) NULL,         -- Platform commission (e.g., 0.0500 = 5%)
    PlatformFee DECIMAL(10, 2) NULL,           -- Fixed platform fee per sale
    
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    FOREIGN KEY (ItemCategoryID) REFERENCES ItemCategory(IDItemCategory),
    FOREIGN KEY (SellerUserID) REFERENCES [User](IDUser),
    FOREIGN KEY (ApprovedByAdminID) REFERENCES [User](IDUser),
    
    CONSTRAINT CK_Item_Price_Positive CHECK (Price >= 0),
    CONSTRAINT CK_Item_Stock_NonNegative CHECK (StockQuantity >= 0),
    CONSTRAINT CK_Item_CommissionRate CHECK (CommissionRate IS NULL OR (CommissionRate >= 0 AND CommissionRate <= 1)),
    CONSTRAINT CK_Item_PlatformFee CHECK (PlatformFee IS NULL OR PlatformFee >= 0),
    CONSTRAINT CK_Item_ItemStatus CHECK (ItemStatus IN ('Active', 'Pending', 'Rejected', 'Sold', 'Removed', 'Draft')),
    
    CONSTRAINT CK_Item_ApprovalLogic CHECK (
        (SellerUserID IS NULL AND IsApproved = 1) OR  -- Admin items are always approved
        (SellerUserID IS NOT NULL)                    -- User items can be approved or not
    )
);

CREATE TABLE CartItem (
    IDCartItem INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    AddedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (UserID) REFERENCES [User](IDUser) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item(IDItem) ON DELETE CASCADE,
    CONSTRAINT UQ_CartItem_UserID_ItemID UNIQUE (UserID, ItemID),
    CONSTRAINT CK_CartItem_Quantity_Positive CHECK (Quantity > 0)
);

-- Order table with increased sizes for encrypted address fields
CREATE TABLE [Order] (
    IDOrder INT PRIMARY KEY IDENTITY(1,1),
    OrderNumber VARCHAR(50) NOT NULL,
    UserID INT NOT NULL,
    StatusID INT NOT NULL,
    OrderDate DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    -- Encrypted fields - increased sizes to accommodate encryption
    ShippingAddress NVARCHAR(1500) NULL,
    BillingAddress NVARCHAR(1500) NULL,
    
    OrderNotes NVARCHAR(1000) NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (StatusID) REFERENCES [Status](IDStatus),
    FOREIGN KEY (UserID) REFERENCES [User](IDUser),
    CONSTRAINT UQ_Order_OrderNumber UNIQUE (OrderNumber)
);

CREATE TABLE OrderItem (
    IDOrderItem INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    PriceAtOrder DECIMAL(10, 2) NOT NULL,
    ItemTitle VARCHAR(200) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FOREIGN KEY (ItemID) REFERENCES Item(IDItem),
    FOREIGN KEY (OrderID) REFERENCES [Order](IDOrder) ON DELETE CASCADE,
    CONSTRAINT CK_OrderItem_Quantity_Positive CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItem_Price_NonNegative CHECK (PriceAtOrder >= 0)
);

CREATE TABLE ItemImage (
    IDItemImage INT PRIMARY KEY IDENTITY(1,1),
    ItemID INT NOT NULL,
    ImageData NVARCHAR(MAX) NOT NULL,           -- Base64 string
    ImageOrder INT NOT NULL DEFAULT 0,          -- Order for displaying images
    FileName NVARCHAR(255) NULL,                -- Original filename (optional)
    ContentType NVARCHAR(100) NULL,             -- MIME type (e.g., image/jpeg)
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    
    FOREIGN KEY (ItemID) REFERENCES Item(IDItem) ON DELETE CASCADE,
    
    CONSTRAINT CK_ItemImage_Order_NonNegative CHECK (ImageOrder >= 0)
);

CREATE TABLE Logs (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    Timestamp DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    Level NVARCHAR(20) NOT NULL,
    Logger NVARCHAR(100) NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Exception NVARCHAR(MAX) NULL,
    UserID INT NULL,
    MachineName NVARCHAR(50) NULL,
    FOREIGN KEY (UserID) REFERENCES [User](IDUser),
    CONSTRAINT CK_Logs_Level CHECK (Level IN ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'))
);

-- Insert default statuses
INSERT INTO [Status] ([Name], [Description]) VALUES 
('Pending', 'Order has been placed and is pending processing'),
('Processing', 'Order is being processed'),
('Shipped', 'Order has been shipped'),
('Delivered', 'Order has been delivered'),
('Cancelled', 'Order has been cancelled'),
('Refunded', 'Order has been refunded');

-- Insert default categories
INSERT INTO ItemCategory (CategoryName, [Description], SortOrder) VALUES 
('Electronics', 'Electronic devices and accessories', 1),
('Clothing', 'Apparel and fashion items', 2),
('Books', 'Books and literature', 3),
('Home & Garden', 'Home improvement and garden supplies', 4),
('Sports', 'Sports equipment and accessories', 5),
('Collectibles', 'Vintage items, antiques, and collectibles', 6),
('Handmade', 'Handcrafted and artisan items', 7),
('Digital', 'Digital products and services', 8);

-- Insert sample admin-created items
INSERT INTO Item (ItemCategoryID, SellerUserID, Title, [Description], StockQuantity, Price, IsActive, IsFeatured, IsApproved, ItemStatus) VALUES
(1, NULL, 'iPhone 15 Pro', 'Latest Apple iPhone with titanium design - Official Store Item', 50, 999.99, 1, 1, 1, 'Active'),
(1, NULL, 'Samsung Galaxy S24', 'Premium Android smartphone - Official Store Item', 30, 899.99, 1, 1, 1, 'Active'),
(2, NULL, 'Nike Air Max Shoes', 'Classic athletic footwear - Official Store Item', 25, 129.99, 1, 0, 1, 'Active'),
(3, NULL, 'Programming Books Collection', 'Complete set of modern programming guides', 100, 49.99, 1, 1, 1, 'Active'),
(4, NULL, 'Garden Tool Set', 'Professional gardening tools for home use', 40, 89.99, 1, 0, 1, 'Active'); 