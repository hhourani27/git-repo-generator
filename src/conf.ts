import {
  ChangeContentCommand,
  Command,
  CommitInfo,
  InitCommand,
} from "./command";
import { EventLogError } from "./errors/EventLogError";

//#region Log events
type WithPrefix<T extends string> = `${T}${string}`;

export type InitEvent = "init" | InitCommand;
export type CommitEvent = "commit" | { commit: Partial<CommitInfo> };
export type BranchEvent = WithPrefix<"branch">;
export type CheckoutEvent = WithPrefix<"checkout">;
export type MergeEvent =
  | WithPrefix<"merge">
  | {
      merge: {
        theirs: string;
      } & Partial<CommitInfo>;
    };
export type TagEvent =
  | WithPrefix<"tag">
  | { tag: { name: string; annotated?: boolean } & Partial<CommitInfo> };

export type CreateFileEvent =
  | WithPrefix<"create file">
  | { "create file": { file: string; content?: string } };
export type ChangeContentEvent = ChangeContentCommand;

export type Event =
  | InitEvent
  | CommitEvent
  | BranchEvent
  | CheckoutEvent
  | MergeEvent
  | TagEvent
  | CreateFileEvent
  | ChangeContentEvent;

const isInitEvent = (e: Event): e is InitEvent => {
  return (
    (typeof e === "string" && e === "init") ||
    (typeof e === "object" && "init" in e)
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

const isTagEvent = (e: Event): e is TagEvent => {
  return (
    (typeof e === "string" && e.startsWith("tag")) ||
    (typeof e === "object" && "tag" in e)
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

//#endregion

//#region Git conf
type Conf = {
  author?: string;
  email?: string;
};

export type GitConf = {
  log: Event[];
  conf?: Conf;
};

//#region Git conf to Commands converter

function getDefaultUser(conf: Conf | undefined): {
  author: string;
  email: string;
} {
  const DEFAULT_USER = { author: "user-test", email: "user-test@example.com" };

  if (!conf) return DEFAULT_USER;
  else
    return {
      author: conf.author ?? DEFAULT_USER.author,
      email: conf.email ?? DEFAULT_USER.email,
    };
}

export function confToCommands(gitConf: GitConf): Command[] {
  const { log, conf } = gitConf;
  const commands: Command[] = [];

  const defaultUser = getDefaultUser(conf);

  let commitCounter = 0;

  for (let i = 0; i < log.length; i++) {
    const event = log[i];

    if (isInitEvent(event)) {
      if (event === "init") {
        commands.push({ init: { defaultBranch: "main" } });
      } else {
        commands.push(event);
      }
    } else if (isCommitEvent(event)) {
      const defaultCommitInfo: CommitInfo = {
        message: `commit ${commitCounter + 1}`,
        ...defaultUser,
      };
      if (event === "commit") {
        commands.push({
          commit: defaultCommitInfo,
        });
      } else {
        commands.push({
          commit: Object.assign({}, defaultCommitInfo, event.commit),
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
            ...defaultUser,
          },
        });
      } else {
        commands.push({
          merge: {
            theirs: event.merge.theirs,
            message:
              event.merge.message ?? `merge branch ${event.merge.theirs}`,
            author: event.merge.author ?? defaultUser.author,
            email: event.merge.email ?? defaultUser.email,
          },
        });
      }
      commitCounter++;
    } else if (isTagEvent(event)) {
      if (typeof event === "string") {
        const tagName = event.substring("tag".length).trim();
        if (tagName === "") {
          throw new EventLogError(`"tag": missing tag name`, i + 1);
        }
        commands.push({
          tag: {
            name: tagName,
            annotated: false,
            message: "",
            ...defaultUser,
          },
        });
      } else {
        commands.push({
          tag: {
            name: event.tag.name,
            annotated: event.tag.annotated ?? false,
            message: event.tag.message ?? `create tag ${event.tag.name}`,
            author: event.tag.author ?? defaultUser.author,
            email: event.tag.email ?? defaultUser.email,
          },
        });
      }
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
//#endregion
