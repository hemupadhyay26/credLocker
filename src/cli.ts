#!/usr/bin/env node

// Your CLI code below
import { Command } from 'commander';
import { configureCommand } from './commands/configure';
import { setCredentialsCommand } from './commands/set';
import { getCredentialsCommand } from './commands/get';
import { deleteCredentialAction } from './commands/deleteCredentialCommand';
import { updateCredentialsCommand } from "./commands/update"

const program = new Command();

program
  .name('cli-package-name') // This will be the name of your CLI
  .description('CLI application to manage credentials')
  .version('1.0.0');

// Define the "configure" command
program
  .command("configure")
  .description("Configure the application settings")
  .option("-p, --pass <password>", "Set the master password directly from the command line")
  .action(async (cmd) => {
    const { pass } = cmd; // Get the password from the flag
    await configureCommand(pass); // Pass the password to the command function
  });

// Define the "set" command
program
  .command('set')
  .description('Set credentials for AWS logging')
  .action(async () => {
    await setCredentialsCommand();
  });

// Define the "get" command
program
  .command("get")
  .description("Get credentials from storage")
  .option("-d, --decrypt", "Decrypt credentials and show them") // Add the --decrypt flag
  .option("-i, --identifier <identifier>", "Specify the credential name or ID") // Add the --identifier flag
  .action(async (cmd) => {
    const { decrypt, identifier } = cmd; // Get the decrypt flag and identifier
    await getCredentialsCommand(decrypt, identifier); // Pass the flags to the command function
  });


  program
  .command('delete')
  .description('Delete a credential by name or ID')
  .option('-i, --identifier <identifier>', 'Credential identifier (name or ID)', '')
  .action(async (cmd) => {
    const { identifier } = cmd;
    // Call the function from the commands folder to handle delete logic
    await deleteCredentialAction(identifier);
  });

  program
  .command('update')
  .description('Update existing credentials')
  .option('-i, --identifier <identifier>', 'Specify the credential name or ID')
  .action(async (cmd) => {
    const { identifier } = cmd;
    await updateCredentialsCommand(identifier);
  });

// Graceful shutdown function
async function gracefulShutdown() {
  console.info('Received shutdown signal, cleaning up...');
  console.info('Cleanup complete, shutting down.');
  process.exit(0); // Exit gracefully
}

// Catch unhandled errors and exceptions
function handleError(error: any) {
  console.error('An uncaught exception or unhandled promise rejection occurred:', error);
  gracefulShutdown();
}

// Main function that invokes the program
async function runApp() {
  try {
    await program.parseAsync(process.argv); // This parses the command-line arguments
  } catch (error) {
    console.error('An error occurred:', error);
    await gracefulShutdown();
  }
}

// Start the application
runApp();
