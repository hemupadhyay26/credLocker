import inquirer from "inquirer";
import { fetchCredentials, updateCredential } from "../services/credentials"; // Import necessary functions
import { handleCommandError } from "../utils/errorHandler";

async function updateCredentialsCommandFun(identifier: string | undefined) {
  if (!identifier) {
    const identifierAnswer = await inquirer.prompt([
      {
        type: "input",
        name: "identifier",
        message: "Enter the credential name or ID to update:",
        validate: (input) => input ? true : "This field is required.",
      },
    ]);
    identifier = identifierAnswer.identifier;
  }

  const keyTypeAnswer = await inquirer.prompt([
    {
      type: "list",
      name: "keyType",
      message: "Select credential type to update:",
      choices: ["IAM User", "AWS Root User"],
    },
  ]);

  const credentials = await fetchCredentials(keyTypeAnswer.keyType);
  const credential = credentials.find(cred => cred.name === identifier || cred.id === identifier);

  if (!credential) {
    console.error(`No credential found with name or ID '${identifier}'.`);
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "username",
      message: `Enter the new username (current: ${credential.username}):`,
    },
    {
      type: "password",
      name: "password",
      message: `Enter the new password (current: ***):`,
      mask: '*',
    },
    {
      type: "input",
      name: "accountIdentifier",
      message: `Enter the new account identifier (current: ${credential.accountIdentifier ? '***' : ''}):`,
    },
  ]);

  const updatedData: any = {};
  if (answers.username && answers.username !== credential.username) {
    updatedData.username = answers.username;
  }
  if (answers.password && answers.password !== '***') {
    updatedData.password = answers.password;
  }
  if (answers.accountIdentifier && answers.accountIdentifier !== credential.accountIdentifier) {
    updatedData.accountIdentifier = answers.accountIdentifier;
  }

  if (Object.keys(updatedData).length > 0) {
    await updateCredential(keyTypeAnswer.keyType, identifier!, updatedData, true);
  } else {
    console.log("No changes detected.");
  }
}

export const updateCredentialsCommand = handleCommandError(updateCredentialsCommandFun);