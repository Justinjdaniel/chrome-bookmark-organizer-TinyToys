# Repository Guidelines for Agents

## 1. Pre-Task Synchronization Protocol (STRICT)

Before making any code edits or planning changes:

1. Always fetch the latest state from `origin/main`.
2. Check if the current working branch is behind `main`.
3. If `main` contains updates, merge or rebase `main` into the current working branch before writing any code.
4. Verify that the working branch builds cleanly after synchronization.

## 2. Code Quality & Formatting

* **TypeScript:** Strict type checking required (`noImplicitAny`, strict null checks).
* **Linting & Formatting:** Adhere to project ESLint and Prettier/Biome configurations.
* **Verification:** Run `npm run lint` and `npm run build` locally in the Cloud VM before outputting the final plan/diff.

## 3. Security & BYOK Rules

* Never log, hardcode, or persist user API keys on the server or in logs.
* Gemini API keys must reside solely in browser local storage (`sessionStorage`) or ephemeral memory.

## 4. Task Completion & Pull Request Directives

### 1. Auto-Export Protocol

* Upon successfully completing all plan steps, linting, and build checks, automatically push the changes to a feature branch and open a Pull Request targeting `main`.
* Include a clean title and markdown summary of all modified/added files in the PR description.

### 2. Custom Command Triggers

When the user sends any of the following keyword commands in the chat, immediately execute the PR submission workflow without requesting further confirmation:

* `ship it`
* `create pr`
* `export pr`
* `make pull request`

### 3. Submission Verification

Before finalizing the PR, ensure:

1. `npm run build` and `npm run lint` pass without errors.
2. The working branch is up-to-date with `origin/main`.
