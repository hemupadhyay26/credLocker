import inquirer from "inquirer";
import { appendCredentials } from "../services/credentials"; // Import service for appending credentials
import { handleCommandError } from "../utils/errorHandler";
import { Command } from "commander";

async function setCredentialsCommandFun() {
  const nameAnswer = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Enter the name for the credential owner:",
      validate: (input) => input ? true : "This field is required.",
    },
  ]);

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "keyType",
      message: "Select credential type to set:",
      choices: ["IAM User", "AWS Root User"],
    },
  ]);

  let credentialDetails: any = {
    name: nameAnswer.name,
    keyType: answers.keyType,
  };

  if (answers.keyType === "IAM User") {
    const iamAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Enter the IAM username:",
        validate: (input) => input ? true : "This field is required.",
      },
      {
        type: "input",
        name: "password",
        message: "Enter the IAM password:",
        validate: (input) => input ? true : "This field is required.",
      },
      {
        type: "input",
        name: "accountIdentifier",
        message: "Enter the account identifier:",
        validate: (input) => input ? true : "This field is required.",
      },
    ]);
    credentialDetails = { ...credentialDetails, ...iamAnswers };
  } else if (answers.keyType === "AWS Root User") {
    const rootUserAnswers = await inquirer.prompt([
      {
        type: "input",
        name: "username",
        message: "Enter the AWS root username:",
        validate: (input) => input ? true : "This field is required.",
      },
      {
        type: "input",
        name: "password",
        message: "Enter the AWS root password:",
        validate: (input) => input ? true : "This field is required.",
      },
    ]);
    credentialDetails = { ...credentialDetails, ...rootUserAnswers };
  }

  await appendCredentials(answers.keyType, credentialDetails, true);
  console.log("Credential saved successfully.");
}

export const setCredentialsCommand = handleCommandError(setCredentialsCommandFun);