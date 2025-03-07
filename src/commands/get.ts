import inquirer from "inquirer";
import { fetchCredentials, decryptCredential } from "../services/credentials"; // Import services for fetching and decrypting
import { getMasterPassword } from "../services/credentials"; // Import service for master password
import { handleCommandError } from "../utils/errorHandler";
import { Command } from "commander";
import { Credential } from "../types"; // Import types
import { printCredentials, printNoCredentialFound, printNoCredentialsFound } from "../utils/printUtils"; // Import print utilities

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

  const credentials: Credential[] = await fetchCredentials(answers.keyType);

  if (credentials && credentials.length > 0) {
    let selectedCreds: Credential[];

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
        printNoCredentialFound(identifier);
        return;
      }
    }

    if (decrypt) {
      const decryptedCreds = await Promise.all(selectedCreds.map(decryptCredential));
      printCredentials(decryptedCreds.filter((cred): cred is Credential => cred !== null));
    } else {
      printCredentials(selectedCreds);
    }
  } else {
    printNoCredentialsFound(answers.keyType);
  }
}

export const getCredentialsCommand = handleCommandError(getCredentialsCommandFun);
