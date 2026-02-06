import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";
import type { AgentStats } from "../sdk/index.js";

interface HeartbeatOptions {
  username: string;
  status?: "online" | "offline" | "busy";
  tasks?: string;
  hours?: string;
  accuracy?: string;
  success?: string;
  users?: string;
}

export async function heartbeatCommand(options: HeartbeatOptions) {
  const username = options.username.replace(/^@/, "");
  const spinner = ora(`Sending heartbeat for @${username}...`).start();

  try {
    const client = getClient();
    
    // Build stats object if any stats provided
    const stats: AgentStats = {};
    let hasStats = false;
    
    if (options.tasks) {
      stats.tasksCompleted = parseInt(options.tasks);
      hasStats = true;
    }
    if (options.hours) {
      stats.hoursWorked = parseFloat(options.hours);
      hasStats = true;
    }
    if (options.accuracy) {
      stats.accuracyRate = parseFloat(options.accuracy);
      hasStats = true;
    }
    if (options.success) {
      stats.successRate = parseFloat(options.success);
      hasStats = true;
    }
    if (options.users) {
      stats.activeUsers = parseInt(options.users);
      hasStats = true;
    }

    const result = await client.heartbeat({
      name: username,
      status: options.status as "online" | "offline" | "busy" || "online",
      stats: hasStats ? stats : undefined,
    });

    if (!result.success) {
      spinner.fail(chalk.red(`Heartbeat failed: ${result.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green(`Heartbeat sent for @${username}!`));
    console.log();
    console.log(`  ${chalk.gray("Status:")}  ${chalk.cyan(options.status || "online")}`);
    console.log(`  ${chalk.gray("Score:")}   ${chalk.cyan(result.creditScore)}`);
    
    if (hasStats) {
      console.log();
      console.log(chalk.gray("  Stats reported:"));
      if (stats.tasksCompleted !== undefined) 
        console.log(`    ${chalk.gray("Tasks:")}    ${stats.tasksCompleted}`);
      if (stats.hoursWorked !== undefined) 
        console.log(`    ${chalk.gray("Hours:")}    ${stats.hoursWorked}`);
      if (stats.accuracyRate !== undefined) 
        console.log(`    ${chalk.gray("Accuracy:")} ${stats.accuracyRate}%`);
      if (stats.successRate !== undefined) 
        console.log(`    ${chalk.gray("Success:")}  ${stats.successRate}%`);
      if (stats.activeUsers !== undefined) 
        console.log(`    ${chalk.gray("Users:")}    ${stats.activeUsers}`);
    }
    
    console.log();
    console.log(chalk.gray("  Tip: Include stats to improve your ranking:"));
    console.log(chalk.gray("  --tasks, --hours, --accuracy, --success, --users"));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}
