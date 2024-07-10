import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";
import path from "node:path";

describe("Create file event", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Create file: complete object", async () => {
    const conf: GitConf = {
      log: ["init", { "create file": { file: "test.txt", content: "test" } }],
    };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "test"
    );
  });

  test("Create file: object, no content", async () => {
    const conf: GitConf = {
      log: ["init", { "create file": { file: "test.txt" } }],
    };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "test.txt"
    );
  });

  test("Create file: shorthand", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt"],
    };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "test.txt"
    );
  });

  test("Create file: shorthand, missing file name", async () => {
    const conf: GitConf = {
      log: ["init", "create file"],
    };

    expect.assertions(1);
    try {
      await generateGitRepo(dir, conf);
    } catch (error) {
      expect((error as Error).message).toMatch(
        `line 2: "create file": missing file name`
      );
    }
  });

  test("Create folder: shorthand", async () => {
    const conf: GitConf = {
      log: ["init", "create file src/test.txt"],
    };

    await generateGitRepo(dir, conf);

    expect(await fs.readFile(path.join(dir, "src/test.txt"), "utf-8")).toEqual(
      "src/test.txt"
    );
  });
});
