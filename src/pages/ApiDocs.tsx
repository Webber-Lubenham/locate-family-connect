
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { apiSpec } from '@/lib/api/swagger-spec';

const ApiDocs = () => {
  useEffect(() => {
    console.log('[DOCS] Swagger API documentation page loaded');
  }, []);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Interactive documentation for EduConnect API endpoints
        </p>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <SwaggerUI
          spec={apiSpec}
          docExpansion="list"
          defaultModelsExpandDepth={0}
          persistAuthorization={true}
        />
      </Card>
    </div>
  );
};

export default ApiDocs;
