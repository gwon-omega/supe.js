# Contributing to Super App

Thanks for contributing.

## Workflow

1. Fork and create a feature branch.
2. Keep changes focused and backward-compatible.
3. Add or update tests for every behavior change.
4. Update README when CLI behavior changes.

## Required checks

Run these before opening a pull request:

```bash
python3 -m unittest discover -s tests -v
node --test tests/*.test.js
node bin/supe.js --help
node bin/index.js --help
```

## Pull requests

- Use clear commit messages explaining user impact.
- Include test evidence in the PR description.
- Do not include temporary files or debug artifacts.
