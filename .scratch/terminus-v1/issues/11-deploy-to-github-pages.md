# 11 — Deploy to GitHub Pages

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** Terminus is published at `https://jacobtaylor27.github.io/terminus/` every time the user pushes to `master`. The build uses the `/terminus/` base path so assets and map data load correctly under that URL, and a GitHub Actions workflow builds the static site and deploys it to GitHub Pages. The user commits and pushes manually — this ticket only prepares the configuration.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] The production build uses the `/terminus/` base path, and the built site works when served under that path (including map data)
- [ ] A GitHub Actions workflow installs dependencies with pnpm, runs the tests, builds, and deploys to GitHub Pages on push to `master`
- [ ] A failing test stops the deploy
- [ ] The README or ticket notes tell the user the one-time GitHub setting needed (Pages source set to GitHub Actions)
- [ ] Nothing is committed or pushed by the agent

## Comments

**2026-11-02** — Decided during implementation: the workflow deploys on push to `master`, not `main`, because `master` is this repo's default branch (`origin/HEAD -> origin/master`) and a `main` trigger would never fire. This ticket's text was updated to match. `vite.config.ts` sets `base: '/terminus/'` for every command, not just the build, because `vite preview` must serve the build under the same path. So locally the app is at `http://localhost:5173/terminus/` (dev) and `http://localhost:4173/terminus/` (preview). The map data is statically imported and bundled into the JS, so there is no separate asset path to configure. `.github/workflows/deploy.yml` follows GitHub's Pages starter: a `build` job runs `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build` and uploads `dist/`, and a `deploy` job that `needs: build` publishes it. A failing test (or type error) fails `build`, so nothing is deployed. It can also be run by hand from the Actions tab. pnpm 12 and Node 24 are pinned in the workflow to match local. Checked locally by loading the preview build in headless Chrome under `/terminus/`: starting an Attempt drew all 201 map shapes, typing "France" made the Score 1/197, and no requests failed. The workflow itself has not run on GitHub yet.

**2026-11-02** — One-time GitHub setting, needed before the first deploy succeeds: at https://github.com/jacobtaylor27/terminus/settings/pages, under **Build and deployment → Source**, choose **GitHub Actions**. After that, every push to `master` publishes to https://jacobtaylor27.github.io/terminus/.
