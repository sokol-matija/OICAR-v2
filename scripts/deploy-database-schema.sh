#!/bin/bash

# Deploy Database Schema to Azure SQL Database
echo "🗄️ Deploying database schema to Azure SQL Database..."

SERVER="oicar-sql-server-ms1749709920.database.windows.net"
DATABASE="SnjofkaloDB"
USERNAME="sqladmin"
PASSWORD="OicarAdmin2024!"

echo "📋 Database Details:"
echo "  Server: $SERVER"
echo "  Database: $DATABASE"
echo "  Username: $USERNAME"
echo ""

# Check if sqlcmd is available
if command -v sqlcmd &> /dev/null; then
    echo "✅ sqlcmd found, deploying schema..."
    sqlcmd -S $SERVER -d $DATABASE -U $USERNAME -P $PASSWORD -i "Database/Database.sql"
    
    if [ $? -eq 0 ]; then
        echo "🎉 Database schema deployed successfully!"
    else
        echo "❌ Schema deployment failed."
        echo "💡 Alternative: Use Azure Portal Query Editor"
        echo "   1. Go to: https://portal.azure.com"
        echo "   2. Navigate to your SQL Database: SnjofkaloDB"
        echo "   3. Click 'Query editor (preview)'"
        echo "   4. Login with your credentials"
        echo "   5. Copy and paste the content of Database/Database.sql"
        echo "   6. Click 'Run'"
    fi
else
    echo "⚠️ sqlcmd not found. Installing via Homebrew..."
    brew install microsoft/mssql-release/mssql-tools18
    
    if [ $? -eq 0 ]; then
        echo "✅ sqlcmd installed, deploying schema..."
        sqlcmd -S $SERVER -d $DATABASE -U $USERNAME -P $PASSWORD -i "Database/Database.sql"
    else
        echo "❌ Could not install sqlcmd."
        echo "💡 Manual Option: Use Azure Portal Query Editor"
        echo "   1. Go to: https://portal.azure.com"
        echo "   2. Navigate to your SQL Database: SnjofkaloDB"
        echo "   3. Click 'Query editor (preview)'"
        echo "   4. Login with: sqladmin / OicarAdmin2024!"
        echo "   5. Copy and paste the content of Database/Database.sql"
        echo "   6. Click 'Run'"
    fi
fi

echo ""
echo "🌐 Azure Portal: https://portal.azure.com"
echo "📁 Your Resource Group: OICAR-ResourceGroup" 