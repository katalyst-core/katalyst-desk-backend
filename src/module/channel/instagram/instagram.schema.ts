import { z } from 'zod';

export const InstagramMessage = z
  .object({
    mid: z.string(),
    text: z.string(),
    quick_reply: z
      .object({
        payload: z.string(),
      })
      .optional(),
    reply_to: z
      .object({
        mid: z.string(),
      })
      .optional(),
    is_echo: z.boolean().optional(),
  })
  .strict();

export const InstagramWebhook = z.object({
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
              message: InstagramMessage,
            })
            .strict(),
        ),
      })
      .strict(),
  ),
});

export type InstagramMessageType = z.infer<typeof InstagramMessage>;
export type InstagramWebhookType = z.infer<typeof InstagramWebhook>;
