#!/bin/bash

# Wait for SQL Server to be ready
echo "Waiting for SQL Server to start..."
sleep 30

# Create the database and run the schema
echo "Creating database and running schema..."
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -Q "CREATE DATABASE webshopdb;"

# Run the database schema
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d webshopdb -i /docker-entrypoint-initdb.d/Database.sql

echo "Database initialization completed!" 