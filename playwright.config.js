import { defineConfig, devices } from '@playwright/test';

// Os testes rodam contra o build de produção (vite preview), o mesmo que vai ao ar.
// PLAYWRIGHT_CHROMIUM_PATH permite usar um Chromium já instalado em vez de baixar outro.
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      testDir: 'tests/e2e',
      use: { ...devices['Desktop Chrome'], launchOptions: { executablePath } },
    },
    {
      name: 'celular',
      testDir: 'tests/e2e',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath } },
    },
    // Testes sem navegador: o processo das fotos e a validação dos arquivos de dados.
    { name: 'ferramentas', testDir: 'tests/ferramentas' },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
