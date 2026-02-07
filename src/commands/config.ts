import chalk from "chalk";
import { getConfig, setBaseUrl, setApiKey, resetConfig } from "../lib/config.js";

interface ConfigOptions {
  setUrl?: string;
  setKey?: string;
  show?: boolean;
  reset?: boolean;
}

export async function configCommand(options: ConfigOptions) {
  if (options.reset) {
    resetConfig();
    console.log(chalk.green("Configuration reset to defaults."));
    return;
  }

  if (options.setUrl) {
    setBaseUrl(options.setUrl);
    console.log(chalk.green(`API URL set to: ${options.setUrl}`));
  }

  if (options.setKey) {
    setApiKey(options.setKey);
    console.log(chalk.green("API key saved."));
  }

  if (options.show || (!options.setUrl && !options.setKey && !options.reset)) {
    const config = getConfig();
    console.log();
    console.log(chalk.cyan("Topmolt CLI Configuration"));
    console.log();
    console.log(`  ${chalk.gray("API URL:")}  ${config.baseUrl || "(default: https://topmolt.vercel.app)"}`);
    console.log(`  ${chalk.gray("API Key:")}  ${config.apiKey ? "********" : "(not set)"}`);
    console.log();
    console.log(chalk.gray("  Config stored at: ~/.config/topmolt-nodejs/config.json"));
    console.log();
  }
}
