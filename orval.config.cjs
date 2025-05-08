module.exports = {
  auth: {
    input: './mobile/mobile/swagger/auth.yaml',
    output: {
      mode: 'tags-split',
      target: './src/api/auth.ts',
      schemas: './src/api/auth-schemas.ts',
    },
  },
}; 