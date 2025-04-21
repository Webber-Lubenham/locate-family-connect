
// Swagger API Specification for EduConnect

export const apiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'EduConnect API',
    version: '1.0.0',
    description: 'API documentation for EduConnect application',
    contact: {
      name: 'EduConnect Support',
      email: 'support@educonnect.app'
    }
  },
  servers: [
    {
      url: window.location.origin,
      description: 'Current environment'
    },
    {
      url: 'https://educonnect-auth-system.lovable.app',
      description: 'Production environment'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['email', 'password', 'full_name', 'user_type'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecureP@ss123'
          },
          full_name: {
            type: 'string',
            example: 'João Silva'
          },
          user_type: {
            type: 'string',
            enum: ['student', 'parent', 'teacher', 'admin'],
            example: 'student'
          },
          phone: {
            type: 'string',
            example: '+5511999999999'
          }
        }
      },
      LoginCredentials: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'user@example.com'
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecureP@ss123'
          }
        }
      },
      ShareLocationRequest: {
        type: 'object',
        required: ['email', 'latitude', 'longitude', 'studentName'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'parent@example.com'
          },
          latitude: {
            type: 'number',
            example: -23.5505
          },
          longitude: {
            type: 'number',
            example: -46.6333
          },
          studentName: {
            type: 'string',
            example: 'Maria Silva'
          }
        }
      },
      Error: {
        type: 'object',
        properties: {
          message: {
            type: 'string'
          },
          code: {
            type: 'string'
          }
        }
      },
      Profile: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid'
          },
          user_id: {
            type: 'string',
            format: 'uuid'
          },
          full_name: {
            type: 'string'
          },
          user_type: {
            type: 'string',
            enum: ['student', 'parent', 'teacher', 'admin']
          },
          phone: {
            type: 'string'
          },
          created_at: {
            type: 'string',
            format: 'date-time'
          },
          updated_at: {
            type: 'string',
            format: 'date-time'
          }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: 'Access token is missing or invalid',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error'
            },
            example: {
              message: 'Invalid JWT token',
              code: 'UNAUTHORIZED'
            }
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication operations'
    },
    {
      name: 'Profiles',
      description: 'User profile operations'
    },
    {
      name: 'Location',
      description: 'Student location tracking operations'
    }
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Creates a new user account',
        operationId: 'registerUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/User'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'User registered successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object'
                    },
                    session: {
                      type: 'object'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    },
    '/api/auth/signin': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign in user',
        description: 'Authenticates a user and provides a JWT token',
        operationId: 'loginUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/LoginCredentials'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Authentication successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object'
                    },
                    session: {
                      type: 'object',
                      properties: {
                        access_token: {
                          type: 'string'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError'
          }
        }
      }
    },
    '/api/auth/signout': {
      post: {
        tags: ['Authentication'],
        summary: 'Sign out current user',
        description: 'Invalidates the current user session',
        operationId: 'logoutUser',
        security: [
          {
            bearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'Successfully signed out'
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError'
          }
        }
      }
    },
    '/api/profiles/{user_id}': {
      get: {
        tags: ['Profiles'],
        summary: 'Get user profile',
        description: 'Retrieves the profile for a given user ID',
        operationId: 'getUserProfile',
        security: [
          {
            bearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'user_id',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              format: 'uuid'
            },
            description: 'UUID of the user'
          }
        ],
        responses: {
          '200': {
            description: 'Profile information',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Profile'
                }
              }
            }
          },
          '401': {
            $ref: '#/components/responses/UnauthorizedError'
          },
          '404': {
            description: 'Profile not found'
          }
        }
      }
    },
    '/functions/v1/share-location': {
      post: {
        tags: ['Location'],
        summary: 'Share student location',
        description: 'Sends location information to a parent email',
        operationId: 'shareLocation',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ShareLocationRequest'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Location shared successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean'
                    },
                    message: {
                      type: 'string'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid input',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error'
                }
              }
            }
          }
        }
      }
    }
  }
};
