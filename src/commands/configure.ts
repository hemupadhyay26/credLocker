import inquirer from "inquirer";
import fs from "fs-extra";
import { config } from "../config/config";
import { handleCommandError } from "../utils/errorHandler";

const MASTER_PASSWORD_KEY = config.MASTER_PASSWORD_KEY
const configFilePath = config.configFilePath

export async function configureCommandfun() {
  let configData: any = {};
  const fileExists = await fs.pathExists(configFilePath);
  if (fileExists) {
    configData = await fs.readJson(configFilePath);
  }

  const currentMasterPassword = configData[MASTER_PASSWORD_KEY];
  const { masterPassword } = await inquirer.prompt([
    {
      type: "password",
      name: "masterPassword",
      message: `Set or update your master password (${currentMasterPassword ? `${currentMasterPassword}` : "No previous master password found."}):`,
      mask: "*",
      validate: (input) => (input ? true : "Master password cannot be empty"),
    },
  ]);

  configData[MASTER_PASSWORD_KEY] = masterPassword;
  await fs.writeJson(configFilePath, configData, { spaces: 2 });

  console.log("Master password has been set/updated successfully.");
}

export const configureCommand = handleCommandError(configureCommandfun);
