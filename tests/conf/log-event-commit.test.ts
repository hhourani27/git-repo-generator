import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";

describe("Commit", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Commit: complete event", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "add",
        {
          commit: {
            message: "commit message",
            name: "user1",
            email: "user1@example.com",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    expect(log).toHaveLength(1);
    expect(log[0].commit).toMatchObject({
      message: "commit message\n",
      author: { name: "user1", email: "user1@example.com" },
      committer: { name: "user1", email: "user1@example.com" },
    });
  });

  test("Commit: object, no message", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "add",
        {
          commit: {
            name: "user1",
            email: "user1@example.com",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    expect(log).toHaveLength(1);
    expect(log[0].commit).toMatchObject({
      message: "commit 1\n",
      author: { name: "user1", email: "user1@example.com" },
      committer: { name: "user1", email: "user1@example.com" },
    });
  });

  test("Commit: object, no author", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "add",
        {
          commit: {
            message: "commit message",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    expect(log).toHaveLength(1);
    expect(log[0].commit).toMatchObject({
      message: "commit message\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
  });

  test("Commit: no properties", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "add", "commit"],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    expect(log).toHaveLength(1);
    expect(log[0].commit).toMatchObject({
      message: "commit 1\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
  });
});