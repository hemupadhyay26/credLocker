import inquirer from "inquirer";
import { deleteCredentialByNameOrId } from "../services/credentials"; // Import the delete service
import { config } from "../config/config"; // Import the config to get the file path
import { handleCommandError } from "../utils/errorHandler";

// Function to handle the delete action
export async function deleteCredentialActionFun(identifier: string) {
  // If identifier is provided via flag
  if (identifier) {
    console.log(`Attempting to delete credential with identifier: ${identifier}`);
    await deleteCredentialByNameOrId(config.configFilePath, identifier);
  } else {
    // If identifier is not provided via flag, ask user interactively
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'identifier',
        message: 'Enter the credential name or ID to delete:',
        validate: (input) => (input ? true : 'Identifier cannot be empty'),
      },
    ]);

    console.log(`Attempting to delete credential with identifier: ${answers.identifier}`);
    await deleteCredentialByNameOrId(config.configFilePath, answers.identifier);
  }
}

export const deleteCredentialAction = handleCommandError(deleteCredentialActionFun);