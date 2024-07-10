import { Command } from "./command";
import { toCommandImpl } from "./commandImpl";
import fs from "node:fs/promises";
import path from "node:path";
import { confToCommands, GitConf } from "./conf";

export async function generateGitRepo(
  dir: string,
  conf: GitConf | { commits: number }
): Promise<void> {
  // Check that a .git folder doesn't exist
  if (await gitRepoExists(dir)) {
    throw new Error(`A Git repository already exists at ${dir}`);
  }

  if ("log" in conf) {
    await generatorGitRepoFromConf(dir, conf);
  } else {
    await generateGitRepoFromCmdOpts(dir, conf);
  }
}

export async function generateGitRepoFromCmdOpts(
  dir: string,
  { commits }: { commits: number }
): Promise<void> {
  // Create commands
  const commands: Command[] = [{ init: { defaultBranch: "main" } }];

  for (let i = 0; i < commits; i++) {
    if (i === 0) {
      commands.push({
        "create file": { file: "test.txt", content: `text ${i + 1}` },
      });
    } else {
      commands.push({
        "change content": {
          file: "test.txt",
          content: `text ${i + 1}`,
        },
      });
    }

    commands.push({
      commit: {
        message: `commit ${i + 1}`,
        author: "user-test",
        email: "user-test@example.com",
      },
    });
  }

  await executeCommands(dir, commands);
}

export async function generatorGitRepoFromConf(
  dir: string,
  conf: GitConf
): Promise<void> {
  const commands = confToCommands(conf);
  await executeCommands(dir, commands);
}

async function executeCommands(
  dir: string,
  commands: Command[]
): Promise<void> {
  // Map commands to implementations
  const commandImpl = toCommandImpl(commands, dir);

  // Execute commands
  for (const c of commandImpl) {
    await c();
  }
}

async function gitRepoExists(dir: string): Promise<boolean> {
  try {
    await fs.access(path.join(dir, ".git"), fs.constants.F_OK);
    return true;
  } catch (err) {
    return false;
  }
}
