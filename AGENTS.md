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
