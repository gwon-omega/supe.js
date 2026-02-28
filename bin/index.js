#!/usr/bin/env node
import { Command } from "commander";
import { askQuestions, normalizeFlags } from "../lib/prompts.js";
import { createProject } from "../lib/frameworks.js";
import { installUi } from "../lib/ui.js";
import { applyTemplate } from "../lib/templates.js";
import { applyAddons } from "../lib/addons.js";
import { genReadme } from "../lib/readme.js";
import { ensureGitInit } from "../lib/utils.js";

const program = new Command();

program
  .name("create-super-app")
  .argument("<project-name>", "Project directory name")
  .option("--framework <id>", "Framework id (nextjs|nuxt|astro|remix)")
  .option(
    "--ui <id>",
    "UI lib id (shadcn|tailwind-headless|nextui|material|chakra)"
  )
  .option(
    "--template <id>",
    "Template id (admin-dashboard|ecommerce|mis|portfolio|blog|saas)"
  )
  .option(
    "--addons <csv>",
    "Add-ons comma list (auth,prisma,drizzle,stripe,i18n,testing,ci,docker,pwa,sentry,storybook)"
  )
  .option("--pm <id>", "Package manager (npm|pnpm|yarn|bun)")
  .option("--yes", "Accept sensible defaults", false)
  .option("--no-install", "Skip dependency installation")
  .action(async (projectName, opts) => {
    const flags = normalizeFlags(projectName, opts);
    const answers = await askQuestions(flags);

    // 1) Create base project
    const projectPath = await createProject({ ...answers, projectName });

    // 2) Install UI library & drop shims
    await installUi({
      ...answers,
      projectPath,
      skipInstall: opts.install === false,
    });

    // 3) Apply template (overwrites app shell; merges package.json when needed)
    await applyTemplate({ ...answers, projectPath });

    // 4) Add-ons (auth, prisma/drizzle, stripe, i18n, tests, CI, Docker, etc.)
    await applyAddons({ ...answers, projectPath });

    // 5) README + Git
    await genReadme({ ...answers, projectPath });
    await ensureGitInit(projectPath);

    console.log("\n✅ All set! Next:");
    console.log(`  cd ${projectName}`);
    if (opts.install === false) {
      console.log(`  ${answers.pm} install`);
    }
    console.log(
      "  " +
        (answers.framework === "angular"
          ? `${answers.pm} start`
          : `${answers.pm} run dev`)
    );
  });

program.parse();
