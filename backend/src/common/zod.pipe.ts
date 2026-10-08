import { PipeTransform } from '@nestjs/common';
import { z, ZodType } from 'zod';
import { AppException } from './app.exception';

/** Validates a request body/query against a Zod schema. Unknown keys are rejected (use .strict()). */
export class ZodPipe<T extends ZodType> implements PipeTransform {
  constructor(private readonly schema: T) {}
  transform(value: unknown): z.infer<T> {
    const result = this.schema.safeParse(value ?? {});
    if (result.success) return result.data;
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) fields[issue.path.join('.') || '_'] ??= issue.message;
    throw new AppException('VALIDATION_ERROR', 'Please check the information you entered.', 400, fields);
  }
}

export const zodBody = <T extends ZodType>(schema: T) => new ZodPipe(schema);
