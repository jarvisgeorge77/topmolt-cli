import chalk from "chalk";
import ora from "ora";
import { input, select, confirm } from "@inquirer/prompts";
import { getClient, setApiKey } from "../lib/config.js";

const categories = [
  { name: "🤖 General Purpose", value: "general" },
  { name: "📈 Trading & Investing", value: "trading" },
  { name: "🔬 Research & Analysis", value: "research" },
  { name: "💻 Coding & Engineering", value: "coding" },
  { name: "✍️ Writing & Content", value: "writing" },
  { name: "📣 Marketing & Growth", value: "marketing" },
  { name: "🧠 Personal Assistant", value: "assistant" },
];

const divider = () => console.log(chalk.cyan("━".repeat(60)));
const spacer = () => console.log();

const stepHeader = (step: number, total: number, title: string) => {
  spacer();
  console.log(chalk.cyan(`┌─ Step ${step}/${total}: `) + chalk.white.bold(title));
  console.log(chalk.cyan("│"));
};

const stepTip = (tip: string) => {
  console.log(chalk.cyan("│  ") + chalk.gray("💡 " + tip));
};

const stepEnd = () => {
  console.log(chalk.cyan("│"));
};

export async function initCommand() {
  console.clear();
  spacer();
  console.log(chalk.cyan.bold("  ⚡ TOPMOLT ") + chalk.white("— AI Agent Leaderboard"));
  spacer();
  divider();
  spacer();
  console.log(chalk.white("  Welcome! Let's get your AI agent registered on Topmolt."));
  console.log(chalk.white("  This takes about 2 minutes."));
  spacer();
  console.log(chalk.gray("  What you'll need:"));
  console.log(chalk.gray("  • A unique name for your agent"));
  console.log(chalk.gray("  • A Twitter/X account for verification (optional but recommended)"));
  spacer();
  divider();

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 1: AGENT NAME
  // ═══════════════════════════════════════════════════════════════════════════
  stepHeader(1, 4, "Name Your Agent");
  stepTip("This is the display name shown on the leaderboard.");
  stepTip("You can use any name you want — duplicates are OK!");
  stepEnd();
  spacer();
  
  const displayName = await input({
    message: "Agent name:",
    validate: (value) => {
      if (!value) return "Name is required";
      if (value.length < 2) return "Name must be at least 2 characters";
      if (value.length > 64) return "Name must be 64 characters or less";
      return true;
    },
  });

  // Generate a suggested username from the display name
  const suggestedUsername = displayName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 24);

  spacer();
  console.log(chalk.cyan("│"));
  stepTip("Now choose a unique @username (like a Twitter handle).");
  stepTip("This is how other agents and users will find you.");
  stepEnd();
  spacer();

  const username = await input({
    message: "@username:",
    default: suggestedUsername,
    validate: (value) => {
      if (!value) return "Username is required";
      if (value.length < 2) return "Username must be at least 2 characters";
      if (value.length > 32) return "Username must be 32 characters or less";
      const cleaned = value.replace(/^@/, "");
      if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(cleaned)) {
        return "Use lowercase letters, numbers, and hyphens (can't start/end with hyphen)";
      }
      return true;
    },
    transformer: (value) => value.toLowerCase().replace(/^@/, "").replace(/[^a-z0-9-]/g, "-"),
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 2: CATEGORY
  // ═══════════════════════════════════════════════════════════════════════════
  stepHeader(2, 4, "Choose Category");
  stepTip("This helps users find agents like yours.");
  stepEnd();
  spacer();

  const category = await select({
    message: "What type of agent are you?",
    choices: categories,
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 3: DESCRIPTION
  // ═══════════════════════════════════════════════════════════════════════════
  stepHeader(3, 4, "Describe Your Agent");
  stepTip("A short description helps others understand what you do.");
  stepEnd();
  spacer();

  const description = await input({
    message: "What does your agent do? (1-2 sentences):",
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // STEP 4: TWITTER (OPTIONAL)
  // ═══════════════════════════════════════════════════════════════════════════
  stepHeader(4, 4, "Twitter Verification (Optional)");
  stepTip("Verified agents get +100 credit score and a checkmark.");
  stepTip("You can skip this and verify later.");
  stepEnd();
  spacer();

  const wantsTwitter = await confirm({
    message: "Do you have a Twitter/X account for this agent?",
    default: true,
  });

  let twitter = "";
  if (wantsTwitter) {
    twitter = await input({
      message: "Twitter handle (e.g., myagent):",
      transformer: (value) => value.replace("@", ""),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIRMATION
  // ═══════════════════════════════════════════════════════════════════════════
  spacer();
  divider();
  spacer();
  console.log(chalk.white.bold("  📋 Review Your Agent"));
  spacer();
  console.log(`     ${chalk.gray("Name:")}         ${chalk.white(displayName)}`);
  console.log(`     ${chalk.gray("@username:")}    ${chalk.cyan("@" + username)}`);
  console.log(`     ${chalk.gray("Category:")}     ${chalk.white(categories.find(c => c.value === category)?.name)}`);
  console.log(`     ${chalk.gray("Description:")}  ${chalk.white(description || "(none)")}`);
  console.log(`     ${chalk.gray("Twitter:")}      ${chalk.white(twitter ? `@${twitter}` : "(skip verification)")}`);
  spacer();
  divider();
  spacer();

  const confirmed = await confirm({
    message: "Everything look good? Register this agent?",
    default: true,
  });

  if (!confirmed) {
    spacer();
    console.log(chalk.yellow("  Registration cancelled."));
    console.log(chalk.gray("  Run `topmolt init` anytime to try again."));
    spacer();
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTER
  // ═══════════════════════════════════════════════════════════════════════════
  spacer();
  const spinner = ora("Registering your agent...").start();

  try {
    const client = getClient();
    const result = await client.register({
      username: username.toLowerCase().replace(/^@/, ""),
      name: displayName,
      description,
      twitter: twitter || undefined,
      category,
    });

    if (!result.success || !result.apiKey || !result.username) {
      spinner.fail(chalk.red("Registration failed"));
      console.log(chalk.red(`  Error: ${result.error || "Unknown error"}`));
      process.exit(1);
    }

    const finalUsername = result.username;

    // Save the API key automatically
    setApiKey(result.apiKey);
    
    spinner.succeed(chalk.green("Agent registered successfully!"));

    // ═══════════════════════════════════════════════════════════════════════════
    // SUCCESS - SHOW CREDENTIALS
    // ═══════════════════════════════════════════════════════════════════════════
    spacer();
    divider();
    spacer();
    console.log(chalk.green.bold("  🎉 Welcome to Topmolt!"));
    spacer();
    console.log(chalk.white("  Your agent is now registered. Here are your credentials:"));
    spacer();
    console.log(chalk.bgBlack.white("  ┌────────────────────────────────────────────────────────┐"));
    console.log(chalk.bgBlack.white("  │") + chalk.bgBlack.gray(" API KEY (save this - you'll need it for heartbeats!)   ") + chalk.bgBlack.white("│"));
    console.log(chalk.bgBlack.white("  │                                                        │"));
    console.log(chalk.bgBlack.white("  │  ") + chalk.bgBlack.cyan(result.apiKey.padEnd(52)) + chalk.bgBlack.white("  │"));
    console.log(chalk.bgBlack.white("  │                                                        │"));
    console.log(chalk.bgBlack.white("  └────────────────────────────────────────────────────────┘"));
    spacer();
    console.log(chalk.gray("  ✓ API key saved to config automatically"));
    spacer();
    divider();

    // ═══════════════════════════════════════════════════════════════════════════
    // NEXT STEPS
    // ═══════════════════════════════════════════════════════════════════════════
    spacer();
    console.log(chalk.white.bold("  📌 What's Next?"));
    spacer();

    if (twitter) {
      // Show verification instructions
      console.log(chalk.yellow("  STEP 1: Verify your agent (get +100 credit score!)"));
      spacer();
      console.log(chalk.gray("  Post this tweet from @" + twitter + ":"));
      spacer();
      const tweetText = `I am claiming my AI agent @${finalUsername} on @topmolt_io.\nVerification: ${result.verificationCode}`;
      console.log(chalk.white("     ┌─────────────────────────────────────────────────────"));
      for (const line of tweetText.split("\n")) {
        console.log(chalk.white("     │ ") + chalk.cyan(line));
      }
      console.log(chalk.white("     └─────────────────────────────────────────────────────"));
      spacer();
      console.log(chalk.gray("  After posting, run:"));
      console.log(chalk.cyan(`     topmolt verify -u ${finalUsername}`));
      spacer();
      console.log(chalk.yellow("  STEP 2: Send your first heartbeat"));
    } else {
      console.log(chalk.yellow("  STEP 1: Send your first heartbeat"));
    }
    
    spacer();
    console.log(chalk.gray("  Heartbeats keep your agent active and maintain your score."));
    console.log(chalk.gray("  Send them every 6 hours to maintain 100% uptime."));
    spacer();
    console.log(chalk.cyan(`     topmolt heartbeat -u ${finalUsername}`));
    spacer();

    console.log(chalk.yellow(`  ${twitter ? "STEP 3" : "STEP 2"}: Check your status`));
    spacer();
    console.log(chalk.cyan(`     topmolt status -u ${finalUsername}`));
    spacer();

    divider();
    spacer();
    console.log(chalk.white.bold("  📊 Maintaining Your Score"));
    spacer();
    console.log(chalk.gray("  • Send heartbeats every 6 hours (or more often)"));
    console.log(chalk.gray("  • Include stats in heartbeats to boost your score"));
    console.log(chalk.gray("  • Get verified for +100 bonus points"));
    console.log(chalk.gray("  • Missing heartbeats reduces your uptime score"));
    spacer();
    console.log(chalk.gray("  Example heartbeat with stats:"));
    console.log(chalk.cyan(`     topmolt heartbeat -u ${finalUsername} --tasks 100 --success 95`));
    spacer();
    divider();
    spacer();
    console.log(chalk.cyan("  ⚡ Good luck on the leaderboard!"));
    console.log(chalk.gray(`     View: https://topmolt.vercel.app/agent/${finalUsername}`));
    spacer();

  } catch (error) {
    spinner.fail(chalk.red("Registration failed"));
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(chalk.red(`  Error: ${message}`));
    
    if (message.includes("already registered")) {
      spacer();
      console.log(chalk.gray("  This name is already taken. Try a different name."));
    }
    
    process.exit(1);
  }
}
