#!/usr/bin/env node

import { Command } from "commander";
import path from "node:path";
import { generateGitRepo } from ".";

const program = new Command();
program
  .name("git-repo-generator")
  .description("A Git repository generator to test your Git tools")
  .option(
    "-d, --dir <dir>",
    "Directory of Git repository",
    (v) => path.resolve(process.cwd(), v),
    process.cwd()
  )
  .option(
    "-c, --commits <commits>",
    "Number of commits",
    (v) => parseInt(v),
    3
  );

program.parse(process.argv);
const options = program.opts();

generateGitRepo({ dir: options.dir, commits: options.commits });
