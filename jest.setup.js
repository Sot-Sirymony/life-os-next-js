require('@testing-library/jest-dom');

global.fetch = require('node-fetch');

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001/api'; 