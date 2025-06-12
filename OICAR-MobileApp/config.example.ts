// OICAR Mobile App Configuration Template
// Copy this file to config.ts and fill in your actual values

export const CONFIG = {
  // API Configuration
  API_BASE_URL: 'https://your-api-endpoint.azurewebsites.net/api',
  API_TIMEOUT: 10000,

  // Database Configuration (for direct connections if needed)
  DB_SERVER: 'your-server.database.windows.net',
  DB_NAME: 'your-database-name',
  DB_USER: 'your-username',
  DB_PASSWORD: 'your-password',

  // Authentication
  JWT_SECRET: 'your-jwt-secret-key',
  AUTH_TIMEOUT: 3600000,

  // App Configuration
  APP_NAME: 'OICAR',
  APP_VERSION: '1.0.0',
  DEBUG_MODE: true,

  // External Services
  NOTIFICATION_SERVICE_URL: '',
  ANALYTICS_KEY: '',

  // Security
  ENCRYPTION_KEY: 'your-encryption-key',
  SSL_VERIFY: true,
};

export default CONFIG; 