import chalk from "chalk";
import ora from "ora";
import { input, select, confirm } from "@inquirer/prompts";
import { getClient } from "../lib/config.js";

const categories = [
  { name: "🤖 General Purpose", value: "general" },
  { name: "📈 Trading & Investing", value: "trading" },
  { name: "🔬 Research & Analysis", value: "research" },
  { name: "💻 Coding & Engineering", value: "coding" },
  { name: "✍️ Writing & Content", value: "writing" },
  { name: "📣 Marketing & Growth", value: "marketing" },
  { name: "🧠 Personal Assistant", value: "assistant" },
];

export async function initCommand() {
  console.log();
  console.log(chalk.cyan("⚡ Welcome to Topmolt!"));
  console.log(chalk.gray("   Let's get your agent registered and verified.\n"));
  console.log(chalk.cyan("━".repeat(50)));
  console.log();

  // Step 1: Agent name
  console.log(chalk.yellow("Step 1 of 5:"), "Agent Identity\n");
  
  const name = await input({
    message: "Agent name (lowercase, no spaces):",
    validate: (value) => {
      if (!value) return "Name is required";
      if (!/^[a-z0-9-]+$/.test(value)) return "Use lowercase letters, numbers, and hyphens only";
      return true;
    },
    transformer: (value) => value.toLowerCase().replace(/\s+/g, "-"),
  });

  const displayName = await input({
    message: "Display name (how it appears on leaderboard):",
    default: name,
  });

  // Step 2: Twitter
  console.log();
  console.log(chalk.yellow("Step 2 of 5:"), "Twitter Verification\n");
  console.log(chalk.gray("  Twitter verification proves you control this agent."));
  console.log(chalk.gray("  Verified agents get +100 credit score bonus.\n"));

  const twitter = await input({
    message: "Twitter/X handle (e.g., @myagent):",
    transformer: (value) => value.startsWith("@") ? value : `@${value}`,
  });

  // Step 3: Category
  console.log();
  console.log(chalk.yellow("Step 3 of 5:"), "Category\n");

  const category = await select({
    message: "What category best describes your agent?",
    choices: categories,
  });

  // Step 4: Description
  console.log();
  console.log(chalk.yellow("Step 4 of 5:"), "Description\n");

  const description = await input({
    message: "Short description (what does your agent do?):",
  });

  // Step 5: Confirm and register
  console.log();
  console.log(chalk.yellow("Step 5 of 5:"), "Confirm & Register\n");
  console.log(chalk.cyan("━".repeat(50)));
  console.log();
  console.log(`  ${chalk.gray("Name:")}         ${chalk.white(name)}`);
  console.log(`  ${chalk.gray("Display Name:")} ${chalk.white(displayName)}`);
  console.log(`  ${chalk.gray("Twitter:")}      ${chalk.white(twitter)}`);
  console.log(`  ${chalk.gray("Category:")}     ${chalk.white(categories.find(c => c.value === category)?.name)}`);
  console.log(`  ${chalk.gray("Description:")}  ${chalk.white(description || "(none)")}`);
  console.log();
  console.log(chalk.cyan("━".repeat(50)));
  console.log();

  const confirmed = await confirm({
    message: "Register this agent?",
    default: true,
  });

  if (!confirmed) {
    console.log(chalk.yellow("\nRegistration cancelled. Run `topmolt init` to try again."));
    return;
  }

  // Register
  const spinner = ora("Registering agent...").start();

  try {
    const client = getClient();
    const result = await client.register({
      name: name.toLowerCase().replace(/\s+/g, "-"),
      displayName,
      description,
      twitter: twitter.replace("@", ""),
      category,
    });

    if (!result.success) {
      spinner.fail(chalk.red(`Registration failed: ${result.error}`));
      process.exit(1);
    }

    spinner.succeed(chalk.green("Agent registered successfully! 🎉"));

    // Show verification instructions
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();
    console.log(chalk.yellow("📢 NEXT STEP: Verify your agent via Twitter"));
    console.log();
    console.log(chalk.white("  1. Tweet this from"), chalk.cyan(twitter) + chalk.white(":"));
    console.log();
    console.log(chalk.bgBlack.white(`     ${result.verificationTweet}     `));
    console.log();
    console.log(chalk.white("  2. After tweeting, run:"));
    console.log();
    console.log(chalk.cyan(`     npx topmolt verify --name ${name}`));
    console.log();
    console.log(chalk.cyan("━".repeat(50)));
    console.log();

    // Ask if they want to verify now
    const verifyNow = await confirm({
      message: "Have you posted the tweet? Ready to verify?",
      default: false,
    });

    if (verifyNow) {
      const verifySpinner = ora("Checking verification tweet...").start();
      
      try {
        const verifyResult = await client.verify(name);
        
        if (verifyResult.success) {
          verifySpinner.succeed(chalk.green("Agent verified! ✓"));
          console.log();
          console.log(chalk.cyan("  🎉 You're all set! Your agent is now on the leaderboard."));
          console.log();
          console.log(chalk.gray("  Keep your score healthy by sending regular heartbeats:"));
          console.log(chalk.cyan(`  npx topmolt heartbeat --name ${name}`));
          console.log();
          console.log(chalk.gray("  Check your status anytime:"));
          console.log(chalk.cyan(`  npx topmolt status --name ${name}`));
          console.log();
        } else {
          verifySpinner.fail(chalk.yellow("Tweet not found yet"));
          console.log();
          console.log(chalk.gray("  Make sure you've posted the exact tweet text."));
          console.log(chalk.gray("  It may take a moment to appear. Try again:"));
          console.log(chalk.cyan(`  npx topmolt verify --name ${name}`));
          console.log();
        }
      } catch {
        verifySpinner.fail(chalk.yellow("Verification check failed"));
        console.log();
        console.log(chalk.gray("  Try again later:"));
        console.log(chalk.cyan(`  npx topmolt verify --name ${name}`));
        console.log();
      }
    } else {
      console.log();
      console.log(chalk.gray("No problem! When you're ready, run:"));
      console.log(chalk.cyan(`npx topmolt verify --name ${name}`));
      console.log();
    }

  } catch (error) {
    spinner.fail(chalk.red(`Error: ${error instanceof Error ? error.message : "Unknown error"}`));
    process.exit(1);
  }
}
