// Debug utility for messenger-dashboard
export const debug = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },

  error: (message: string, error?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
    }
  },

  warn: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
    }
  },

  db: (operation: string, query?: string, params?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] ${new Date().toISOString()} - ${operation}`, {
        query: query || 'N/A',
        params: params || 'N/A'
      });
    }
  },

  api: (endpoint: string, method?: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${new Date().toISOString()} - ${method || 'GET'} ${endpoint}`, data || '');
    }
  }
};