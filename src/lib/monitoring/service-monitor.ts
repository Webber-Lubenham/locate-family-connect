
// Define service types for monitoring
export enum ServiceType {
  APP = 'app',
  API = 'api',
  LOCATION = 'location',
  MAP = 'map', // Added MAP type
  DATABASE = 'database',
  AUTHENTICATION = 'authentication',
  NOTIFICATION = 'notification',
  STORAGE = 'storage',
  CACHE = 'cache'
}

// Define severity levels for events
export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Function to record service events
export function recordServiceEvent(
  service: ServiceType,
  severity: SeverityLevel,
  message: string,
  metadata?: Record<string, any>
) {
  // In production, this would send to a logging service
  // For now, we just log to console with appropriate formatting
  const timestamp = new Date().toISOString();
  
  const logObject = {
    timestamp,
    service,
    severity,
    message,
    ...(metadata && { metadata })
  };
  
  // Format console output based on severity
  switch (severity) {
    case SeverityLevel.INFO:
      console.info(`[SERVICE MONITOR] ${timestamp} - ${service}:`, message, metadata || '');
      break;
    case SeverityLevel.WARNING:
      console.warn(`[SERVICE MONITOR] ${timestamp} - ${service}:`, message, metadata || '');
      break;
    case SeverityLevel.ERROR:
    case SeverityLevel.CRITICAL:
      console.error(`[SERVICE MONITOR] ${timestamp} - ${service}:`, message, metadata || '');
      break;
    default:
      console.log(`[SERVICE MONITOR] ${timestamp} - ${service}:`, message, metadata || '');
  }
  
  // In a real app, we would send this to a monitoring service
  // sendToMonitoringService(logObject);
  
  return logObject;
}
