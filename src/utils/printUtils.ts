import { Credential } from "../types";

function formatCredential(credential: Credential): string {
  return `
  ID: ${credential.id}
  Name: ${credential.name}
  Username: ${credential.username}
  Password: ${credential.password}
  ${credential.accountIdentifier ? `Account Identifier: ${credential.accountIdentifier}` : ''}
  Created At: ${credential.createdAt}
  Last Updated At: ${credential.lastUpdatedAt}
  `;
}

export function printCredentials(credentials: Credential[]) {
  if (credentials.length === 0) {
    console.log("No credentials to display.");
    return;
  }

  credentials.forEach(credential => {
    console.log(formatCredential(credential));
    console.log('----------------------------------------');
  });
}

export function printCredential(credential: Credential) {
  console.log(formatCredential(credential));
}

export function printNoCredentialFound(identifier: string) {
  console.log(`No credential found with name or ID ${identifier}.`);
}

export function printNoCredentialsFound(keyType: string) {
  console.log(`No credentials found for ${keyType}.`);
}

export function printDecryptedCredential(credential: Credential) {
  printCredential(credential);
}