import { z } from 'zod';
import { EVENT_STATUSES } from '../database/schemas';

const date = z.coerce.date();
const objectId = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const base = {
  name: z.string().trim().min(2).max(200),
  description: z.string().max(1000),
  organizationName: z.string().trim().min(2).max(200),
  certificateTitle: z.string().trim().min(1).max(100),
  issueDate: date,
  expiryDate: date,
  status: z.enum(EVENT_STATUSES),
  templateId: objectId,
  allowDuplicates: z.boolean(),
  /** 2-6 letters/digits in the certificate number: WTL-<code>-00001. */
  certificateCode: z.string().trim().regex(/^[A-Za-z0-9]{2,6}$/, 'Use 2-6 letters or digits'),
};

export const createEventSchema = z
  .object({
    ...base,
    description: base.description.optional(),
    certificateTitle: base.certificateTitle.optional(),
    issueDate: base.issueDate.optional(),
    expiryDate: base.expiryDate.optional(),
    status: base.status.optional(),
    templateId: base.templateId.optional(),
    allowDuplicates: base.allowDuplicates.optional(),
    certificateCode: base.certificateCode.optional(),
    /** Optional custom code (letters/digits), e.g. FIRSTAID2026. Generated when omitted. */
    eventCode: z.string().regex(/^[A-Za-z0-9]{4,20}$/).optional(),
  })
  .strict();

export const updateEventSchema = z.object(base).partial().strict();
