export const configuration = () => ({
  port: parseInt(process.env.PORT || '5001', 10),
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  },
  azureDevOps: {
    token: process.env.AZURE_DEVOPS_TOKEN || '',
    org: process.env.AZURE_DEVOPS_ORG || '',
    project: process.env.AZURE_DEVOPS_PROJECT || '',
  },
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433', 10),
    user: process.env.POSTGRES_USER || 'codereview',
    password: process.env.POSTGRES_PASSWORD || 'codereview123',
    database: process.env.POSTGRES_DB || 'code_review_db',
  },
});
