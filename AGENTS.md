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
