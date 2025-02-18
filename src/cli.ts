import { configureCommand } from './commands/configure';
import { setCredentialsCommand } from './commands/set';
import { getCredentialsCommand } from './commands/get';

async function main() {
  const args = process.argv.slice(2);

  if (args[0] === "configure") {
    await configureCommand();
  } else if (args[0] === "set") {
    await setCredentialsCommand();
  } else if (args[0] === "get") {
    await getCredentialsCommand();
  } else {
    console.info("Please use 'configure', 'set', or 'get' as a command.");
  }
}

// Graceful shutdown function to clean up resources before exit
async function gracefulShutdown() {
  console.info("Received shutdown signal, cleaning up...");

  // Perform any necessary cleanup here (e.g., closing database connections, removing temporary files)
  // Example: dbConnection.close();

  console.info("Cleanup complete, shutting down.");
  process.exit(0); // Exit gracefully
}

// Catch unhandled errors and exceptions
function handleError(error: any) {
  console.error("An uncaught exception or unhandled promise rejection occurred:", error);

  // Gracefully shutdown after logging the error
  gracefulShutdown();
}

// Main program execution with error handling
async function runApp() {
  try {
    await main();
  } catch (error) {
    console.error("An error occurred:", error);

    // If error occurs, gracefully shutdown
    await gracefulShutdown();
  }
}

// Listen for termination signals and handle them
process.on('SIGINT', () => {
  console.info("SIGINT received, shutting down...");
  gracefulShutdown();
});

process.on('SIGTERM', () => {
  console.info("SIGTERM received, shutting down...");
  gracefulShutdown();
});

// Handle uncaught exceptions (e.g., code that throws unhandled errors)
process.on('uncaughtException', (error) => {
  handleError(error);
});

// Handle unhandled promise rejections (if a promise is rejected but not caught)
process.on('unhandledRejection', (reason: any) => {
  handleError(reason);
});

// Start the application
runApp();
