import winston from 'winston';

const { combine, timestamp, printf, colorize, simple } = winston.format;

// Define a custom format for your logs
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Create a logger instance
const logger = winston.createLogger({
  level: 'info', // Default to 'info' level
  format: combine(
    timestamp(),
    colorize(), // This makes the logs colorful
    logFormat
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() }), // Output to console
  ],
});

if (process.env.NODE_ENV !== 'development') {
  // Remove the error logging if it's not in development
  logger.transports.forEach((transport) => {
    if (transport instanceof winston.transports.Console) {
      transport.silent = true; // Disable console logs in non-development environments
    }
  });
}

export default logger;
