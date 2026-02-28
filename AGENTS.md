# Agent Working Agreement (super-app)

Scope: entire repository.

## Objective
Continuously refine the project until there are no obvious runtime errors, failing tests, or clear logic defects in the implemented scope.

## Required workflow for every change
1. Run tests before and after changes.
2. Prefer small, reversible updates.
3. Keep CLI behavior backward-compatible where practical.
4. Update README when command behavior changes.
5. If adding a feature, add at least one automated test.

## Quality gate
A change is considered complete only when:
- `python3 -m unittest discover -s tests -v` passes.
- Main CLI help loads without error.
- No temporary debug artifacts are committed.

## Roadmap discipline
If roadmap or goals shift, update `GOALS.md` in the same commit.


## Model-specific execution guide (GPT-4.1 and GPT-5-mini)
Use this checklist when a smaller/older model is handling changes:

1. **Establish baseline first**
   - Run `python3 -m unittest discover -s tests -v`.
   - Run CLI help (`node bin/supe.js --help` and `node bin/index.js --help` when dependencies are installed).
   - Save command output in notes before editing files.

2. **Diagnose npm publish/package issues systematically**
   - Validate package metadata: `name`, `version`, `bin`, `files`, and `engines` in `package.json`.
   - Confirm every `bin` target exists, has a shebang, and is executable on Unix (`chmod 755`).
   - Run `npm pack --dry-run` to inspect what will be published.
   - Ensure required runtime files are included in `files` array (or not excluded by ignore rules).

3. **Apply minimal, reversible fixes**
   - Prefer the smallest change that unblocks publish/install behavior.
   - Do not rename commands or flags unless necessary.
   - If CLI behavior changes, update `README.md` in the same commit.

4. **Add or update tests for the bug**
   - Add at least one test that fails before the fix and passes after the fix.
   - For packaging issues, assert bin files exist and have executable mode bits.

5. **Re-run quality gate before commit**
   - `python3 -m unittest discover -s tests -v`
   - `node --test tests/*.test.js`
   - `node bin/supe.js --help`
   - If dependencies are available: `node bin/index.js --help`

6. **Commit hygiene**
   - Keep commit message explicit about user impact (example: `fix: make create-super-app bin executable for npm installs`).
   - Do not commit temp files, logs, or generated debug artifacts.
   - If project goals changed, update `GOALS.md` in the same commit.
