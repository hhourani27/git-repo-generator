import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Tag event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Create tag", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "commit", "tag v1.0"],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);
    expect(await git.resolveRef({ fs, dir, ref: "main" })).toEqual(
      await git.resolveRef({ fs, dir, ref: "v1.0" })
    );
  });

  test("Missing tag name", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "commit", "tag"],
    };

    expect.assertions(1);
    try {
      await generateGitRepo(dir, conf);
    } catch (error) {
      expect((error as Error).message).toMatch(
        `line 4: "tag": missing tag name`
      );
    }
  });
});
