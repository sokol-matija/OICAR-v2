# DBeaver Azure SQL Database Connection Guide

## 🔗 Connection Details

**Azure SQL Database Information:**
```
Database Type: Microsoft SQL Server
Server Host: oicar-sql-server-ms1749709920.database.windows.net
Port: 1433
Database Name: SnjofkaloDB
Username: sqladmin
Password: OicarAdmin2024!
```

## 📋 Step-by-Step Setup in DBeaver

### 1. Create New Connection
- Open DBeaver
- Click **Database** → **New Database Connection**
- Select **SQL Server** (Microsoft SQL Server)
- Click **Next**

### 2. Main Settings Tab
```
Server Host: oicar-sql-server-ms1749709920.database.windows.net
Port: 1433
Database: SnjofkaloDB
Authentication: SQL Server Authentication
Username: sqladmin
Password: OicarAdmin2024!
```

### 3. SSL Settings Tab (IMPORTANT for Azure)
- ✅ Check **Use SSL**
- SSL Mode: **Require**
- ✅ Check **Verify server certificate**

### 4. Connection Settings Tab
- Connection timeout: 30 seconds
- ✅ Check **Show all databases**

### 5. Test Connection
- Click **Test Connection** button
- Should show: "Connected" ✅

## 🗄️ What You Should See

Once connected, you should see these tables:
- Cart
- CartItem  
- Item
- ItemCategory
- Logs
- Order
- OrderItem
- Status
- Tag
- User

## 🔧 Useful SQL Queries to Test

### Check Tables
```sql
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE='BASE TABLE' 
ORDER BY TABLE_NAME;
```

### Check Table Structure
```sql
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'User'
ORDER BY ORDINAL_POSITION;
```

### Count Records
```sql
SELECT 
    (SELECT COUNT(*) FROM [User]) as Users,
    (SELECT COUNT(*) FROM Item) as Items,
    (SELECT COUNT(*) FROM ItemCategory) as Categories,
    (SELECT COUNT(*) FROM Cart) as Carts,
    (SELECT COUNT(*) FROM [Order]) as Orders;
```

## 🔄 Initialize Sample Data

You can run your initialization script directly in DBeaver:
1. Open SQL Editor (right-click database → SQL Editor)
2. Copy your initialization script
3. Execute it

## 🎨 Create Database Diagram

1. Right-click on your database
2. Select **Generate SQL** → **DDL**
3. Or use **Tools** → **Generate ER Diagram**

This will show you the visual structure to compare with your local database! 