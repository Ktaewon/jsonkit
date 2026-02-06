import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export interface SchemaError {
  path: string;
  message: string;
  keyword: string;
}

export interface SchemaValidationResult {
  success: boolean;
  isValid: boolean;
  errors: SchemaError[];
  error?: string;
}

/**
 * Validate JSON data against a JSON Schema
 */
export function validateJsonSchema(data: string, schema: string): SchemaValidationResult {
  if (!data.trim() || !schema.trim()) {
    return {
      success: false,
      isValid: false,
      errors: [],
      error: 'Both JSON data and schema are required',
    };
  }

  try {
    const parsedData = JSON.parse(data);
    const parsedSchema = JSON.parse(schema);

    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);

    const validate = ajv.compile(parsedSchema);
    const valid = validate(parsedData);

    if (valid) {
      return {
        success: true,
        isValid: true,
        errors: [],
      };
    } else {
      const errors: SchemaError[] = (validate.errors || []).map((err) => ({
        path: err.instancePath || '/',
        message: err.message || 'Unknown error',
        keyword: err.keyword,
      }));

      return {
        success: true,
        isValid: false,
        errors,
      };
    }
  } catch (e) {
    return {
      success: false,
      isValid: false,
      errors: [],
      error: (e as Error).message,
    };
  }
}

/**
 * Get example schema for demonstration
 */
export function getExampleSchema(): string {
  return JSON.stringify(
    {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1 },
        age: { type: 'integer', minimum: 0 },
        email: { type: 'string', format: 'email' },
      },
      required: ['name', 'email'],
    },
    null,
    2
  );
}

/**
 * Get example data for demonstration
 */
export function getExampleData(): string {
  return JSON.stringify(
    {
      name: 'John Doe',
      age: 30,
      email: 'john@example.com',
    },
    null,
    2
  );
}
