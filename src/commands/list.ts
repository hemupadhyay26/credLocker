import { fetchCredentials } from "../services/credentials"; // Import necessary functions
import { handleCommandError } from "../utils/errorHandler";
import Table from 'cli-table3';

async function listCredentialsCommandFun() {
  const keyTypes = ["IAM User", "AWS Root User"];
  const allCredentials = [];

  for (const keyType of keyTypes) {
    const credentials = await fetchCredentials(keyType);
    allCredentials.push(...credentials.map(cred => ({ id: cred.id, name: cred.name, keyType })));
  }

  if (allCredentials.length === 0) {
    console.log("No credentials to display.");
    return;
  }

  const table = new Table({
    head: ['ID', 'Name', 'Key Type'],
    colWidths: [40, 20, 20], // Adjust column width as needed
    wordWrap: true,
  });

  allCredentials.forEach(cred => {
    table.push([cred.id, cred.name, cred.keyType]);
  });

  console.log(table.toString());
}

export const listCredentialsCommand = handleCommandError(listCredentialsCommandFun);