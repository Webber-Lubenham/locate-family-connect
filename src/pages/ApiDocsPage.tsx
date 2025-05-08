import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiDocsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Documentação da API</h1>
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <SwaggerUI 
          url="/api-docs.yaml"
          docExpansion="none"
          deepLinking={true}
          plugins={[]}
          persistAuthorization={true}
          displayRequestDuration={true}
          filter={true}
          defaultModelsExpandDepth={-1}
          validatorUrl={null}
        />
      </div>
    </div>
  );
}
