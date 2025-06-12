# OICAR E-commerce Web Application

A .NET 9.0 web application with API backend for an e-commerce platform called OICAR.

## Project Structure

- **OICAR/**: Main API backend (.NET 9.0)
- **OICAR-WebApp/**: Frontend web application (ASP.NET Core)
- **Database/**: SQL Server database schema and scripts
- **docker-compose.yml**: Docker setup for SQL Server

## Prerequisites

- .NET 9.0 SDK
- Docker Desktop for Mac
- DBeaver or another SQL Server client (optional, for database management)

## Quick Start

### 1. Start the SQL Server Database

The project uses SQL Server running in Docker. To start the database:

```bash
# Start the SQL Server container
docker-compose up -d

# Wait a few moments for SQL Server to initialize
# Check if it's running
docker ps
```

The SQL Server will be available at:
- **Host**: localhost
- **Port**: 1433
- **Username**: sa
- **Password**: YourStrong!Passw0rd
- **Database**: webshopdb

### 2. Initialize the Database Schema

After the container is running, initialize the database with the schema:

```bash
# Run the initialization script
./init-database.sh
```

Or manually run the SQL script:

```bash
# Connect to the container and run the schema
docker exec -it oicar-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C -d webshopdb -i /docker-entrypoint-initdb.d/Database.sql
```

### 3. Run the Application

```bash
# Start the API backend
cd OICAR
dotnet run
# API will be available at: http://localhost:7118

# In another terminal, start the web application
cd OICAR-WebApp  
dotnet run
# Web app will be available at: http://localhost:5082
```

## Access Points

- **Web Application**: http://localhost:5082
- **API Backend**: http://localhost:7118
- **API Documentation (Swagger)**: http://localhost:7118/swagger
- **Database**: localhost:1433 (for DBeaver)

## Database Connection

The application is configured to connect to the Docker SQL Server with these settings:

- **Connection String**: `Server=localhost,1433;Database=webshopdb;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=True;`

## Using DBeaver to Connect

To connect to the database using DBeaver:

1. Create a new connection
2. Select SQL Server
3. Use these settings:
   - Host: localhost
   - Port: 1433
   - Database: webshopdb
   - Username: sa
   - Password: YourStrong!Passw0rd
   - Check "Trust server certificate"

## Database Schema

The database includes the following main tables:

- **User**: User accounts and authentication
- **Item**: Product catalog
- **ItemCategory**: Product categories
- **Cart**: Shopping cart functionality
- **Order**: Order management
- **OrderItem**: Order line items
- **Status**: Order status management
- **Tag**: Product tagging system
- **Logs**: Application logging

## Development Workflow

1. **Start Database**: `docker-compose up -d`
2. **Run Migrations**: Initialize schema with `./init-database.sh`
3. **Start API**: `cd OICAR && dotnet run` (http://localhost:7118)
4. **Start Web App**: `cd OICAR-WebApp && dotnet run` (http://localhost:5082)

## Useful Docker Commands

```bash
# Start the database
docker-compose up -d

# Stop the database
docker-compose down

# View logs
docker-compose logs -f

# Connect to SQL Server directly
docker exec -it oicar-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrong!Passw0rd" -C

# Remove all data (fresh start)
docker-compose down -v
```

## API Endpoints

The API will be available at `http://localhost:7118`.

API documentation is available via Swagger UI at `http://localhost:7118/swagger` when running in development mode.

## Environment Variables

You can override database settings using environment variables:

- `SA_PASSWORD`: SQL Server SA password
- `DB_NAME`: Database name (default: webshopdb)

## Troubleshooting

### SQL Server Won't Start
- Ensure Docker Desktop is running
- Check if port 1433 is available: `lsof -i :1433`
- Increase Docker memory allocation in Docker Desktop settings

### Connection Issues
- Verify the container is running: `docker ps`
- Check the connection string in `appsettings.json`
- Ensure the database is initialized with the schema

### Permission Issues
- Make sure the init script is executable: `chmod +x init-database.sh`
- Check Docker container logs: `docker logs oicar-sqlserver`

### Test
- New cdci test 
