import { Command } from "./command";
import fs from "node:fs/promises";
import path from "node:path";
import git from "isomorphic-git";

export type CommandImpl = () => Promise<void>;

export function toCommandImpl(commands: Command[], dir: string): CommandImpl[] {
  return commands.map((c) => mapCommandToImpl(c, dir));
}

function mapCommandToImpl(command: Command, dir: string): CommandImpl {
  if ("init" in command) {
    return async () => {
      await git.init({
        fs,
        dir,
        defaultBranch: command.init.defaultBranch,
      });
    };
  } else if ("add" in command) {
    return async () => {
      await git.add({ fs, dir, filepath: command.add.file });
    };
  } else if ("commit" in command) {
    return async () => {
      await git.commit({
        fs,
        dir,
        message: command.commit.message,
        author: command.commit.author,
      });
    };
  } else if ("create file" in command) {
    return async () => {
      await fs.writeFile(
        path.join(dir, command["create file"].file),
        command["create file"].content,
        "utf-8"
      );
    };
  } else if ("append content" in command) {
    return async () => {
      await fs.appendFile(
        path.join(dir, command["append content"].file),
        `${command["append content"].newLine ? "\n" : ""}${command["append content"].content}`,
        "utf-8"
      );
    };
  }

  throw new Error(`Invalid command: ${JSON.stringify(command)}`);
}
