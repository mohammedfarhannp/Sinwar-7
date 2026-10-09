import { z } from 'zod';
import timelineData from './timeline.json';

const timelineSourceSchema = z.object({
  label: z.string().trim().min(1),
  url: z.string().url(),
});

const timelineEntrySchema = z.object({
  id: z.string().trim().min(1),
  date: z.string().regex(/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/),
  dateLabel: z.string().trim().min(1),
  era: z.string().trim().min(1),
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  detail: z.string().trim().min(1),
  sources: z.array(timelineSourceSchema).min(1),
  image: z.string().url().optional(),
});

export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

const timelineEntriesSchema = z
  .array(timelineEntrySchema)
  .min(1)
  .refine(
    (entries) =>
      new Set(entries.map((entry) => entry.id)).size === entries.length,
    'Timeline entry IDs must be unique.',
  );

export const timelineEntries = timelineEntriesSchema.parse(timelineData);
export const timelineEras = [
  ...new Set(timelineEntries.map((entry) => entry.era)),
];
