/// <reference types="vitest/config" />
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const git = (args: string) => execSync(`git ${args}`, { encoding: 'utf8' }).trim()
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

// Which build this is, shown at the foot of the home page: the version is bumped by hand in
// package.json, and the build number counts the commits, so it goes up with every push without
// anything being committed.
const appVersion = {
  version: packageJson.version,
  build: Number(git('rev-list --count HEAD')),
  commit: git('rev-parse HEAD'),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served from GitHub Pages at https://jacobtaylor27.github.io/terminus/
  base: '/terminus/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  test: {
    // Vitest blanks every stylesheet unless told otherwise. The palette check reads index.css as
    // text, so stylesheets imported with ?raw keep theirs.
    css: { include: [/\.css\?raw$/] },
  },
})
