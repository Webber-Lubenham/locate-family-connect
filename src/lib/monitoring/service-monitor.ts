
// Service event monitoring system

// Service types enum
export enum ServiceType {
  APP = 'app',
  AUTH = 'authentication',
  DATABASE = 'database',
  NETWORK = 'network',
  LOCATION = 'location',
  MAP = 'map',
  EMAIL = 'email',
  GEOLOCATION = 'geolocation',
  CACHE = 'cache',
  STORAGE = 'storage'
}

// Event severity levels
export enum SeverityLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Service event interface
interface ServiceEvent {
  service: ServiceType;
  severity: SeverityLevel;
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

// In-memory event log (could be extended to persist to storage or send to backend)
const eventLogs: ServiceEvent[] = [];

/**
 * Records a service event
 */
export function recordServiceEvent(
  service: ServiceType, 
  severity: SeverityLevel, 
  message: string,
  metadata?: Record<string, any>
) {
  const event: ServiceEvent = {
    service,
    severity,
    message,
    timestamp: Date.now(),
    metadata
  };
  
  // Add to logs
  eventLogs.push(event);
  
  // Log to console with appropriate formatting
  const logMethod = severity === SeverityLevel.ERROR || severity === SeverityLevel.CRITICAL
    ? console.error
    : severity === SeverityLevel.WARNING
      ? console.warn
      : console.log;
  
  logMethod(`[${service}][${severity}] ${message}`, metadata || '');

  // For critical errors, we might want to report to an error tracking service
  if (severity === SeverityLevel.CRITICAL) {
    // reportToCriticalMonitoring(event);
  }
  
  return event;
}

/**
 * Initializes monitoring system
 */
export function initializeMonitoring() {
  recordServiceEvent(
    ServiceType.APP,
    SeverityLevel.INFO,
    'Monitoring system initialized'
  );
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    recordServiceEvent(
      ServiceType.APP,
      SeverityLevel.ERROR,
      'Unhandled error',
      { 
        message: event.message,
        source: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
        error: event.error?.toString()
      }
    );
  });
  
  // Add promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    recordServiceEvent(
      ServiceType.APP,
      SeverityLevel.ERROR,
      'Unhandled promise rejection',
      { reason: event.reason?.toString() }
    );
  });
}

/**
 * Gets all recorded events
 */
export function getServiceEvents(): ServiceEvent[] {
  return [...eventLogs];
}

/**
 * Clears all recorded events
 */
export function clearServiceEvents(): void {
  eventLogs.length = 0;
}
