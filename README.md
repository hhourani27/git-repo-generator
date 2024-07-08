# git-repo-generator

A CLI tool to generate Git repositories with specific configuration and commit histories, to easily test your Git tools and workflows.

## Quick Start

```sh
npx git-repo-generator
```

will generate in the current directory a Git repository with

- A `main` branch
- A `test.txt` file in the working directory
- 3 commits

```
o--o--o  main
```

### Options

```sh
npx git-repo-generator --dir repo-test --commits 5
```

| Option                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `--dir` <br/> `-d`     | Directory of Git repository (default: `.` current directory ) |
| `--commits` <br/> `-c` | Number of commits (default: 3)                                |
| `--help` <br/> `-h`    | Display command doc                                           |

## License

[MIT](https://github.com/hhourani27/git-repo-generator/blob/main/LICENSE)

## Acknowledgements

- [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git): for working with Git repositories (Great project. Check it out!)
