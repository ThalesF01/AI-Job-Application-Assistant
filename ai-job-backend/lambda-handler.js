const serverless = require('serverless-http');
const app = require('./src/app.js'); // seu arquivo app.js principal

module.exports.handler = serverless(app);