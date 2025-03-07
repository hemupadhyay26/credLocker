import inquirer from "inquirer";
import fs from "fs-extra";
import { config } from "../config/config";
import { handleCommandError } from "../utils/errorHandler";

const MASTER_PASSWORD_KEY = config.MASTER_PASSWORD_KEY;
const configFilePath = config.configFilePath;

async function configureCommandFun(pass?: string) {
  let configData: any = {};
  const fileExists = await fs.pathExists(configFilePath);
  if (fileExists) {
    configData = await fs.readJson(configFilePath);
  }

  const currentMasterPassword = configData[MASTER_PASSWORD_KEY];

  let masterPassword: string;

  // If a password is passed via the --pass flag, use it; otherwise, prompt the user
  if (pass) {
    masterPassword = pass;
  } else {
    const { inputPassword } = await inquirer.prompt([
      {
        type: "password",
        name: "inputPassword",
        message: `Set or update your master password (${
          currentMasterPassword ? `${currentMasterPassword}` : "No previous master password found."
        }):`,
        mask: "*",
        validate: (input) => (input ? true : "Master password cannot be empty"),
      },
    ]);
    masterPassword = inputPassword;
  }

  configData[MASTER_PASSWORD_KEY] = masterPassword;
  await fs.writeJson(configFilePath, configData, { spaces: 2 });

  console.log("Master password has been set/updated successfully.");
}

// Wrap the function to handle errors
export const configureCommand = handleCommandError(configureCommandFun);
