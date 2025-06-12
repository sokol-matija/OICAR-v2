-- OICAR Azure Database Sample Data Initialization
-- Run this in DBeaver to populate your database with test data

-- Insert Sample Statuses
INSERT INTO Status (Name, Description) VALUES
('Active', 'Active status'),
('Pending', 'Pending approval'),
('Completed', 'Completed status'),
('Cancelled', 'Cancelled status');

-- Insert Sample Categories
INSERT INTO ItemCategory (Name, Description) VALUES
('Electronics', 'Electronic devices and gadgets'),
('Clothing', 'Fashion and apparel'),
('Books', 'Books and educational materials'),
('Home & Garden', 'Home improvement and gardening'),
('Sports', 'Sports and fitness equipment');

-- Insert Sample Tags
INSERT INTO Tag (Name, Description) VALUES
('New', 'New arrivals'),
('Sale', 'On sale items'),
('Popular', 'Popular products'),
('Featured', 'Featured items'),
('Limited', 'Limited edition');

-- Insert Sample Items
INSERT INTO Item (Title, Description, Price, Quantity, CategoryId, CreatedDate, UpdatedDate) VALUES
('iPhone 15 Pro', 'Latest Apple smartphone with advanced features', 999.99, 50, 1, GETDATE(), GETDATE()),
('Samsung Galaxy S24', 'Flagship Android smartphone', 899.99, 30, 1, GETDATE(), GETDATE()),
('MacBook Air M3', 'Lightweight laptop with Apple M3 chip', 1299.99, 25, 1, GETDATE(), GETDATE()),
('Nike Air Jordan', 'Classic basketball sneakers', 159.99, 100, 2, GETDATE(), GETDATE()),
('Levi''s 501 Jeans', 'Classic straight-leg jeans', 79.99, 75, 2, GETDATE(), GETDATE()),
('Programming Book Set', 'Complete guide to modern programming', 49.99, 200, 3, GETDATE(), GETDATE()),
('Garden Tool Kit', 'Essential tools for home gardening', 89.99, 40, 4, GETDATE(), GETDATE()),
('Yoga Mat Pro', 'Premium non-slip yoga mat', 35.99, 60, 5, GETDATE(), GETDATE());

-- Insert Sample Users (encrypted fields will be handled by the API)
INSERT INTO [User] (Username, FirstName, LastName, Email, PhoneNumber, IsAdmin, CreatedDate, UpdatedDate) VALUES
('admin', 'Admin', 'User', 'admin@oicar.com', '+1234567890', 1, GETDATE(), GETDATE()),
('testuser', 'Test', 'User', 'test@oicar.com', '+1234567891', 0, GETDATE(), GETDATE()),
('johndoe', 'John', 'Doe', 'john@example.com', '+1234567892', 0, GETDATE(), GETDATE());

-- Verification Queries
SELECT 'Categories Count' as Info, COUNT(*) as Count FROM ItemCategory
UNION ALL
SELECT 'Items Count', COUNT(*) FROM Item
UNION ALL
SELECT 'Users Count', COUNT(*) FROM [User]
UNION ALL
SELECT 'Statuses Count', COUNT(*) FROM Status
UNION ALL
SELECT 'Tags Count', COUNT(*) FROM Tag;

-- Show sample data
SELECT 'Sample Categories:' as Info;
SELECT Id, Name, Description FROM ItemCategory;

SELECT 'Sample Items:' as Info;
SELECT Id, Title, Price, Quantity, CategoryId FROM Item;

SELECT 'Sample Users:' as Info;
SELECT Id, Username, FirstName, LastName, Email, IsAdmin FROM [User]; 