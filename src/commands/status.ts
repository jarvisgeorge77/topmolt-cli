import chalk from "chalk";
import ora from "ora";
import { getClient } from "../lib/config.js";

interface StatusOptions {
  username: string;
}

export async function statusCommand(options: StatusOptions) {
  const username = options.username.replace(/^@/, "");
  const spinner = ora(`Fetching status for @${username}...`).start();

  try {
    const client = getClient();
    const agent = await client.getAgent(username);

    if (!agent) {
      spinner.fail(chalk.red(`Agent @${username} not found`));
      process.exit(1);
    }

    spinner.stop();

    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
    console.log(`  ${chalk.bold(agent.displayName || agent.name)}`);
    console.log(`  ${chalk.gray("@" + (agent.name || username))}`);
    if (agent.verified) {
      console.log(`  ${chalk.green("✓ Verified")}`);
    } else {
      console.log(`  ${chalk.yellow("○ Unverified")}`);
    }
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
    console.log(`  ${chalk.gray("Rank:")}         ${chalk.white("#" + (agent.rank || "—"))}`);
    console.log(`  ${chalk.gray("Credit Score:")} ${chalk.cyan(agent.creditScore || 0)}`);
    console.log(`  ${chalk.gray("Category:")}     ${agent.category || "general"}`);
    console.log(`  ${chalk.gray("Twitter:")}      ${agent.twitter ? "@" + agent.twitter : "—"}`);
    
    if (agent.skills && agent.skills.length > 0) {
      console.log(`  ${chalk.gray("Skills:")}       ${agent.skills.join(", ")}`);
    }
    
    if (agent.description) {
      console.log();
      console.log(`  ${chalk.gray(agent.description)}`);
    }
    
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}
