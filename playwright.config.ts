import { defineConfig } from '@playwright/test'

// PORT lets several checkouts (git worktrees) run the suite side by side, each
// against its own dev server. Defaults to 3000, the port `npm run dev` uses.
const port = Number(process.env.PORT ?? 3000)

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: `http://localhost:${port}`,
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    port,
    reuseExistingServer: !process.env.CI,
  },
})
