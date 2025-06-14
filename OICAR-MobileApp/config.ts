// OICAR Mobile App Configuration
// Uses environment variables in production, fallback to defaults for development

export const CONFIG = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://oicar-api-ms1749710600.azurewebsites.net/api',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),

  // Note: Database credentials and JWT secrets should NEVER be in frontend code
  // The mobile app communicates with the API, not directly with the database

  // Authentication (frontend only needs timeout, not secrets)
  // JWT_SECRET is handled by the backend API only
  AUTH_TIMEOUT: parseInt(process.env.REACT_APP_AUTH_TIMEOUT || '3600000'),

  // App Configuration
  APP_NAME: process.env.REACT_APP_NAME || 'OICAR',
  APP_VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  DEBUG_MODE: process.env.NODE_ENV !== 'production',

  // External Services
  NOTIFICATION_SERVICE_URL: process.env.REACT_APP_NOTIFICATION_URL || '',
  ANALYTICS_KEY: process.env.REACT_APP_ANALYTICS_KEY || '',

  // Security (frontend only needs SSL verification setting)
  // ENCRYPTION_KEY is handled by the backend API only
  SSL_VERIFY: process.env.REACT_APP_SSL_VERIFY !== 'false',
};

export default CONFIG; 