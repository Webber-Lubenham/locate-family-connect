
import React, { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { apiSpec } from '@/lib/api/swagger-spec';
import { useIsDeveloper } from '@/hooks/use-developer';

interface ApiDocsProps {
  showFullSchema?: boolean;
}

const ApiDocs: React.FC<ApiDocsProps> = ({ showFullSchema = false }) => {
  const isDeveloper = useIsDeveloper();
  useEffect(() => {
    console.log('[DOCS] Swagger API documentation page loaded');
  }, []);

  return (
    <div className="container mx-auto py-8" data-cy="dashboard-container">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
        <p className="text-muted-foreground">
          Interactive documentation for EduConnect API endpoints
        </p>
        
        {isDeveloper && (
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 font-medium">
              Developer Mode
            </Badge>
            
            {showFullSchema && (
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-800 border-green-200">
                Full Schema
              </Badge>
            )}
          </div>
        )}
      </div>
      
      {isDeveloper && showFullSchema ? (
        <Tabs defaultValue="swagger" className="w-full">
          <TabsList className="w-full max-w-md mb-4">
            <TabsTrigger value="swagger">Swagger UI</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="swagger">
            <Card className="p-0 overflow-hidden">
              <SwaggerUI
                spec={apiSpec}
                docExpansion="list"
                defaultModelsExpandDepth={isDeveloper ? 2 : 0}
                supportedSubmitMethods={isDeveloper ? undefined : []}
                persistAuthorization={true}
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="schema">
            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>
                  Complete database schema and entity relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-slate-50 p-4 rounded-md overflow-auto max-h-96">
                  {JSON.stringify(apiSpec.components?.schemas || {}, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="endpoints">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  List of all available API endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {Object.keys(apiSpec.paths || {}).map(path => (
                    <li key={path} className="p-3 border rounded-md">
                      <strong>{path}</strong>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Object.keys(apiSpec.paths[path]).map(method => (
                          <div key={`${path}-${method}`} className="text-xs">
                            <span className="uppercase font-mono bg-slate-200 px-2 py-1 rounded">{method}</span>
                            <span className="ml-2">{apiSpec.paths[path][method].summary}</span>
                          </div>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-0 overflow-hidden">
          <SwaggerUI
            spec={apiSpec}
            docExpansion="list"
            defaultModelsExpandDepth={0}
            supportedSubmitMethods={[]}
            persistAuthorization={true}
          />
        </Card>
      )}
    </div>
  );
};

export default ApiDocs;
