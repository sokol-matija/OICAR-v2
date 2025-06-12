-- OICAR Database Schema for Azure SQL
-- Modified version without CREATE DATABASE (database already exists in Azure)

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
GO

CREATE TRIGGER tr_User_UpdatedAt ON [User]
AFTER UPDATE
AS
BEGIN
    UPDATE [User] 
    SET UpdatedAt = SYSDATETIME()
    FROM [User] u
    INNER JOIN inserted i ON u.IDUser = i.IDUser;
END;
GO

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
GO

CREATE TRIGGER tr_Item_UpdatedAt ON Item
AFTER UPDATE
AS
BEGIN
    UPDATE Item 
    SET UpdatedAt = SYSDATETIME()
    FROM Item i
    INNER JOIN inserted ins ON i.IDItem = ins.IDItem;
END;
GO

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
GO

CREATE TRIGGER tr_Order_UpdatedAt ON [Order]
AFTER UPDATE
AS
BEGIN
    UPDATE [Order] 
    SET UpdatedAt = SYSDATETIME()
    FROM [Order] o
    INNER JOIN inserted i ON o.IDOrder = i.IDOrder;
END;
GO

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
GO

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
GO

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
GO

-- Create Indexes
CREATE INDEX IX_User_CreatedAt ON [User](CreatedAt);

-- Indexes for GDPR anonymization requests
CREATE INDEX IX_User_RequestedAnonymization ON [User](RequestedAnonymization) 
WHERE RequestedAnonymization = 1;
CREATE INDEX IX_User_AnonymizationRequestDate ON [User](AnonymizationRequestDate) 
WHERE AnonymizationRequestDate IS NOT NULL;

CREATE INDEX IX_Item_CategoryID ON Item(ItemCategoryID);
CREATE INDEX IX_Item_IsActive ON Item(IsActive);
CREATE INDEX IX_Item_Price ON Item(Price);
CREATE INDEX IX_Item_CreatedAt ON Item(CreatedAt);

-- Marketplace-specific indexes
CREATE INDEX IX_Item_SellerUserID ON Item(SellerUserID);
CREATE INDEX IX_Item_IsApproved ON Item(IsApproved);
CREATE INDEX IX_Item_ItemStatus ON Item(ItemStatus);
CREATE INDEX IX_Item_ApprovedByAdminID ON Item(ApprovedByAdminID);

-- Composite indexes for common marketplace queries
CREATE INDEX IX_Item_Seller_Status_Active ON Item(SellerUserID, ItemStatus, IsActive);
CREATE INDEX IX_Item_Approval_Pending ON Item(IsApproved, ItemStatus) 
WHERE IsApproved = 0 AND ItemStatus = 'Pending';

CREATE INDEX IX_CartItem_UserID ON CartItem(UserID);
CREATE INDEX IX_CartItem_ItemID ON CartItem(ItemID);
CREATE INDEX IX_CartItem_AddedAt ON CartItem(AddedAt);

CREATE INDEX IX_Order_UserID ON [Order](UserID);
CREATE INDEX IX_Order_StatusID ON [Order](StatusID);
CREATE INDEX IX_Order_OrderDate ON [Order](OrderDate);
CREATE INDEX IX_Order_OrderNumber ON [Order](OrderNumber);

CREATE INDEX IX_OrderItem_OrderID ON OrderItem(OrderID);
CREATE INDEX IX_OrderItem_ItemID ON OrderItem(ItemID);

CREATE INDEX IX_Logs_Timestamp ON Logs(Timestamp);
CREATE INDEX IX_Logs_Level ON Logs(Level);
CREATE INDEX IX_Logs_UserID ON Logs(UserID);

CREATE INDEX IX_ItemImage_ItemID ON ItemImage(ItemID);
CREATE INDEX IX_ItemImage_ItemID_Order ON ItemImage(ItemID, ImageOrder);
GO

-- Insert default statuses
INSERT INTO [Status] ([Name], [Description]) VALUES 
('Pending', 'Order has been placed and is pending processing'),
('Processing', 'Order is being processed'),
('Shipped', 'Order has been shipped'),
('Delivered', 'Order has been delivered'),
('Cancelled', 'Order has been cancelled'),
('Refunded', 'Order has been refunded');
GO

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
GO

-- Insert sample admin-created items (no seller, auto-approved)
INSERT INTO Item (ItemCategoryID, SellerUserID, Title, [Description], StockQuantity, Price, IsActive, IsFeatured, IsApproved, ItemStatus) VALUES
(1, NULL, 'iPhone 15 Pro', 'Latest Apple iPhone with titanium design - Official Store Item', 50, 999.99, 1, 1, 1, 'Active'),
(1, NULL, 'Samsung Galaxy S24', 'Premium Android smartphone - Official Store Item', 30, 899.99, 1, 1, 1, 'Active'),
(2, NULL, 'Nike Air Max Shoes', 'Classic athletic footwear - Official Store Item', 25, 129.99, 1, 0, 1, 'Active');
GO

PRINT 'Database schema created successfully with all tables, indexes, and sample data!'; 