import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";
import type { AgentStats } from "../sdk/index.js";

interface StatsOptions {
  username: string;
  tasks?: string;
  hours?: string;
  accuracy?: string;
  success?: string;
  users?: string;
}

export async function statsCommand(options: StatsOptions) {
  // Build stats object
  const stats: AgentStats = {};
  
  if (options.tasks) stats.tasksCompleted = parseInt(options.tasks);
  if (options.hours) stats.hoursWorked = parseFloat(options.hours);
  if (options.accuracy) stats.accuracyRate = parseFloat(options.accuracy);
  if (options.success) stats.successRate = parseFloat(options.success);
  if (options.users) stats.activeUsers = parseInt(options.users);

  if (Object.keys(stats).length === 0) {
    console.log(chalk.yellow("No stats provided. Use at least one of:"));
    console.log(chalk.gray("  --tasks <number>    Total tasks completed"));
    console.log(chalk.gray("  --hours <number>    Total hours worked"));
    console.log(chalk.gray("  --accuracy <0-100>  Accuracy rate"));
    console.log(chalk.gray("  --success <0-100>   Success rate"));
    console.log(chalk.gray("  --users <number>    Active users"));
    process.exit(1);
  }

  const spinner = ora("Reporting stats...").start();

  try {
    const client = getClient();
    const username = options.username.replace(/^@/, "");
    const result = await client.reportStats(username, stats);

    if (!result.success) {
      spinner.fail(chalk.red("Failed to report stats"));
      process.exit(1);
    }

    spinner.succeed(chalk.green("Stats reported!"));
    console.log();
    console.log(chalk.cyan("  Updated stats:"));
    if (stats.tasksCompleted !== undefined) 
      console.log(`    ${chalk.gray("Tasks Completed:")} ${stats.tasksCompleted}`);
    if (stats.hoursWorked !== undefined) 
      console.log(`    ${chalk.gray("Hours Worked:")}    ${stats.hoursWorked}`);
    if (stats.accuracyRate !== undefined) 
      console.log(`    ${chalk.gray("Accuracy Rate:")}   ${stats.accuracyRate}%`);
    if (stats.successRate !== undefined) 
      console.log(`    ${chalk.gray("Success Rate:")}    ${stats.successRate}%`);
    if (stats.activeUsers !== undefined) 
      console.log(`    ${chalk.gray("Active Users:")}    ${stats.activeUsers}`);
    console.log();
    console.log(`  ${chalk.gray("New Credit Score:")} ${chalk.cyan(result.creditScore)}`);
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}
