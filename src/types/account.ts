import { z } from 'zod';

export const ACCOUNT_CATEGORIES = [
  'entertainer',
  'athlete',
  'politician',
  'brand',
  'media',
  'organization',
  'other',
] as const;

export const accountSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9._]+$/),
    username: z.string().regex(/^[a-zA-Z0-9._]+$/),
    displayName: z.string().nullable(),
    category: z.enum(ACCOUNT_CATEGORIES),
    avatarUrl: z
      .string()
      .regex(/^\/avatars\/[a-zA-Z0-9._/-]+\.webp$/)
      .nullable(),
    avatarFallback: z.string(),
    verifiedGuess: z.boolean(),
    tags: z.array(z.string().min(1)),
    addedAt: z.iso.date(),
    notes: z.string().optional(),
  })
  .refine((account) => account.id === account.username.toLowerCase(), {
    message: 'Account id must be the lowercased username.',
    path: ['id'],
  });

export const accountsSchema = z.array(accountSchema);

export type Account = z.infer<typeof accountSchema>;
export type AccountCategory = (typeof ACCOUNT_CATEGORIES)[number];

export const blockedStateSchema = z.object({
  version: z.literal(1),
  usernames: z.array(z.string().regex(/^[a-zA-Z0-9._]+$/)),
  updatedAt: z.iso.datetime(),
});

export type BlockedState = z.infer<typeof blockedStateSchema>;
