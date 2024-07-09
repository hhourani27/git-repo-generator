import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Checkout event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Checkout", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "add",
        "commit",
        "branch develop",
        "checkout develop",
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.currentBranch({ fs, dir })).toEqual("develop");
  });

  test("Missing ref", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "add",
        "commit",
        "branch develop",
        "checkout",
      ],
    };

    expect.assertions(1);
    try {
      await generateGitRepo(dir, conf);
    } catch (error) {
      expect((error as Error).message).toMatch(
        `line 6: "checkout": missing ref`
      );
    }
  });
});
