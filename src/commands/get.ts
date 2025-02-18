import inquirer from "inquirer";
import { fetchCredentials, decryptCredentials } from "../services/credentials"; // Import services for fetching and decrypting
import { getMasterPassword } from "../services/credentials"; // Import service for master password
import { handleCommandError } from "../utils/errorHandler";


async function getCredentialsCommandfun() {
  await getMasterPassword(); // Ensure the master password is set

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "keyType",
      message: "Select credential type to retrieve:",
      choices: ["IAM User", "AWS Root User"],
    },
  ]);

  const credentials = await fetchCredentials(answers.keyType);

  if (credentials && credentials.length > 0) {
    const { masterPassword } = await inquirer.prompt([
      {
        type: "password",
        name: "masterPassword",
        message: "Enter your master password:",
        mask: "*",
        validate: (input) => (input ? true : "Master password cannot be empty"),
      },
    ]);

    const savedMasterPassword = await getMasterPassword();
    if (masterPassword !== savedMasterPassword) {
      console.log("Invalid master password.");
      return;
    }

    const decryptedCredentials = await decryptCredentials(answers.keyType);
    console.log("Retrieved decrypted credentials:", decryptedCredentials);
  } else {
    console.log(`No credentials found for ${answers.keyType}.`);
  }
}


export const getCredentialsCommand = handleCommandError(getCredentialsCommandfun);
