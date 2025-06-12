# OICAR Environment Configuration Guide

## 🔒 **Security Notice**
This project now supports environment variables for sensitive configuration data. **NEVER** commit production secrets to version control.

## 📋 **Quick Setup**

### Development Environment
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local values:
   ```bash
   # Example for local development
   DB_SERVER=localhost,1433
   DB_NAME=SnjofkaloDB
   DB_USER=sa
   DB_PASSWORD=YourStrong!Passw0rd
   JWT_SECRET_KEY=your-dev-jwt-key-here
   ENCRYPTION_KEY=your-dev-encryption-key-here
   ```

3. Start your development environment:
   ```bash
   cd "SnjofkaloAPI - Copy/SnjofkaloAPI"
   dotnet run
   ```

### Production Environment
For production deployments, set environment variables through your hosting platform (Azure App Service, Docker, etc.)

## 🔧 **Configuration Priority**

The API uses the following configuration priority:
1. **Environment Variables** (highest priority)
2. **appsettings.json** (fallback)
3. **Default values** (safeguard)

This ensures:
- ✅ Production secrets stay secure
- ✅ Development works without environment variables
- ✅ Existing production deployments continue working

## 📊 **Environment Variables Reference**

### Database Configuration
| Variable | Description | Example |
|----------|-------------|---------|
| `DB_SERVER` | Database server address | `localhost,1433` |
| `DB_NAME` | Database name | `SnjofkaloDB` |
| `DB_USER` | Database username | `sa` |
| `DB_PASSWORD` | Database password | `YourPassword!` |
| `DB_TRUST_CERTIFICATE` | Trust server certificate | `true` or `false` |

### JWT Authentication
| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET_KEY` | JWT signing key (32+ chars) | `your-secret-key-here` |
| `JWT_ISSUER` | JWT issuer | `SnjofkaloAPI` |
| `JWT_AUDIENCE` | JWT audience | `SnjofkaloApp` |
| `JWT_EXPIRY_MINUTES` | Token expiry time | `60` |

### API Settings
| Variable | Description | Example |
|----------|-------------|---------|
| `API_PAGE_SIZE` | Default page size | `20` |
| `API_MAX_PAGE_SIZE` | Maximum page size | `100` |
| `ENABLE_SWAGGER` | Enable Swagger UI | `true` or `false` |
| `ENABLE_CORS` | Enable CORS | `true` or `false` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,https://yourdomain.com` |

### Encryption
| Variable | Description | Example |
|----------|-------------|---------|
| `ENCRYPTION_KEY` | Data encryption key (32+ chars) | `your-encryption-key-here` |
| `ENCRYPTION_ENABLED` | Enable data encryption | `true` or `false` |

## 🚀 **Deployment Examples**

### Azure App Service
```bash
az webapp config appsettings set \
  --name your-app-name \
  --resource-group your-rg \
  --settings \
    DB_SERVER="your-server.database.windows.net" \
    DB_NAME="SnjofkaloDB" \
    DB_USER="sqladmin" \
    DB_PASSWORD="YourSecurePassword!" \
    JWT_SECRET_KEY="your-production-jwt-key" \
    ENCRYPTION_KEY="your-production-encryption-key"
```

### Docker
```bash
docker run -e DB_SERVER="localhost,1433" \
           -e DB_PASSWORD="YourPassword!" \
           -e JWT_SECRET_KEY="your-key" \
           your-api-image
```

### Kubernetes
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: oicar-secrets
data:
  DB_PASSWORD: <base64-encoded-password>
  JWT_SECRET_KEY: <base64-encoded-key>
  ENCRYPTION_KEY: <base64-encoded-key>
```

## ⚠️ **Migration from Current Setup**

### For Development
- No changes needed - existing `appsettings.json` will continue working
- Optional: Create `.env` file for easier local development

### For Production
1. **Phase 1** (Safe): Deploy the updated API with environment variable support
2. **Phase 2** (Coordinated): Set environment variables in production
3. **Phase 3** (Optional): Remove sensitive data from `appsettings.json`

## 🔍 **Health Check**

The `/health` endpoint now shows the configuration source:
```json
{
  "Status": "Healthy",
  "ConfigurationSource": "Environment Variables",
  "EncryptionEnabled": true
}
```

## 🛠️ **Troubleshooting**

### Environment Variables Not Loading
- Check `.env` file exists in the API root directory
- Verify environment variable names match exactly
- Check logs for "Configuration source" message

### Connection Issues
- Verify database server is accessible
- Check connection string format
- Ensure firewall rules allow connection

### JWT Issues
- Ensure JWT secret key is at least 32 characters
- Verify issuer and audience settings match client configuration

## 📝 **Best Practices**

1. **Never commit `.env` files** - they're already in `.gitignore`
2. **Use strong, unique keys** for production
3. **Rotate secrets regularly** in production
4. **Use separate keys** for different environments
5. **Monitor configuration source** via health endpoint

## 🔗 **Related Files**

- `.env.example` - Template for environment variables
- `appsettings.json` - Default configuration values
- `appsettings.Production.json` - Production-specific overrides
- `Program.cs` - Configuration loading logic 