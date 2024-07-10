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
  } else if ("commit" in command) {
    return async () => {
      // git add .
      await git
        .statusMatrix({ fs, dir })
        .then((status) =>
          Promise.all(
            status.map(([filepath, , worktreeStatus]) =>
              worktreeStatus
                ? git.add({ fs, dir, filepath })
                : git.remove({ fs, dir, filepath })
            )
          )
        );
      // git commit
      await git.commit({
        fs,
        dir,
        message: command.commit.message,
        author: {
          name: command.commit.author,
          email: command.commit.email,
        },
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
  } else if ("branch" in command) {
    return async () => {
      await git.branch({ fs, dir, ref: command.branch.name });
    };
  } else if ("checkout" in command) {
    return async () => {
      await git.checkout({ fs, dir, ref: command.checkout.ref });
    };
  } else if ("merge" in command) {
    return async () => {
      await git.merge({
        fs,
        dir,
        theirs: command.merge.theirs,
        message: command.merge.message,
        author: {
          name: command.merge.author,
          email: command.merge.email,
        },
        fastForward: false,
        mergeDriver: ({ contents }) => {
          const mergedText = contents[2];
          return { cleanMerge: true, mergedText };
        },
      });

      await git.checkout({
        fs,
        dir,
        ref: (await git.currentBranch({ fs, dir })) as string,
      });
    };
  } else if ("tag" in command) {
    const { name, annotated, message, author, email } = command.tag;
    if (annotated) {
      return async () => {
        await git.annotatedTag({
          fs,
          dir,
          ref: name,
          message,
          tagger: { name: author, email },
        });
      };
    } else {
      return async () => {
        await git.tag({ fs, dir, ref: name });
      };
    }
  } else if ("change content" in command) {
    return async () => {
      await fs.writeFile(
        path.join(dir, command["change content"].file),
        command["change content"].content,
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
