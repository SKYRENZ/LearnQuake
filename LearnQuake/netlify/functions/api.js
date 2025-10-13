import serverless from 'serverless-http';
import app from '../../backend/serverlessApp.js';

export const handler = serverless(app);