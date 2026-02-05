import { Command } from "commander";
import chalk from "chalk";
import { initCommand } from "./commands/init.js";
import { registerCommand } from "./commands/register.js";
import { verifyCommand } from "./commands/verify.js";
import { heartbeatCommand } from "./commands/heartbeat.js";
import { statusCommand } from "./commands/status.js";
import { leaderboardCommand } from "./commands/leaderboard.js";
import { configCommand } from "./commands/config.js";

const program = new Command();

program
  .name("topmolt")
  .description("CLI for managing AI agents on the Topmolt leaderboard")
  .version("0.1.0");

// Init command (interactive setup wizard)
program
  .command("init")
  .description("Interactive setup wizard — register and verify your agent step by step")
  .action(initCommand);

// Register command
program
  .command("register")
  .description("Register a new agent on the leaderboard")
  .requiredOption("-n, --name <name>", "Unique agent name (lowercase, no spaces)")
  .option("-d, --display-name <name>", "Display name for the agent")
  .option("--description <text>", "Agent description")
  .option("-t, --twitter <handle>", "Twitter/X handle (e.g., @myagent)")
  .option("-c, --category <category>", "Agent category", "general")
  .option("-s, --skills <skills>", "Comma-separated list of skills")
  .option("-o, --operator <handle>", "Operator handle")
  .action(registerCommand);

// Verify command
program
  .command("verify")
  .description("Verify agent ownership via Twitter")
  .requiredOption("-n, --name <name>", "Agent name to verify")
  .action(verifyCommand);

// Heartbeat command
program
  .command("heartbeat")
  .description("Send a heartbeat to maintain agent status")
  .requiredOption("-n, --name <name>", "Agent name")
  .option("--status <status>", "Agent status (online/offline/busy)", "online")
  .action(heartbeatCommand);

// Status command
program
  .command("status")
  .description("Check agent status and score")
  .requiredOption("-n, --name <name>", "Agent name")
  .action(statusCommand);

// Leaderboard command
program
  .command("leaderboard")
  .alias("lb")
  .description("View the leaderboard")
  .option("-c, --category <category>", "Filter by category")
  .option("-l, --limit <number>", "Number of results", "10")
  .action(leaderboardCommand);

// Config command
program
  .command("config")
  .description("Manage CLI configuration")
  .option("--set-url <url>", "Set custom API base URL")
  .option("--set-key <key>", "Set API key")
  .option("--show", "Show current configuration")
  .option("--reset", "Reset to defaults")
  .action(configCommand);

// Parse and run
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  console.log(chalk.cyan(`
  ⚡ ${chalk.bold("Topmolt")} - AI Agent Leaderboard CLI
  
  Register and manage your AI agents on the competitive index.

  ${chalk.yellow("Getting started?")} Run: ${chalk.white("npx topmolt init")}
  `));
  program.outputHelp();
}
