import fs from "fs-extra";

// Helper function to read a JSON file and return its contents, or an empty object if the file doesn't exist
export async function readJsonFile(filePath: string): Promise<any> {
  const fileExists = await fs.pathExists(filePath);
  if (fileExists) {
    return await fs.readJson(filePath);
  } else {
    return {}; // Return an empty object if the file doesn't exist
  }
}

// Helper function to write JSON data to a file
export async function writeJsonFile(filePath: string, data: any): Promise<void> {
  await fs.writeJson(filePath, data, { spaces: 2 });
}

// Ensures that the file exists, creating it if necessary
export async function ensureFileExists(filePath: string): Promise<void> {
  const fileExists = await fs.pathExists(filePath);
  if (!fileExists) {
    await fs.ensureFile(filePath); // Create the file if it doesn't exist
  }
}

// Create or update a record in the JSON file
export async function createOrUpdateJsonFile(filePath: string, data: any): Promise<void> {
  await ensureFileExists(filePath);
  const existingData = await readJsonFile(filePath);
  
  // Merge or create new data (you could update a specific field depending on your needs)
  const updatedData = { ...existingData, ...data }; 
  
  await writeJsonFile(filePath, updatedData);  // Write the updated data back to the file
  console.log("Data has been added/updated successfully.");
}

// Delete a key or record in the JSON file
export async function deleteJsonKey(filePath: string, key: string): Promise<void> {
  const existingData = await readJsonFile(filePath);
  
  if (existingData[key]) {
    delete existingData[key];  // Remove the key from the existing data
    await writeJsonFile(filePath, existingData);  // Write the modified data back to the file
    console.log(`${key} has been deleted from the JSON file.`);
  } else {
    console.log(`${key} not found in the JSON file.`);
  }
}

// Fetch a specific record from the JSON file
export async function fetchJsonKey(filePath: string, key: string): Promise<any> {
  const existingData = await readJsonFile(filePath);
  return existingData[key] || null; // Return the specific key or null if not found
}
