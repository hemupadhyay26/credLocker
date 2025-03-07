import { encrypt, decrypt } from "../services/encryption"; 
import { config } from "../config/config";
import { createOrUpdateJsonFile, readJsonFile, writeJsonFile } from "../utils/fileOperations"; 
import { v4 as uuidv4 } from "uuid"; 
import dayjs from "dayjs"; 
import { Credential, ConfigData } from "../types"; // Import types

const configFilePath = config.configFilePath;
const MASTER_PASSWORD_KEY = config.MASTER_PASSWORD_KEY;

export async function appendCredentials(keyType: string, newCredentials: Omit<Credential, 'id' | 'createdAt' | 'lastUpdatedAt'>, encryptData: boolean): Promise<void> {
  let configData: ConfigData = await readJsonFile(configFilePath); // Read the existing JSON file
  
  if (!Array.isArray(configData[keyType])) {
    configData[keyType] = [];
  }

  // Check if the name is unique by checking the existing credentials
  const isNameUnique = !configData[keyType].some((cred) => cred.name === newCredentials.name);
  if (!isNameUnique) {
    console.log(`Error: The name '${newCredentials.name}' is already used for another credential.`);
    return; // Reject the new credentials if name is not unique
  }

  // Encrypt sensitive data if needed
  if (encryptData) {
    const masterPassword = await getMasterPassword();
    if (!masterPassword) {
      console.log("Master password is not set. Please run 'node cli.js configure' to set it.");
      return;
    }
    
    // Encrypt both password and accountIdentifier
    if (newCredentials.password) {
      newCredentials.password = await encrypt(newCredentials.password, masterPassword);
    }
    
    if (newCredentials.accountIdentifier) {
      newCredentials.accountIdentifier = await encrypt(newCredentials.accountIdentifier, masterPassword);
    }
  }

  // Add timestamps and unique ID
  const currentTime = dayjs().toISOString(); // ISO format timestamp
  const credential: Credential = {
    ...newCredentials,
    id: uuidv4(), // Generate unique ID using UUID
    createdAt: currentTime,
    lastUpdatedAt: currentTime,
  };

  configData[keyType].push(credential);

  await createOrUpdateJsonFile(configFilePath, configData); // Use the utility to save the updated data

  console.log(`${keyType} credentials for '${newCredentials.name}' have been appended to 'credentials.json'.`);
}

export async function getMasterPassword(): Promise<string> {
  const configData: ConfigData = await readJsonFile(configFilePath); // Read the config file

  const masterPassword = configData[MASTER_PASSWORD_KEY] as unknown as string;

  if (!masterPassword) {
    console.log("Master password is not set. Please run 'configure' first.");
    process.exit(1); // Exit the process if no master password is set
  }

  return masterPassword;
}

// Function to fetch credentials from the file
export async function fetchCredentials(keyType: string): Promise<Credential[]> {
  const configData: ConfigData = await readJsonFile(configFilePath); // Read config file

  return configData[keyType] || [];
}

// Function to decrypt credentials
export async function decryptCredential(credential: Credential): Promise<Credential | null> {
  const masterPassword = await getMasterPassword();

  if (!masterPassword) {
    console.log("Master password is not set.");
    return null;
  }

  if (credential.password) {
    const decryptedPassword = await decrypt(credential.password, masterPassword);
    credential.password = decryptedPassword !== null ? decryptedPassword : credential.password;
  }
  if (credential.accountIdentifier) {
    const decryptedAccountIdentifier = await decrypt(credential.accountIdentifier, masterPassword);
    credential.accountIdentifier = decryptedAccountIdentifier !== null ? decryptedAccountIdentifier : credential.accountIdentifier;
  }

  return credential;
}

// Function to delete a credential by its name or id from the JSON file
export async function deleteCredentialByNameOrId(filePath: string, identifier: string): Promise<void> {
  let configData: ConfigData = await readJsonFile(filePath); // Read the existing JSON file

  // Check if the data exists for the keyType, assuming it's in IAM User and AWS Root User
  const keyTypes = ["IAM User", "AWS Root User"]; // Adjust this list based on your key types

  let isDeleted = false;

  for (const keyType of keyTypes) {
    if (Array.isArray(configData[keyType])) {
      const index = configData[keyType].findIndex(
        (cred) => cred.name === identifier || cred.id === identifier // Match either by name or id
      );

      if (index !== -1) {
        // Delete the credential if found
        configData[keyType].splice(index, 1);
        isDeleted = true;
        console.log(`Credential with ${identifier} has been deleted from '${keyType}'`);
        break; // Exit loop if credential is found and deleted
      }
    }
  }

  // If no credential was found for deletion
  if (!isDeleted) {
    console.log(`No credential found with identifier: ${identifier}`);
    return;
  }

  // Write the updated data back to the JSON file
  await writeJsonFile(filePath, configData);
}

export async function updateCredential(keyType: string, identifier: string, updatedData: Partial<Credential>, encryptData: boolean): Promise<void> {
  let configData: ConfigData = await readJsonFile(configFilePath);

  if (!Array.isArray(configData[keyType])) {
    return console.log(`No credentials found for key type '${keyType}'.`);
  }

  const index = configData[keyType].findIndex(cred => cred.name === identifier || cred.id === identifier);
  if (index === -1) return console.log(`No credential found with name or ID '${identifier}'.`);

  const existingCredential = configData[keyType][index];
  const masterPassword = await getMasterPassword();
  if (!masterPassword) return console.log("Master password is not set. Please run 'node cli.js configure' to set it.");

  const updateField = async (field: keyof Credential, value?: string) =>
    value !== undefined ? (encryptData ? await encrypt(value, masterPassword) : value) : existingCredential[field];

  const updatedCredential: Credential = {
    ...existingCredential,
    ...updatedData,
    password: (await updateField('password', updatedData.password)) || '',
    accountIdentifier: (await updateField('accountIdentifier', updatedData.accountIdentifier)) || '',
    lastUpdatedAt: dayjs().toISOString(),
  };

  configData[keyType][index] = updatedCredential;
  await createOrUpdateJsonFile(configFilePath, configData);
  console.log(`Credential with name or ID '${identifier}' has been updated.`);
}
