const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shopee Calculator Backend API',
      version: '1.0.0',
      description: 'API documentation for Shopee Calculator Backend',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        xAuthToken: {
          type: 'apiKey',
          in: 'header',
          name: 'x-auth-token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'phone', 'password'],
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            name: {
              type: 'string',
              description: 'User full name',
              example: 'Nguyen Van A',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '0123456789',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
            shopLink: {
              type: 'string',
              description: 'Shopee shop link (optional)',
              example: 'https://shopee.vn/shop/123456',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'User last update date',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['phone', 'password'],
          properties: {
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '0123456789',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'phone', 'password'],
          properties: {
            name: {
              type: 'string',
              description: 'User full name',
              example: 'Nguyen Van A',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '0123456789',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
            shopLink: {
              type: 'string',
              description: 'Shopee shop link (optional)',
              example: 'https://shopee.vn/shop/123456',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login successful',
            },
            token: {
              type: 'string',
              description: 'JWT token',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            user: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  example: '64a7b8c9d1e2f3g4h5i6j7k8',
                },
                name: {
                  type: 'string',
                  example: 'Nguyen Van A',
                },
                phone: {
                  type: 'string',
                  example: '0123456789',
                },
                shopLink: {
                  type: 'string',
                  example: 'https://shopee.vn/shop/123456',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
            error: {
              type: 'string',
              description: 'Detailed error message (development only)',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
