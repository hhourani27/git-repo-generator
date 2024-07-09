#!/usr/bin/env node

import { Command } from "commander";
import path from "node:path";
import yaml from "js-yaml";
import fs from "node:fs";
import { generateGitRepo } from ".";
import { GitConf } from "./conf";

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
  .option("-c, --commits <commits>", "Number of commits", (v) => parseInt(v), 3)
  .option("-f, --file <file>", "Configuration file");

program.parse(process.argv);
const options = program.opts();

if (options.file) {
  const gitConf = yaml.load(
    fs.readFileSync(path.resolve(process.cwd(), options.file), "utf8")
  ) as GitConf;

  generateGitRepo(options.dir, gitConf);

  console.log("YAML FILE");
  console.log(JSON.stringify(gitConf, null, 2));
} else {
  generateGitRepo(options.dir, { commits: options.commits });
}
