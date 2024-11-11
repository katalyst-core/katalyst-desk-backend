import { z } from 'zod';

export const InstagramMessagePropsSchema = z
  .object({
    mid: z.string(),
  })
  .strict();

export const InstagramMessageSchema = z.object({
  text: z.string(),
  quick_reply: z
    .object({
      payload: z.string(),
    })
    .strict()
    .optional(),
  reply_to: z
    .object({
      mid: z.string(),
    })
    .optional(),
  is_echo: z.boolean().optional(),
});

export const InstagramWebhookSchema = z
  .object({
    object: z.literal('instagram'),
    entry: z.array(
      z
        .object({
          id: z.string(),
          time: z.number(),
          messaging: z.array(
            z
              .object({
                sender: z.object({ id: z.string() }).strict(),
                recipient: z.object({ id: z.string() }).strict(),
                timestamp: z.number(),
                message: InstagramMessageSchema.merge(
                  InstagramMessagePropsSchema,
                ),
              })
              .strict(),
          ),
        })
        .strict(),
    ),
  })
  .strict();

export type InstagramMessage = z.infer<typeof InstagramMessageSchema>;
export type InstagramWebhook = z.infer<typeof InstagramWebhookSchema>;
