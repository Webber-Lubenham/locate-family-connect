const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const basicAuth = require('express-basic-auth');

const app = express();

// Load YAML file
const swaggerDocument = yaml.load(fs.readFileSync(path.join(__dirname, 'mobile/mobile/swagger/auth.yaml'), 'utf8'));

// Redireciona a raiz para /api-docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Protege a rota do Swagger UI com Basic Auth
app.use(
  ['/api-docs', '/api-docs/'],
  basicAuth({
    users: { 'developer@sistema-monitore.com.br': 'DevEduConnect2025!' },
    challenge: true,
    unauthorizedResponse: (req) => 'Acesso restrito à documentação. Faça login como desenvolvedor.'
  }),
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.listen(8080, () => {
  console.log('Swagger UI available at http://localhost:8080/api-docs');
}); 