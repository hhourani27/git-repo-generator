import { Command } from "./command";
import { toCommandImpl } from "./commandImpl";
import fs from "node:fs";
import path from "node:path";

export async function generateGitRepo({
  dir,
  commits,
}: {
  dir: string;
  commits: number;
}): Promise<void> {
  // Check that a .git folder doesn't exist
  if (fs.existsSync(path.join(dir, ".git"))) {
    throw new Error(`A Git repository already exists at ${dir}`);
  }

  // Create commands
  const commands: Command[] = [{ init: { defaultBranch: "main" } }];

  for (let i = 0; i < commits; i++) {
    if (i === 0) {
      commands.push({ "create file": { file: "test.txt", content: "line 1" } });
    } else {
      commands.push({
        "append content": {
          file: "test.txt",
          content: `line ${i + 1}`,
          newLine: true,
        },
      });
    }

    commands.push({ add: { file: "test.txt" } });
    commands.push({
      commit: {
        message: `commit ${i + 1}`,
        author: { name: "user-test", email: "user-test@example.com" },
      },
    });
  }

  // Map commands to implementations
  const commandImpl = toCommandImpl(commands, dir);

  // Execute commands
  for (const c of commandImpl) {
    await c();
  }
}
