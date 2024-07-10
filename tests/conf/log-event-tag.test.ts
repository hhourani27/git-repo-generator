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

  test("Create lightweight tag: shortand", async () => {
    const conf: GitConf = {
      log: ["init", "create file test.txt", "commit", "tag v1.0"],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);
    expect(await git.resolveRef({ fs, dir, ref: "main" })).toEqual(
      await git.resolveRef({ fs, dir, ref: "v1.0" })
    );
  });

  test("Create lightweight tag: shortand: Missing tag name", async () => {
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

  test("Create lightweight tag: object", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "commit",
        { tag: { name: "v1.0" } },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);
    expect(await git.resolveRef({ fs, dir, ref: "main" })).toEqual(
      await git.resolveRef({ fs, dir, ref: "v1.0" })
    );
  });

  test("Create lightweight tag: complete object", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "commit",
        {
          tag: {
            name: "v1.0",
            annotated: false,
            message: "any message",
            author: "any author",
            email: "any email",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);
    expect(await git.resolveRef({ fs, dir, ref: "main" })).toEqual(
      await git.resolveRef({ fs, dir, ref: "v1.0" })
    );
  });

  test("Create annotated tag: complete object", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "commit",
        {
          tag: {
            name: "v1.0",
            annotated: true,
            message: "Create new tag",
            author: "user1",
            email: "user1@ex.com",
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);

    const tagOid = await git.resolveRef({ fs, dir, ref: "v1.0" });
    const tagObject = await git.readTag({ fs, dir, oid: tagOid });
    expect(tagObject.tag).toMatchObject({
      type: "commit",
      tag: "v1.0",
      message: "Create new tag\n",
      tagger: { name: "user1", email: "user1@ex.com" },
      object: await git.resolveRef({ fs, dir, ref: "main" }),
    });
  });

  test("Create annotated tag: missing commit info", async () => {
    const conf: GitConf = {
      log: [
        "init",
        "create file test.txt",
        "commit",
        {
          tag: {
            name: "v1.0",
            annotated: true,
          },
        },
      ],
    };

    await generateGitRepo(dir, conf);

    expect(await git.listTags({ fs, dir })).toEqual(["v1.0"]);

    const tagOid = await git.resolveRef({ fs, dir, ref: "v1.0" });
    const tagObject = await git.readTag({ fs, dir, oid: tagOid });
    expect(tagObject.tag).toMatchObject({
      type: "commit",
      tag: "v1.0",
      message: "create tag v1.0\n",
      tagger: { name: "user-test", email: "user-test@example.com" },
      object: await git.resolveRef({ fs, dir, ref: "main" }),
    });
  });
});
