import { Command } from "./command";
import { toCommandImpl } from "./commandImpl";

export function helloWorld(): string {
  return "Hello, world!";
}

export async function generateGitRepo({
  dir,
  commits,
}: {
  dir: string;
  commits: number;
}): Promise<void> {
  // Create commands
  const commands: Command[] = [{ init: { defaultBranch: "main" } }];

  for (let i = 0; i < commits; i++) {
    if (i === 0) {
      commands.push({ "create file": { file: "test.txt", content: "line 1" } });
    } else {
      commands.push({
        "append content": { file: "test.txt", content: `line ${i + 1}` },
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
