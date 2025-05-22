import winston from 'winston';
import Config from '../config';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level based on environment
const level = () => {
  return Config.environment === 'development' ? 'debug' : 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Define the format for logs
const format = winston.format.combine(
  // Add timestamp
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // Add colors based on log level
  winston.format.colorize({ all: true }),
  // Define the format of the message showing the timestamp, the level and the message
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport for all logs
  new winston.transports.Console(),
  // File transport for error logs
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
  }),
  // File transport for all logs
  new winston.transports.File({ filename: 'logs/all.log' }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

/**
 * Log an error message
 * @param message - The error message
 * @param meta - Additional metadata
 */
export function logError(message: string, meta?: any): void {
  logger.error(`${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

/**
 * Log a warning message
 * @param message - The warning message
 * @param meta - Additional metadata
 */
export function logWarn(message: string, meta?: any): void {
  logger.warn(`${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

/**
 * Log an info message
 * @param message - The info message
 * @param meta - Additional metadata
 */
export function logInfo(message: string, meta?: any): void {
  logger.info(`${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

/**
 * Log an HTTP request
 * @param message - The HTTP request message
 * @param meta - Additional metadata
 */
export function logHttp(message: string, meta?: any): void {
  logger.http(`${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

/**
 * Log a debug message
 * @param message - The debug message
 * @param meta - Additional metadata
 */
export function logDebug(message: string, meta?: any): void {
  logger.debug(`${message}${meta ? ' ' + JSON.stringify(meta) : ''}`);
}

export default {
  logError,
  logWarn,
  logInfo,
  logHttp,
  logDebug,
};