import { z } from 'zod';

export const WhatsAppMessagePropsSchema = z
  .object({
    from: z.string(),
    id: z.string(),
    timestamp: z.string(),
  })
  .strict();

export const WhatsAppMessageSchema = z.object({
  text: z
    .object({
      body: z.string(),
    })
    .strict(),
  type: z.string(),
});

export const WhatsAppWebhookSchema = z
  .object({
    object: z.literal('whatsapp_business_account'),
    entry: z.array(
      z
        .object({
          id: z.string(),
          changes: z.array(
            z
              .object({
                value: z
                  .object({
                    messaging_product: z.literal('whatsapp'),
                    metadata: z
                      .object({
                        display_phone_number: z.string(),
                        phone_number_id: z.string(),
                      })
                      .strict(),
                    contacts: z.array(
                      z
                        .object({
                          profile: z
                            .object({
                              name: z.string(),
                            })
                            .strict(),
                          wa_id: z.string(),
                        })
                        .strict(),
                    ),
                    messages: z.array(
                      WhatsAppMessageSchema.merge(WhatsAppMessagePropsSchema),
                    ),
                  })
                  .strict(),
                field: z.literal('messages'),
              })
              .strict(),
          ),
        })
        .strict(),
    ),
  })
  .strict();

export type WhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;
export type WhatsAppWebhook = z.infer<typeof WhatsAppWebhookSchema>;
