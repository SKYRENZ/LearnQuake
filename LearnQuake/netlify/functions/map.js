import serverless from 'serverless-http';
import app, { handler as appHandler } from '../../backend/serverlessApp.js';

export const handler = async (event, context) => {
  const wrapped = serverless(app);
  return wrapped(event, context);
};

