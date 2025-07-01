import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

/**
 * Validate the configuration object against the environment variables class
 * @param config - The configuration object
 * @param envVariablesClass - The environment variables class
 * @returns The validated configuration object
 */
export function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: ClassConstructor<T>,
) {
  // Convert the configuration object to a class instance
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true,
  });

  // Validate the configuration object
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  // If there are errors
  if (errors.length > 0) {
    // Format the errors
    const errorMsg = errors
      .map(
        (error) =>
          `\nError in ${error.property}:\n` +
          Object.entries(error.constraints || {})
            .map(([key, value]) => `+ ${key}: ${value}`)
            .join('\n'),
      )
      .join('\n');

    console.error(`\n${errorMsg}`);
    throw new Error(errorMsg || 'Invalid environment configuration');
  }

  return validatedConfig;
}

/**
 * Type-safe helper to get validated configuration
 * Throws error if config is not available, ensuring type safety
 */
export function getValidatedConfig<T>(configService: any, key: string): T {
  const config = configService.get(key) as T;
  if (!config) {
    throw new Error(
      `Configuration '${key}' not found. This should never happen after validation.`,
    );
  }
  return config;
}
