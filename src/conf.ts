import {
  AddCommand,
  AppendContentCommand,
  ChangeContentCommand,
  Command,
  CommitCommand,
  CreateFileCommand,
  InitCommand,
} from "./command";
import { EventLogError } from "./errors/EventLogError";

type WithPrefix<T extends string> = `${T}${string}`;

export type InitEvent = "init" | InitCommand;
export type AddEvent = "add" | AddCommand;
export type CommitEvent =
  | "commit"
  | { commit: { message?: string; name?: string; email?: string } };
export type BranchEvent = WithPrefix<"branch">;
export type CheckoutEvent = WithPrefix<"checkout">;
export type MergeEvent =
  | WithPrefix<"merge">
  | {
      merge: {
        theirs: string;
        message?: string;
        name?: string;
        email?: string;
      };
    };

export type CreateFileEvent =
  | WithPrefix<"create file">
  | { "create file": { file: string; content?: string } };
export type ChangeContentEvent = ChangeContentCommand;
export type AppendContentEvent = AppendContentCommand;

export type Event =
  | InitEvent
  | AddEvent
  | CommitEvent
  | BranchEvent
  | CheckoutEvent
  | MergeEvent
  | CreateFileEvent
  | ChangeContentEvent
  | AppendContentEvent;

const isInitEvent = (e: Event): e is InitEvent => {
  return (
    (typeof e === "string" && e === "init") ||
    (typeof e === "object" && "init" in e)
  );
};

const isAddEvent = (e: Event): e is AddEvent => {
  return (
    (typeof e === "string" && e === "add") ||
    (typeof e === "object" && "add" in e)
  );
};

const isCommitEvent = (e: Event): e is CommitEvent => {
  return (
    (typeof e === "string" && e === "commit") ||
    (typeof e === "object" && "commit" in e)
  );
};

const isBranchEvent = (e: Event): e is BranchEvent => {
  return typeof e === "string" && e.startsWith("branch");
};

const isCheckoutEvent = (e: Event): e is CheckoutEvent => {
  return typeof e === "string" && e.startsWith("checkout");
};

const isMergeEvent = (e: Event): e is MergeEvent => {
  return (
    (typeof e === "string" && e.startsWith("merge")) ||
    (typeof e === "object" && "merge" in e)
  );
};

const isCreateFileEvent = (e: Event): e is CreateFileEvent => {
  return (
    (typeof e === "string" && e.startsWith("create file")) ||
    (typeof e === "object" && "create file" in e)
  );
};

const isChangeContentEvent = (e: Event): e is ChangeContentEvent => {
  return typeof e === "object" && "change content" in e;
};

export type GitConf = {
  log: Event[];
};

export function confToCommands(conf: GitConf): Command[] {
  const log = conf.log;

  const commands: Command[] = [];

  let commitCounter = 0;

  for (let i = 0; i < conf.log.length; i++) {
    const event = conf.log[i];

    if (isInitEvent(event)) {
      if (event === "init") {
        commands.push({ init: { defaultBranch: "main" } });
      } else {
        commands.push(event);
      }
    } else if (isAddEvent(event)) {
      if (event === "add") {
        commands.push({ add: { all: true } });
      } else {
        commands.push(event);
      }
    } else if (isCommitEvent(event)) {
      if (event === "commit") {
        commands.push({
          commit: {
            message: `commit ${commitCounter + 1}`,
            name: "user-test",
            email: "user-test@example.com",
          },
        });
      } else {
        commands.push({
          commit: {
            message: event.commit.message ?? `commit ${commitCounter + 1}`,
            name: event.commit.name ?? "user-test",
            email: event.commit.email ?? "user-test@example.com",
          },
        });
      }
      commitCounter++;
    } else if (isBranchEvent(event)) {
      const branchName = event.substring("branch".length).trim();
      if (branchName === "") {
        throw new EventLogError(`"branch": missing branch name`, i + 1);
      }
      commands.push({ branch: { name: branchName } });
    } else if (isCheckoutEvent(event)) {
      const ref = event.substring("checkout".length).trim();
      if (ref === "") {
        throw new EventLogError(`"checkout": missing ref`, i + 1);
      }
      commands.push({ checkout: { ref } });
    } else if (isMergeEvent(event)) {
      if (typeof event === "string") {
        const theirs = event.substring("merge".length).trim();
        if (theirs === "") {
          throw new EventLogError(`"merge": missing branch`, i + 1);
        }
        commands.push({
          merge: {
            theirs,
            message: `merge branch ${theirs}`,
            name: "user-test",
            email: "user-test@example.com",
          },
        });
      } else {
        commands.push({
          merge: {
            theirs: event.merge.theirs,
            message:
              event.merge.message ?? `merge branch ${event.merge.theirs}`,
            name: event.merge.name ?? "user-test",
            email: event.merge.email ?? "user-test@example.com",
          },
        });
      }
      commitCounter++;
    } else if (isCreateFileEvent(event)) {
      if (typeof event === "string") {
        const fileName = event.substring("create file".length).trim();
        if (fileName === "") {
          throw new EventLogError(`"create file": missing file name`, i + 1);
        }
        commands.push({ "create file": { file: fileName, content: fileName } });
      } else {
        const file = event["create file"].file;
        const content = event["create file"].content ?? file;
        commands.push({ "create file": { file, content } });
      }
    } else if (isChangeContentEvent(event)) {
      commands.push(event);
    } else {
      commands.push(event);
    }
  }

  return commands;
}
