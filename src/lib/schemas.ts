import { z } from 'zod';

/**
 * Client-side mirrors of the API DTOs. Every rule here exists on the server
 * too — these are for fast feedback, never the real guard. When a rule changes
 * on one side it must change on the other in the same commit.
 *
 * See the dto folders under api/src and the implementation-rules skill.
 */

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Normalization runs before validation, exactly as the DTO @Transform does. */
const trimmed = z.string().transform((value) => value.trim());
const normalizedEmail = z
  .string()
  .transform((value) => value.trim().toLowerCase());

export const loginSchema = z.object({
  email: normalizedEmail.pipe(
    z.string().email('Enter a valid email address').max(255),
  ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const brokerSchema = z
  .object({
    name: trimmed.pipe(z.string().min(1, 'Name is required').max(255)),
    isActive: z.boolean().default(true),
    dailyCap: z.coerce
      .number()
      .int('Daily cap must be a whole number')
      .min(0)
      .max(100000),
    timezone: z.string().min(1, 'Timezone is required'),
    openMinute: z.coerce.number().int().min(0).max(1440),
    closeMinute: z.coerce.number().int().min(0).max(1440),
    workingDays: z
      .array(z.number().int().min(1).max(7))
      .min(1, 'Select at least one working day')
      .max(7),
  })
  .refine((data) => data.openMinute !== data.closeMinute, {
    message: 'Opening and closing time cannot be the same',
    path: ['closeMinute'],
  });
export type BrokerInput = z.infer<typeof brokerSchema>;

export const formSchema = z.object({
  name: trimmed.pipe(z.string().min(1, 'Form name is required').max(255)),
  slug: normalizedEmail.pipe(
    z
      .string()
      .min(1, 'Slug is required')
      .max(255)
      .regex(
        SLUG_PATTERN,
        'Slug may contain lowercase letters, numbers and hyphens only',
      ),
  ),
});
export type FormInput = z.infer<typeof formSchema>;

export const distributionBrokerSchema = z.object({
  brokerId: z.number().int(),
  percentage: z.coerce
    .number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),
  isActive: z.boolean().default(true),
});

export const setBrokersSchema = z.object({
  brokers: z.array(distributionBrokerSchema),
});
export type SetBrokersInput = z.infer<typeof setBrokersSchema>;

export const leadFormSchema = z.object({
  name: trimmed.pipe(z.string().min(1, 'Name is required').max(255)),
  email: normalizedEmail.pipe(
    z.string().email('Enter a valid email address').max(255),
  ),
  phone: trimmed.pipe(z.string().max(32)).optional(),
});
export type LeadFormInput = z.infer<typeof leadFormSchema>;

/* -------------------------------------------------------------------------
 * Response shapes. Parsed at the boundary so a server sending something
 * unexpected becomes a handled error rather than an undefined render.
 * ---------------------------------------------------------------------- */

export const leadStatusSchema = z.enum([
  'sent',
  'unsent',
  'duplicate',
  'failed',
]);
export type LeadStatus = z.infer<typeof leadStatusSchema>;

export const brokerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  isActive: z.boolean(),
  dailyCap: z.number(),
  timezone: z.string(),
  openMinute: z.number(),
  closeMinute: z.number(),
  workingDays: z.string(),
});
export type Broker = z.infer<typeof brokerResponseSchema>;

export const leadResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  ipAddress: z.string(),
  formName: z.string(),
  brokerId: z.number().nullable(),
  broker: z.object({ id: z.number(), name: z.string() }).nullable().optional(),
  status: leadStatusSchema,
  assignedAt: z.string().nullable(),
  note: z.string().nullable(),
  createdAt: z.string(),
});
export type Lead = z.infer<typeof leadResponseSchema>;

export const formResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
});
export type LeadForm = z.infer<typeof formResponseSchema>;

export const distributionResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  formId: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  form: formResponseSchema.nullable().optional(),
  brokers: z
    .array(
      z.object({
        id: z.number(),
        brokerId: z.number(),
        percentage: z.union([z.number(), z.string()]).transform(Number),
        isActive: z.boolean(),
        broker: brokerResponseSchema.nullable().optional(),
      }),
    )
    .default([]),
});
export type Distribution = z.infer<typeof distributionResponseSchema>;

export const summarySchema = z.object({
  total: z.number(),
  sent: z.number(),
  unsent: z.number(),
  duplicate: z.number(),
  failed: z.number(),
});
export type Summary = z.infer<typeof summarySchema>;
