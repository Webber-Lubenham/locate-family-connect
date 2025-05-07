/**
 * Arquivo de configuração do Cypress
 * O principal arquivo de configuração para os testes e2e e de componentes
 * Otimizado para compatibilidade com React 18 e novos recursos
 */

const { defineConfig } = require('cypress');
const { startDevServer } = require('@cypress/vite-dev-server');

// Exporta a configuração do Cypress
module.exports = defineConfig({
  projectId: 'zfukjx',
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
      return config;
    },
    devServer: {
      framework: 'react',
      bundler: 'vite',
      viteConfig: {
        server: {
          port: 8080,
          strictPort: true,
          hmr: {
            clientPort: 8080
          }
        }
      }
    }
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    experimentalModifyObstructiveThirdPartyCode: true, // Ajuda a evitar conflitos com bibliotecas externas
    chromeWebSecurity: false, // Necessário para alguns testes de autenticação
    testIsolation: false, // Melhora compatibilidade com React 18
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    supportFile: 'cypress/support/component.js',
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
  },
  env: {
    // Variáveis de ambiente para os testes
    testUserEmail: 'mauro.lima@educacao.am.gov.br',
    testUserPassword: 'DevEduConnect2025!'
  }
}); 