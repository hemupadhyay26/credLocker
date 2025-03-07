import inquirer from "inquirer";
import { fetchCredentials, decryptCredential } from "../services/credentials"; // Import services for fetching and decrypting
import { getMasterPassword } from "../services/credentials"; // Import service for master password
import { handleCommandError } from "../utils/errorHandler";
import { Command } from "commander";

async function getCredentialsCommandFun(decrypt: boolean, identifier: string | undefined) {
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
    let selectedCreds;

    if (!identifier) {
      const credentialNames = credentials.map((cred) => cred.name);

      const selectedCredentials = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selectedNames",
          message: "Select the credentials to retrieve:",
          choices: credentialNames,
        },
      ]);

      selectedCreds = credentials.filter((cred) =>
        selectedCredentials.selectedNames.includes(cred.name)
      );
    } else {
      selectedCreds = credentials.filter(
        (cred) => cred.name === identifier || cred.id === identifier
      );

      if (selectedCreds.length === 0) {
        console.log(`No credential found with name or ID ${identifier}.`);
        return;
      }
    }

    for (const credential of selectedCreds) {
      if (decrypt) {
        const decryptedCredential = await decryptCredential(credential);
        console.log("Retrieved decrypted credential:", decryptedCredential);
      } else {
        console.log("Retrieved credential:", credential);
      }
    }
  } else {
    console.log(`No credentials found for ${answers.keyType}.`);
  }
}

export const getCredentialsCommand = handleCommandError(getCredentialsCommandFun);