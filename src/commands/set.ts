import inquirer from "inquirer";
import { appendCredentials } from "../services/credentials"; // Import service to append credentials
import { getMasterPassword } from "../services/credentials"; // Import service for master password
import logger from "../utils/logger"; // Import the logger
import { handleCommandError } from "../utils/errorHandler";

export async function setCredentialsCommandfun() {
  await getMasterPassword(); // Ensure the master password is set

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "keyType",
      message: "Select credential type:",
      choices: ["IAM User", "AWS Root User"],
    },
    {
      type: "input",
      name: "username",
      message: "Enter IAM Username:",
      when: (answers) => answers.keyType === "IAM User",
      validate: (input) => (input ? true : "Username cannot be empty"),
    },
    {
      type: "password",
      name: "password",
      message: "Enter IAM Password:",
      mask: "*",
      when: (answers) => answers.keyType === "IAM User",
      validate: (input) => (input ? true : "Password cannot be empty"),
    },
    {
      type: "input",
      name: "accountIdentifier",
      message: "Enter Account ID or Account Alias:",
      when: (answers) => answers.keyType === "IAM User",
      validate: (input) => (input ? true : "Account Identifier cannot be empty"),
    },
    {
      type: "confirm",
      name: "encryptData",
      message: "Would you like to encrypt the credentials?",
      default: false,
    },
  ]);

  logger.debug(`Selected Credential Type: ${answers.keyType}`);
  logger.debug(`IAM Username: ${answers.username}`);
  logger.debug(`Account Identifier: ${answers.accountIdentifier}`);
  logger.debug(`Encryption Status: ${answers.encryptData ? "Enabled" : "Disabled"}`);

  await appendCredentials(answers.keyType, answers, answers.encryptData);

  logger.info(`${answers.keyType} credentials have been appended successfully.`);
}


export const setCredentialsCommand = handleCommandError(setCredentialsCommandfun);
