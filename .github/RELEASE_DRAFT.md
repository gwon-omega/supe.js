Release v1.0.1 (draft)

Tag: v1.0.1

Notes:
- Publish package to npm as `@supejs/supe`.
- Update Homebrew formula sha256 in `packaging/homebrew/supe.rb` to the tarball sha after the GitHub release is created.
- Attach compiled tarball or let GitHub create source tarballs automatically.

Changelog (high level):
- Add install scripts (`supe-install.sh`, `supe-install`) and checksum verification.
- Add SSH deploy helper and packaging drafts for Homebrew/Chocolatey.
- Fix test suite and CLI entrypoint.

Publish steps (manual):
1. Create a GitHub tag `v1.0.1` and push it.
2. Create a GitHub Release using this draft as the body.
3. Run `npm publish --access=public` from a machine authenticated as the publishing account.
4. Update Homebrew formula `sha256` and submit PR to Homebrew/homebrew-core if desired.
