-- OICAR Database - Cleanup Script for Azure SQL
-- This will drop all existing tables and objects to start fresh

-- Drop triggers first
IF OBJECT_ID('tr_User_UpdatedAt', 'TR') IS NOT NULL DROP TRIGGER tr_User_UpdatedAt;
IF OBJECT_ID('tr_Item_UpdatedAt', 'TR') IS NOT NULL DROP TRIGGER tr_Item_UpdatedAt;
IF OBJECT_ID('tr_Order_UpdatedAt', 'TR') IS NOT NULL DROP TRIGGER tr_Order_UpdatedAt;

-- Drop foreign key constraints by dropping tables in correct order
IF OBJECT_ID('CartItem', 'U') IS NOT NULL DROP TABLE CartItem;
IF OBJECT_ID('OrderItem', 'U') IS NOT NULL DROP TABLE OrderItem;
IF OBJECT_ID('ItemImage', 'U') IS NOT NULL DROP TABLE ItemImage;
IF OBJECT_ID('[Order]', 'U') IS NOT NULL DROP TABLE [Order];
IF OBJECT_ID('Item', 'U') IS NOT NULL DROP TABLE Item;
IF OBJECT_ID('ItemCategory', 'U') IS NOT NULL DROP TABLE ItemCategory;
IF OBJECT_ID('Cart', 'U') IS NOT NULL DROP TABLE Cart;
IF OBJECT_ID('[Status]', 'U') IS NOT NULL DROP TABLE [Status];
IF OBJECT_ID('Tag', 'U') IS NOT NULL DROP TABLE Tag;
IF OBJECT_ID('[User]', 'U') IS NOT NULL DROP TABLE [User];
IF OBJECT_ID('Logs', 'U') IS NOT NULL DROP TABLE Logs;

-- Drop any remaining indexes (in case they exist independently)
-- Note: Indexes on tables are automatically dropped when tables are dropped

PRINT 'Database cleanup completed - all tables and objects dropped!'; 