// API Configuration
export const API_CONFIG = {
  // Backend API URL - change this if your backend runs on a different port
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  // Endpoints
  ENDPOINTS: {
    OVERLAY: '/overlay',
    HEALTH: '/health',
  },

  // Request timeout in milliseconds
  TIMEOUT: 30000,
};