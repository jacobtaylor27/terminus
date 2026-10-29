# 11 — Deploy to GitHub Pages

**Parent spec:** `.scratch/terminus-v1/spec.md`

**What to build:** Terminus is published at `https://jacobtaylor27.github.io/terminus/` every time the user pushes to `main`. The build uses the `/terminus/` base path so assets and map data load correctly under that URL, and a GitHub Actions workflow builds the static site and deploys it to GitHub Pages. The user commits and pushes manually — this ticket only prepares the configuration.

**Blocked by:** 01 — Type a Country, see it colored

**Status:** ready-for-agent

- [ ] The production build uses the `/terminus/` base path, and the built site works when served under that path (including map data)
- [ ] A GitHub Actions workflow installs dependencies with pnpm, runs the tests, builds, and deploys to GitHub Pages on push to `main`
- [ ] A failing test stops the deploy
- [ ] The README or ticket notes tell the user the one-time GitHub setting needed (Pages source set to GitHub Actions)
- [ ] Nothing is committed or pushed by the agent
