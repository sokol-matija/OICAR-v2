// OICAR Mobile App Configuration
// Uses environment variables in production, fallback to defaults for development

export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://oicar-api-ms1749710600.azurewebsites.net/api',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),

  // Database Configuration (for reference, not used in frontend)
  DB_SERVER: process.env.REACT_APP_DB_SERVER || 'oicar-sql-server-ms1749709920.database.windows.net',
  DB_NAME: process.env.REACT_APP_DB_NAME || 'SnjofkaloDB',
  DB_USER: process.env.REACT_APP_DB_USER || 'sqladmin',
  DB_PASSWORD: process.env.REACT_APP_DB_PASSWORD || 'OicarAdmin2024!',

  // Authentication
  JWT_SECRET: process.env.REACT_APP_JWT_SECRET || 'OicarJwtSecretKey2024SuperSecure',
  AUTH_TIMEOUT: parseInt(process.env.REACT_APP_AUTH_TIMEOUT || '3600000'),

  // App Configuration
  APP_NAME: process.env.REACT_APP_NAME || 'OICAR',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DEBUG_MODE: process.env.NODE_ENV !== 'production',

  // External Services
  NOTIFICATION_SERVICE_URL: process.env.REACT_APP_NOTIFICATION_URL || '',
  ANALYTICS_KEY: process.env.REACT_APP_ANALYTICS_KEY || '',

  // Security
  ENCRYPTION_KEY: process.env.REACT_APP_ENCRYPTION_KEY || 'OicarEncryptionKey2024',
  SSL_VERIFY: process.env.REACT_APP_SSL_VERIFY !== 'false',
};

export default CONFIG; 