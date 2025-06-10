#!/bin/bash

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
sleep 30

# Create the existing webshop database and run the schema
echo "Creating webshopdb database and running schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q "CREATE DATABASE webshopdb;"

# Run the webshop database schema
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d webshopdb -i /docker-entrypoint-initdb.d/Database.sql

# Create the new SnjofkaloDB database
echo "Creating SnjofkaloDB database..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q "CREATE DATABASE SnjofkaloDB;"

# Note: SnjofkaloDB schema will be created by Entity Framework migrations
echo "Database initialization completed!"
echo "- webshopdb: Created with schema"
echo "- SnjofkaloDB: Created (schema will be managed by Entity Framework)" 