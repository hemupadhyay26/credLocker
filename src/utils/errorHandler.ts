// utils/errorHandler.ts

function logInDevelopment(message: string, isError = false) {
    if (process.env.NODE_ENV === 'development') {
      if (isError) {
        console.error(message);
      } else {
        console.info(message);
      }
    }
  }
  
  // Global error handler wrapper function
  export function handleCommandError(commandFunction: Function) {
    return async (...args: any[]) => {
      try {
        await commandFunction(...args);
      } catch (error) {
        logInDevelopment("An error occurred:", true);
        logInDevelopment(String(error), true);
      }
    };
  }
  