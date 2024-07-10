import { generateGitRepo } from "../../src";
import mock from "mock-fs";
import fs from "node:fs/promises";
import git from "isomorphic-git";
import { GitConf } from "../../src/conf";
import path from "node:path";

describe("Merge", () => {
  const dir = "/test";

  beforeEach(() => {
    mock({ test: {} });
  });

  afterEach(() => {
    mock.restore();
  });

  test("Merge: shorthand", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test-main.txt",
        "commit",
        "branch develop",
        "checkout develop",
        "create file test-develop.txt",
        "commit",
        "checkout main",
        "merge develop",
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "merge branch develop\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test-main.txt"), "utf-8")).toEqual(
      "test-main.txt"
    );
    expect(
      await fs.readFile(path.join(dir, "test-develop.txt"), "utf-8")
    ).toEqual("test-develop.txt");
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test-develop.txt", 1, 1, 1],
      ["test-main.txt", 1, 1, 1],
    ]);
  });

  test("Merge: complete object", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test-main.txt",
        "commit",
        "branch develop",
        "checkout develop",
        "create file test-develop.txt",
        "commit",
        "checkout main",
        {
          merge: {
            theirs: "develop",
            message: "a merge commit",
            name: "user1",
            email: "user1@ex.com",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "a merge commit\n",
      author: { name: "user1", email: "user1@ex.com" },
      committer: { name: "user1", email: "user1@ex.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test-main.txt"), "utf-8")).toEqual(
      "test-main.txt"
    );
    expect(
      await fs.readFile(path.join(dir, "test-develop.txt"), "utf-8")
    ).toEqual("test-develop.txt");
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test-develop.txt", 1, 1, 1],
      ["test-main.txt", 1, 1, 1],
    ]);
  });

  test("Merge: object: no message", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test-main.txt",
        "commit",
        "branch develop",
        "checkout develop",
        "create file test-develop.txt",
        "commit",
        "checkout main",
        {
          merge: {
            theirs: "develop",
            name: "user1",
            email: "user1@ex.com",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "merge branch develop\n",
      author: { name: "user1", email: "user1@ex.com" },
      committer: { name: "user1", email: "user1@ex.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test-main.txt"), "utf-8")).toEqual(
      "test-main.txt"
    );
    expect(
      await fs.readFile(path.join(dir, "test-develop.txt"), "utf-8")
    ).toEqual("test-develop.txt");
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test-develop.txt", 1, 1, 1],
      ["test-main.txt", 1, 1, 1],
    ]);
  });

  test("Merge: object: no author", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test-main.txt",
        "commit",
        "branch develop",
        "checkout develop",
        "create file test-develop.txt",
        "commit",
        "checkout main",
        {
          merge: {
            theirs: "develop",
            message: "a merge commit",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "a merge commit\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test-main.txt"), "utf-8")).toEqual(
      "test-main.txt"
    );
    expect(
      await fs.readFile(path.join(dir, "test-develop.txt"), "utf-8")
    ).toEqual("test-develop.txt");
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test-develop.txt", 1, 1, 1],
      ["test-main.txt", 1, 1, 1],
    ]);
  });

  test("Merge: without conflict", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test.txt", content: "line 1" } },
        "commit",
        "branch develop",
        "checkout develop",
        { "change content": { file: "test.txt", content: "line 1\nline 2" } },
        "commit",
        "checkout main",
        "merge develop",
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "merge branch develop\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "line 1\nline 2"
    );
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test.txt", 1, 1, 1],
    ]);
  });

  test("Merge: with conflict", async () => {
    const conf: GitConf = {
      log: [
        "init",
        { "create file": { file: "test.txt", content: "line 1" } },
        "commit",
        "branch develop",
        "checkout develop",
        { "change content": { file: "test.txt", content: "line 2" } },
        "commit",
        "checkout main",
        "merge develop",
      ],
    };

    await generateGitRepo(dir, conf);

    const log = await git.log({ fs, dir });
    const mergeCommit = log[0];

    expect(await git.currentBranch({ fs, dir })).toEqual("main");
    expect(mergeCommit.commit).toMatchObject({
      message: "merge branch develop\n",
      author: { name: "user-test", email: "user-test@example.com" },
      committer: { name: "user-test", email: "user-test@example.com" },
    });
    expect(mergeCommit.commit.parent).toHaveLength(2);
    expect(await fs.readFile(path.join(dir, "test.txt"), "utf-8")).toEqual(
      "line 2"
    );
    expect(await git.statusMatrix({ fs, dir })).toEqual([
      ["test.txt", 1, 1, 1],
    ]);
  });
});
