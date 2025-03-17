#!/usr/bin/env node

import { Command } from "commander";
import { setCredentialsCommand } from "./commands/set";
import { getCredentialsCommand } from "./commands/get";
import { updateCredentialsCommand } from "./commands/update";
import { listCredentialsCommand } from "./commands/list";
import { deleteCredentialAction } from "./commands/delete"; // Import the delete command

const program = new Command();

program
  .name('credlock')
  .description('CLI application to manage credentials')
  .version('1.0.0');

program
  .command('set')
  .alias('s')
  .description('Set credentials for AWS logging')
  .action(async () => {
    await setCredentialsCommand();
  });

program
  .command('get')
  .alias('g')
  .description('Get credentials from storage')
  .option('-d, --decrypt', 'Decrypt credentials and show them')
  .option('-i, --identifier <identifier>', 'Specify the credential name or ID')
  .action(async (cmd) => {
    const { decrypt, identifier } = cmd;
    await getCredentialsCommand(decrypt, identifier);
  });

program
  .command('update')
  .alias('u')
  .description('Update existing credentials')
  .option('-i, --identifier <identifier>', 'Specify the credential name or ID')
  .action(async (cmd) => {
    const { identifier } = cmd;
    await updateCredentialsCommand(identifier);
  });

program
  .command('list')
  .alias('l')
  .description('List all available credentials')
  .action(async () => {
    await listCredentialsCommand();
  });

program
  .command('delete')
  .alias('d')
  .description('Delete a credential')
  .option('-i, --identifier <identifier>', 'Specify the credential name or ID')
  .action(async (cmd) => {
    const { identifier } = cmd;
    await deleteCredentialAction(identifier);
  });

program.parse(process.argv);