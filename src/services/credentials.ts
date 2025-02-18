import { encrypt, decrypt } from "../services/encryption"; // Import encryption functions
import { config } from "../config/config"; // Import the config object
import { createOrUpdateJsonFile, fetchJsonKey, deleteJsonKey, readJsonFile } from "../utils/fileOperations"; // Import CRUD operations

const configFilePath = config.configFilePath;
const MASTER_PASSWORD_KEY = config.MASTER_PASSWORD_KEY;

// Function to append credentials to the JSON file, with optional encryption for sensitive fields
export async function appendCredentials(keyType: string, newCredentials: any, encryptData: boolean) {
  let configData: any = await readJsonFile(configFilePath); // Read the existing JSON file
  
  if (!Array.isArray(configData[keyType])) {
    configData[keyType] = [];
  }

  if (encryptData) {
    const masterPassword = await getMasterPassword();
    if (!masterPassword) {
      console.log("Master password is not set. Please run 'node cli.js configure' to set it.");
      return;
    }
    newCredentials.password = await encrypt(newCredentials.password, masterPassword);
  }

  configData[keyType].push(newCredentials);

  await createOrUpdateJsonFile(configFilePath, configData); // Use the utility to save the updated data

  console.log(`${keyType} credentials appended to 'credentials.json'.`);
}

export async function getMasterPassword() {
  let configData: any = await readJsonFile(configFilePath); // Read the config file

  const masterPassword = configData[MASTER_PASSWORD_KEY];

  if (!masterPassword) {
    console.log("Master password is not set. Please run 'configure' first.");
    process.exit(1); // Exit the process if no master password is set
  }

  return masterPassword;
}

// Function to ensure the credentials file exists and is loaded
async function ensureCredentialsFileExists() {
  let configData: any = await readJsonFile(configFilePath); // Read config data

  if (!configData) {
    console.log("No credentials file found.");
    return {};
  }

  return configData;
}

// Function to fetch credentials from the file
export async function fetchCredentials(keyType: string): Promise<any[]> {
  const configData: any = await readJsonFile(configFilePath); // Read config file

  const credentials = configData[keyType] || [];
  return credentials;
}

// Function to decrypt credentials
export async function decryptCredentials(keyType: string): Promise<any[]> {
  const credentials = await fetchCredentials(keyType); // Fetch the credentials
  const masterPassword = await getMasterPassword();

  if (!masterPassword) {
    console.log("Master password is not set.");
    return [];
  }

  for (let i = 0; i < credentials.length; i++) {
    const encryptedPassword = credentials[i].password;
    if (encryptedPassword) {
      credentials[i].password = await decrypt(encryptedPassword, masterPassword);
    }
  }

  return credentials;
}

// Function to fetch specific credential and optionally decrypt it
export async function getCredential(keyType: string, decryptData: boolean = true) {
  const credentials = await fetchCredentials(keyType); // Fetch credentials

  if (!credentials) {
    console.log(`No credentials found for ${keyType}`);
    return null;
  }

  if (decryptData) {
    const decryptedCredentials = await decryptCredentials(keyType); // Decrypt credentials if required
    decryptedCredentials.forEach((cred) => {
      console.log(`Username: ${cred.username}`);
      console.log(`Password: ${cred.password}`);
    });
    return decryptedCredentials;
  } else {
    console.log("Returning stored credentials without decryption.");
    return credentials;
  }
}
