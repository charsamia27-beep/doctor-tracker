// Env must be set before any app module (config/env.js) is imported.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://placeholder'; // replaced in helpers.js by the in-memory server
process.env.JWT_SECRET = 'test-secret-that-is-definitely-longer-than-32-chars';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';
process.env.LOGIN_MAX_ATTEMPTS = '3';
