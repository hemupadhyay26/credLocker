import crypto from 'crypto';

// Define algorithm and key length
const ALGORITHM = 'aes-256-cbc'; // AES encryption algorithm
const IV_LENGTH = 16; // Initialization Vector length for AES

// Function to generate a random key and IV
function generateKeyAndIv(secretKey: string) {
  // Create a key from the secret (password)
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = crypto.randomBytes(IV_LENGTH);
  return { key, iv };
}

// Encrypt data using a secret key
export function encrypt(data: string, secretKey: string): string {
  const { key, iv } = generateKeyAndIv(secretKey);

  // Create the cipher instance
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  // Return the encrypted data along with the IV (required for decryption)
  return `${iv.toString('base64')}:${encrypted}`;
}

// Decrypt data using a secret key
export function decrypt(encryptedData: string, secretKey: string): string | null {
  const [ivBase64, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivBase64, 'base64');

  // Ensure the IV is of correct length
  if (iv.length !== IV_LENGTH) {
    console.error('Invalid IV length');
    return null;
  }

  const { key } = generateKeyAndIv(secretKey);

  // Create the decipher instance
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  try {
    // Decrypt the data
    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}
