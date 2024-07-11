# git-repo-generator

A CLI tool to generate Git repositories with specific configuration and commit histories, to quickly test your Git tools and workflows.

## Quick Start

```sh
npx git-repo-generator
```

will generate in the current directory a Git repository with

- A `main` branch
- A `test.txt` file in the working directory
- 3 commits

```
1--2--3  main
```

### Options

```sh
npx git-repo-generator --dir repo-test --commits 5
```

| Option                 | Description                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `-d` <br/> `--dir`     | Directory of Git repository (default: `.` current directory )                                           |
| `-c` <br/> `--commits` | Number of commits (default: 3) <br/> Ignored if `--file` is provided (see [below](#configuration-file)) |
| `-f` <br/> `--file`    | Configuration file (see [below](#configuration-file))                                                   |
| `-h` <br/> `--help`    | Display command doc                                                                                     |

## Configuration file

You can provide a YAML file that describes your Git repo configuration and history

```sh
npx git-repo-generator -d repo-test -f git.yaml
```

#### Simple configuration file

```yaml
log:
  - init
  - create file test.txt
  - commit
  - branch develop
  - checkout develop
  - create file test2.txt
  - commit
  - checkout main
  - merge develop
  - tag v1.0
```

will generate the following Git repository

```
  --2--    < develop
 /     \
1-------3  < main < v1.0
```

#### More complex configuration file

```yaml
log:
  - init:
      defaultBranch: main
  - create file:
      file: test.txt
      content: line 1
  - commit:
      message: first commit
      author: user1
      email: user1@example.com
  - branch develop
  - checkout develop
  - change content:
      file: test.txt
      content: |
        line 1
        line 2
  - commit
  - checkout main
  - merge:
      theirs: develop
      message: merge commit
      author: user1
      email: user1@example.com
  - tag:
      name: v1.0
      annotated: true
```

#### Configuration file commands

| Command         | Expressions                                                                                                                                                                                                                                                                                             | Notes                                                                                                                                                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Init repository | <pre>- init</pre> <pre>- init:<br>&nbsp;&nbsp;&nbsp;defaultBranch: master</pre>                                                                                                                                                                                                                         | If omitted: <br> - `defaultBranch = "main"`                                                                                                                                                                                                        |
| Commit          | <pre>- commit</pre> <pre>- commit:<br>&nbsp;&nbsp;&nbsp;message: first commit<br>&nbsp;&nbsp;&nbsp;author: user1<br>&nbsp;&nbsp;&nbsp;email: user1@ex.com</pre>                                                                                                                                         | Equivalent of `git add -a & git commit` (stage all changes in the working dir before committing).<br><br> If omitted: <br> - `message = "commit <#>"` <br> - `author = "user-test"`<br> - `email = "user-test@example.com"`                        |
| Create branch   | <pre>- branch develop</pre>                                                                                                                                                                                                                                                                             |
| Checkout        | <pre>- checkout develop</pre>                                                                                                                                                                                                                                                                           |
| Merge           | <pre>- merge develop</pre> <pre>- merge:<br>&nbsp;&nbsp;&nbsp;theirs: develop<br>&nbsp;&nbsp;&nbsp;message: my merge commit<br>&nbsp;&nbsp;&nbsp;author: user1<br>&nbsp;&nbsp;&nbsp;email: user1@ex.com</pre>                                                                                           | If omitted: <br> - `message = "merge branch <theirs>"` <br> - `author = "user-test"`<br> - `email = "user-test@example.com"`<br><br> Merges never fast-forward.<br><br> Merge conflicts are auto-resolved cleanly by favoring the "theirs" branch. |
| Tag             | <pre>- tag v1.0</pre> <pre>- tag:<br>&nbsp;&nbsp;&nbsp;name: v1.0<br>&nbsp;&nbsp;&nbsp;annotated: true<br>&nbsp;&nbsp;&nbsp;message: new tag<br>&nbsp;&nbsp;&nbsp;author: user1<br>&nbsp;&nbsp;&nbsp;email: user1@ex.com</pre>                                                                          | By default, creates a lightweight tag, unless `annotated: true`<br><br>If omitted: <br> - `annotated = false`<br> - `message = "create tag <name>"` <br> - `author = "user-test"`<br> - `email = "user-test@example.com"`                          |
| Create file     | <pre>- create file src/test.txt</pre> <pre>- create file:<br>&nbsp;&nbsp;&nbsp;file: test.txt<br>&nbsp;&nbsp;&nbsp;content: file content</pre> <pre>- create file:<br>&nbsp;&nbsp;&nbsp;file: test.txt<br>&nbsp;&nbsp;&nbsp;content: \|<br>&nbsp;&nbsp;&nbsp; line 1<br>&nbsp;&nbsp;&nbsp; line 2</pre> | If omitted: <br> - `content = <file name>`                                                                                                                                                                                                         |
| Change content  | <pre>- change content:<br>&nbsp;&nbsp;&nbsp;file: test.txt<br>&nbsp;&nbsp;&nbsp;content: new file content</pre>                                                                                                                                                                                         |                                                                                                                                                                                                                                                    |

## License

[MIT](https://github.com/hhourani27/git-repo-generator/blob/main/LICENSE)

## Acknowledgements

- [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git): for working with Git repositories (Great project. Check it out!)
