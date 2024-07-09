import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import path from "node:path";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Init event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Init: complete event", async () => {
    const conf: GitConf = { log: [{ init: { defaultBranch: "main" } }] };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, ".git", "HEAD"), "utf-8")).toEqual(
      "ref: refs/heads/main\n"
    );
  });
});
