import { z } from 'zod';

const unsafeProductionValues = new Set([
  'change-this-access-secret',
  'change-this-refresh-secret',
  'replace-with-32-plus-char-access-secret',
  'replace-with-32-plus-char-refresh-secret',
  'replace-with-32-plus-char-webhook-secret',
  'trivacare',
]);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().optional().transform((value) => value?.trim() ?? ''),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().min(2, 'JWT_ACCESS_EXPIRES_IN is required'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(2, 'JWT_REFRESH_EXPIRES_IN is required'),
  BILLING_PROVIDER_WEBHOOK_SECRET: z.string().optional(),
  CORS_ORIGIN: z
    .string()
    .min(1)
    .default(
      'http://localhost:4173,http://127.0.0.1:4173,http://localhost:5173,http://127.0.0.1:5173',
    ),
}).superRefine((env, context) => {
  if (env.NODE_ENV !== 'production') {
    return;
  }

  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    if (unsafeProductionValues.has(env[key])) {
      context.addIssue({
        code: 'custom',
        path: [key],
        message: `${key} must be replaced for production`,
      });
    }
  }

  if (!env.BILLING_PROVIDER_WEBHOOK_SECRET) {
    context.addIssue({
      code: 'custom',
      path: ['BILLING_PROVIDER_WEBHOOK_SECRET'],
      message: 'BILLING_PROVIDER_WEBHOOK_SECRET is required for production',
    });
  } else if (
    env.BILLING_PROVIDER_WEBHOOK_SECRET.length < 32 ||
    unsafeProductionValues.has(env.BILLING_PROVIDER_WEBHOOK_SECRET)
  ) {
    context.addIssue({
      code: 'custom',
      path: ['BILLING_PROVIDER_WEBHOOK_SECRET'],
      message: 'BILLING_PROVIDER_WEBHOOK_SECRET must be a non-placeholder secret of at least 32 characters',
    });
  }

  if (env.DATABASE_URL.includes(':trivacare@')) {
    context.addIssue({
      code: 'custom',
      path: ['DATABASE_URL'],
      message: 'DATABASE_URL must not use the local default database password in production',
    });
  }
});

export type EnvironmentVariables = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');

    throw new Error(`Environment validation failed: ${message}`);
  }

  return parsed.data;
}
