export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    apiPrefix: process.env.API_PREFIX?.trim() ?? '',
    corsOrigin:
      process.env.CORS_ORIGIN ??
      'http://localhost:4173,http://127.0.0.1:4173,http://localhost:5173,http://127.0.0.1:5173',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  auth: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  billing: {
    providerWebhookSecret: process.env.BILLING_PROVIDER_WEBHOOK_SECRET ?? '',
  },
});
