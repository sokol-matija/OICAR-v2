CREATE TABLE [User] (
    IDUser INT PRIMARY KEY IDENTITY(1,1),
    Username VARCHAR(50) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Password VARCHAR(100) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(50) NULL,
    IsAdmin BIT NOT NULL DEFAULT 0,
    PasswordSalt VARBINARY(1024) NULL,
    PasswordHash NVARCHAR(255) NULL,
    CONSTRAINT UQ_User_Email UNIQUE (Email),
    CONSTRAINT UQ_User_Username UNIQUE (Username)
);
GO

CREATE TABLE [Status] (
    IDStatus INT PRIMARY KEY IDENTITY(1,1),
    [Name] VARCHAR(50) NOT NULL,
    [Description] VARCHAR(MAX) NULL
);
GO

CREATE TABLE ItemCategory (
    IDItemCategory INT PRIMARY KEY IDENTITY(1,1),
    CategoryName VARCHAR(50) NOT NULL
);
GO

CREATE TABLE Item (
    IDItem INT PRIMARY KEY IDENTITY(1,1),
    ItemCategoryID INT NOT NULL,
    Title VARCHAR(50) NOT NULL,
    [Description] VARCHAR(MAX) NOT NULL,
    StockQuantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    [Weight] DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ItemCategoryID) REFERENCES ItemCategory(IDItemCategory)
);
GO

CREATE TABLE Cart (
    IDCart INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES [User](IDUser)
);
GO

CREATE TABLE CartItem (
    IDCartItem INT PRIMARY KEY IDENTITY(1,1),
    CartID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL,
    FOREIGN KEY (CartID) REFERENCES Cart(IDCart),
    FOREIGN KEY (ItemID) REFERENCES Item(IDItem)
);
GO

CREATE TABLE [Order] (
    IDOrder INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL,
    StatusID INT NOT NULL,
    OrderDate DATETIME NOT NULL DEFAULT GETDATE(),
    TotalAmount DECIMAL(18, 0) NOT NULL,
    FOREIGN KEY (StatusID) REFERENCES [Status](IDStatus),
    FOREIGN KEY (UserID) REFERENCES [User](IDUser)
);
GO

CREATE TABLE OrderItem (
    IDOrderItem INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL,
    ItemID INT NOT NULL,
    Quantity INT NOT NULL CHECK (Quantity > 0),
    FOREIGN KEY (ItemID) REFERENCES Item(IDItem),
    FOREIGN KEY (OrderID) REFERENCES [Order](IDOrder)
);
GO

CREATE TABLE Logs (
    Id INT PRIMARY KEY IDENTITY(1,1),
    Timestamp DATETIME NOT NULL DEFAULT GETDATE(),
    Level NVARCHAR(50) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL
);
GO

CREATE TABLE Tag (
    IDTag INT PRIMARY KEY IDENTITY(1,1),
    Name VARCHAR(50) NOT NULL,
    CONSTRAINT UQ_Tag_Name UNIQUE (Name)
);
GO

ALTER TABLE CartItem
ADD CONSTRAINT FK_CartItem_Cart
FOREIGN KEY (CartID)
REFERENCES Cart(IDCart)
ON DELETE CASCADE;
GO

ALTER TABLE OrderItem
ADD CONSTRAINT FK_OrderItem_Order
FOREIGN KEY (OrderID)
REFERENCES [Order](IDOrder)
ON DELETE CASCADE;
GO

CREATE PROCEDURE sp_CreateUser 
    @Username varchar(50),
    @FirstName varchar(50),
    @LastName varchar(50),
    @Password varchar(50),
    @PasswordSalt varbinary(MAX),
    @Email varchar(100),
    @PhoneNumber varchar(50),
    @IsAdmin bit,
    @IDUser int OUTPUT 
AS
BEGIN
    INSERT INTO [User](Username, FirstName, LastName, [Password], PasswordSalt, Email, PhoneNumber, IsAdmin)
    VALUES(@Username, @FirstName, @LastName, @Password, @PasswordSalt, @Email, @PhoneNumber, @IsAdmin)
    SET @IDUser = SCOPE_IDENTITY();
END
GO

CREATE PROCEDURE sp_GetUserById
    @IDUser int 
AS
    SELECT  * FROM [User] where IDUser = @IDUser
GO

CREATE PROCEDURE sp_GetUserByUsername
    @Username NVARCHAR(50)
AS
BEGIN
    SELECT * FROM [User] WHERE Username = @Username;
END;
GO

CREATE PROCEDURE sp_GetUserByEmail
    @Email NVARCHAR(100)
AS
BEGIN
    SELECT * FROM [User] WHERE Email = @Email;
END;
GO

CREATE PROCEDURE sp_GetAdminUsers
AS
BEGIN
    SELECT * FROM [User] WHERE IsAdmin = 1;
END;
GO

CREATE PROCEDURE sp_GetAllUsers
AS
	SELECT * FROM [USER]
GO

CREATE PROCEDURE sp_UpdateUser
    @IDUser INT,
    @Username NVARCHAR(50),
    @Password NVARCHAR(100),
    @PasswordSalt varbinary(MAX),
    @Email NVARCHAR(100),
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @PhoneNumber NVARCHAR(50),
    @IsAdmin BIT
AS
BEGIN
    UPDATE [User]
    SET 
        Username = @Username,
        [Password] = @Password,
        PasswordSalt = @PasswordSalt,
        Email = @Email,
        FirstName = @FirstName,
        LastName = @LastName,
        PhoneNumber = @PhoneNumber,
        IsAdmin = @IsAdmin
    WHERE IDUser = @IDUser;
END;
GO

CREATE PROCEDURE sp_DeleteUser
    @IDUser int 
AS
    DELETE FROM [User] where IDUser = @IDUser
GO

CREATE PROCEDURE sp_CreateItemCategory
    @CategoryName NVARCHAR(50),
    @IDItemCategory INT OUTPUT
AS
BEGIN
    INSERT INTO ItemCategory (CategoryName)
    VALUES (@CategoryName);
    SET @IDItemCategory = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetItemCategoryById
    @IDItemCategory INT
AS
BEGIN
    SELECT * 
    FROM ItemCategory
    WHERE IDItemCategory = @IDItemCategory;
END;
GO

CREATE PROCEDURE sp_GetAllItemCategories
AS
BEGIN
    SELECT * 
    FROM ItemCategory;
END;
GO

CREATE PROCEDURE sp_UpdateItemCategory
    @IDItemCategory INT,
    @CategoryName NVARCHAR(50)
AS
BEGIN
    UPDATE ItemCategory
    SET CategoryName = @CategoryName
    WHERE IDItemCategory = @IDItemCategory;
END;
GO

CREATE PROCEDURE sp_DeleteItemCategory
    @IDItemCategory INT
AS
BEGIN
    DELETE FROM ItemCategory
    WHERE IDItemCategory = @IDItemCategory;
END;
GO

CREATE PROCEDURE sp_GetItemCategoryByName
    @CategoryName NVARCHAR(100)
AS
BEGIN
    SELECT *
    FROM ItemCategory
    WHERE CategoryName = @CategoryName;
END;
GO

CREATE PROCEDURE sp_CheckItemCategoryExists
    @CategoryName NVARCHAR(100)
AS
BEGIN
    SELECT CASE 
               WHEN EXISTS (SELECT 1 FROM ItemCategory WHERE CategoryName = @CategoryName) 
               THEN 1 
               ELSE 0 
           END AS CategoryExists;
END;
GO

CREATE PROCEDURE sp_CreateTag
    @Name NVARCHAR(50),
    @IDTag INT OUTPUT
AS
BEGIN
    INSERT INTO Tag ([Name])
    VALUES (@Name);
    SET @IDTag = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetTagById
    @IDTag INT
AS
BEGIN
    SELECT * 
    FROM Tag
    WHERE IDTag = @IDTag;
END;
GO

CREATE PROCEDURE sp_GetTagByName
    @Name NVARCHAR(50)
AS
BEGIN
    SELECT * FROM Tag WHERE Name = @Name;
END;
GO

CREATE PROCEDURE sp_GetAllTags
AS
BEGIN
    SELECT * 
    FROM Tag;
END;
GO

CREATE PROCEDURE sp_UpdateTag
    @IDTag INT,
    @Name NVARCHAR(50)
AS
BEGIN
    UPDATE Tag
    SET [Name] = @Name
    WHERE IDTag = @IDTag;
END;
GO

CREATE PROCEDURE sp_DeleteTag
    @IDTag INT
AS
BEGIN
    DELETE FROM Tag
    WHERE IDTag = @IDTag;
END;
GO

CREATE PROCEDURE sp_CreateItem
    @ItemCategoryID INT,
    @Title NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @StockQuantity INT,
    @Price DECIMAL(10,2),
    @Weight DECIMAL(10,2),
    @IDItem INT OUTPUT
AS
BEGIN
    INSERT INTO Item (ItemCategoryID, Title, [Description], StockQuantity, Price, [Weight])
    VALUES (@ItemCategoryID, @Title, @Description, @StockQuantity, @Price, @Weight);
    SET @IDItem = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetItemById
    @IDItem INT
AS
BEGIN
    SELECT * 
    FROM Item
    WHERE IDItem = @IDItem;
END;
GO

CREATE or alter PROCEDURE sp_GetItemsByCategory
    @ItemCategoryID INT
AS
BEGIN
    SELECT *
    FROM Item
    WHERE ItemCategoryID = @ItemCategoryID;
END;
GO


CREATE PROCEDURE sp_CheckItemStock
    @IDItem INT
AS
BEGIN
    SELECT CASE WHEN StockQuantity > 0 THEN 1 ELSE 0 END
    FROM Item
    WHERE IDItem = @IDItem;
END;
GO

CREATE PROCEDURE sp_SearchItemsByTitle
    @Title NVARCHAR(50)
AS
BEGIN
    SELECT *
    FROM Item
    WHERE Title LIKE '%' + @Title + '%';
END;
GO

--CREATE PROCEDURE sp_GetItemsByTagId
--    @TagID INT = NULL
--AS
--BEGIN
--    SELECT *
--    FROM Item
--    WHERE (@TagID IS NULL AND TagID IS NULL)
--       OR TagID = @TagID;
--END;
--GO


CREATE PROCEDURE sp_GetAllItems
AS
BEGIN
    SELECT * 
    FROM Item;
END;
GO


CREATE PROCEDURE sp_UpdateItem
    @IDItem INT,
    @ItemCategoryID INT,
    @Title NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @StockQuantity INT,
    @Price DECIMAL(10,2),
    @Weight DECIMAL(10,2)
AS
BEGIN
    UPDATE Item
    SET 
        ItemCategoryID = @ItemCategoryID,
        Title = @Title,
        [Description] = @Description,
        StockQuantity = @StockQuantity,
        Price = @Price,
        [Weight] = @Weight
    WHERE IDItem = @IDItem;
END;
GO



CREATE PROCEDURE sp_DeleteItem
    @IDItem INT
AS
BEGIN
    DELETE FROM Item
    WHERE IDItem = @IDItem;
END;
GO

CREATE PROCEDURE sp_CreateStatus
    @Name NVARCHAR(50),
    @Description NVARCHAR(MAX),
    @IDStatus INT OUTPUT
AS
BEGIN
    INSERT INTO [Status] ([Name], [Description])
    VALUES (@Name, @Description);
    SET @IDStatus = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetStatusById
    @IDStatus INT
AS
BEGIN
    SELECT * 
    FROM [Status]
    WHERE IDStatus = @IDStatus;
END;
GO

CREATE PROCEDURE sp_GetStatusByName
    @Name NVARCHAR(50)
AS
BEGIN
    SELECT * FROM [Status] WHERE Name = @Name;
END;
GO

CREATE PROCEDURE sp_GetAllStatuses
AS
BEGIN
    SELECT * 
    FROM [Status];
END;
GO

CREATE PROCEDURE sp_UpdateStatus
    @IDStatus INT,
    @Name NVARCHAR(50),
    @Description NVARCHAR(MAX)
AS
BEGIN
    UPDATE [Status]
    SET 
        [Name] = @Name,
        [Description] = @Description
    WHERE IDStatus = @IDStatus;
END;
GO

CREATE PROCEDURE sp_DeleteStatus
    @IDStatus INT
AS
BEGIN
    DELETE FROM [Status]
    WHERE IDStatus = @IDStatus;
END;
GO

CREATE PROCEDURE sp_CreateOrder
    @UserID INT,
    @StatusID INT,
    @OrderDate DATETIME = NULL,
    @TotalAmount DECIMAL(10, 2),
    @IDOrder INT OUTPUT
AS
BEGIN
    IF @OrderDate IS NULL
        SET @OrderDate = GETDATE();

    INSERT INTO [Order] (UserID, StatusID, OrderDate, TotalAmount)
    VALUES (@UserID, @StatusID, @OrderDate, @TotalAmount);

    SET @IDOrder = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetOrderById
    @IDOrder INT
AS
BEGIN
    SELECT * 
    FROM [Order]
    WHERE IDOrder = @IDOrder;
END;
GO

CREATE PROCEDURE sp_GetOrdersByUserId
    @UserID INT
AS
BEGIN
    SELECT * FROM [Order] WHERE UserID = @UserID;
END;
GO

CREATE PROCEDURE sp_GetOrdersByStatus
    @StatusID INT
AS
BEGIN
    SELECT * FROM [Order] WHERE StatusID = @StatusID;
END;
GO

CREATE PROCEDURE sp_GetAllOrders
AS
BEGIN
    SELECT * 
    FROM [Order];
END;
GO

CREATE PROCEDURE sp_UpdateOrder
    @IDOrder INT,
    @UserID INT,
    @StatusID INT,
    @OrderDate DATETIME,
    @TotalAmount DECIMAL(10, 2)
AS
BEGIN
    UPDATE [Order]
    SET 
        UserID = @UserID,
        StatusID = @StatusID,
        OrderDate = @OrderDate,
        TotalAmount = @TotalAmount
    WHERE IDOrder = @IDOrder;
END;
GO

CREATE PROCEDURE sp_DeleteOrder
    @IDOrder INT
AS
BEGIN
    DELETE FROM [Order]
    WHERE IDOrder = @IDOrder;
END;
GO

CREATE PROCEDURE sp_CreateOrderItem
    @OrderID INT,
    @ItemID INT,
    @Quantity INT,
    @IDOrderItem INT OUTPUT
AS
BEGIN
    INSERT INTO OrderItem (OrderID, ItemID, Quantity)
    VALUES (@OrderID, @ItemID, @Quantity);

    SET @IDOrderItem = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetOrderItemById
    @IDOrderItem INT
AS
BEGIN
    SELECT * 
    FROM OrderItem
    WHERE IDOrderItem = @IDOrderItem;
END;
GO

CREATE PROCEDURE sp_GetOrderItemsByOrderId
    @OrderID INT
AS
BEGIN
    SELECT *
    FROM OrderItem
    WHERE OrderID = @OrderID;
END;
GO

CREATE PROCEDURE sp_GetOrderItemsByItemId
    @ItemID INT
AS
BEGIN
    SELECT *
    FROM OrderItem
    WHERE ItemID = @ItemID;
END;
GO

CREATE PROCEDURE sp_GetAllOrderItems
AS
BEGIN
    SELECT * 
    FROM OrderItem;
END;
GO

CREATE PROCEDURE sp_UpdateOrderItem
    @IDOrderItem INT,
    @OrderID INT,
    @ItemID INT,
    @Quantity INT
AS
BEGIN
    UPDATE OrderItem
    SET 
        OrderID = @OrderID,
        ItemID = @ItemID,
        Quantity = @Quantity
    WHERE IDOrderItem = @IDOrderItem;
END;
GO

CREATE PROCEDURE sp_DeleteOrderItem
    @IDOrderItem INT
AS
BEGIN
    DELETE FROM OrderItem
    WHERE IDOrderItem = @IDOrderItem;
END;
GO

CREATE PROCEDURE sp_GetLatestLogs
    @Count INT
AS
BEGIN
    SELECT TOP (@Count) *
    FROM [Logs]
    ORDER BY [Timestamp] DESC;
END;
GO

CREATE PROCEDURE sp_GetLogCount
AS
BEGIN
    SELECT COUNT(*) AS LogCount
    FROM [Logs];
END;
GO

CREATE PROCEDURE sp_CreateLog
    @Timestamp datetime,
    @Level nvarchar(50),
    @Message nvarchar(MAX),
    @Id INT OUTPUT
AS
BEGIN
    INSERT INTO [Logs] (Timestamp, Level, Message)
    VALUES (@Timestamp, @Level, @Message);
    
    SET @Id = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_CreateCart
    @UserID INT,
    @IDCart INT OUTPUT
AS
BEGIN
    INSERT INTO Cart (UserID)
    VALUES (@UserID);

    SET @IDCart = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetCartById
    @IDCart INT
AS
BEGIN
    SELECT * 
    FROM Cart
    WHERE IDCart = @IDCart;
END;
GO

CREATE PROCEDURE sp_GetCartByUserId
    @UserID INT
AS
BEGIN
    SELECT *
    FROM Cart
    WHERE UserID = @UserID;
END;
GO

CREATE PROCEDURE sp_CheckIfCartIsEmpty
    @IDCart INT
AS
BEGIN
    IF (SELECT COUNT(*) FROM CartItem WHERE CartID = @IDCart) = 0
    BEGIN
        SELECT 0;
    END
    ELSE
    BEGIN
        SELECT 1;
    END
END;
GO


CREATE PROCEDURE sp_GetAllCarts
AS
BEGIN
    SELECT * 
    FROM Cart;
END;
GO

CREATE PROCEDURE sp_UpdateCart
    @IDCart INT,
    @UserID INT
AS
BEGIN
    UPDATE Cart
    SET UserID = @UserID
    WHERE IDCart = @IDCart;
END;
GO

CREATE PROCEDURE sp_DeleteCart
    @IDCart INT
AS
BEGIN
    DELETE FROM Cart
    WHERE IDCart = @IDCart;
END;
GO

CREATE PROCEDURE sp_CreateCartItem
    @CartID INT,
    @ItemID INT,
    @Quantity INT,
    @IDCartItem INT OUTPUT
AS
BEGIN
    INSERT INTO CartItem (CartID, ItemID, Quantity)
    VALUES (@CartID, @ItemID, @Quantity);

    SET @IDCartItem = SCOPE_IDENTITY();
END;
GO

CREATE PROCEDURE sp_GetCartItemById
    @IDCartItem INT
AS
BEGIN
    SELECT * 
    FROM CartItem
    WHERE IDCartItem = @IDCartItem;
END;
GO

CREATE PROCEDURE sp_GetCartItemsByCartId
    @CartID INT
AS
BEGIN
    SELECT IDCartItem, CartID, ItemID, Quantity
    FROM CartItem
    WHERE CartID = @CartID;
END;
GO

CREATE PROCEDURE sp_GetAllCartItems
AS
BEGIN
    SELECT * 
    FROM CartItem;
END;
GO

CREATE PROCEDURE sp_UpdateCartItem
    @IDCartItem INT,
    @CartID INT,
    @ItemID INT,
    @Quantity INT
AS
BEGIN
    UPDATE CartItem
    SET CartID = @CartID,
        ItemID = @ItemID,
        Quantity = @Quantity
    WHERE IDCartItem = @IDCartItem;
END;
GO


CREATE PROCEDURE sp_DeleteCartItem
    @IDCartItem INT
AS
BEGIN
    DELETE FROM CartItem
    WHERE IDCartItem = @IDCartItem;
END;
GO
