module.exports = {
  e2e: {
    baseUrl: 'http://localhost:8090',
    env: {
      authUrl: 'http://localhost:9000',
    },
    setupNodeEvents(on, config) {
      // cypress.env.json's `baseUrl` key only merges into config.env.baseUrl, not the actual config.baseUrl
      // Cypress navigates with -- promote it explicitly so overriding baseUrl via cypress.env.json
      // (see README.md) actually works. A real CYPRESS_BASE_URL env var is merged in after this and still wins.
      if (config.env.baseUrl) {
        config.baseUrl = config.env.baseUrl;
      }

      return config;
    },
  },
};
