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

export const WhatsAppStatusesSchema = z
  .object({
    id: z.string(),
    status: z.string(),
    timestamp: z.string(),
    recipient_id: z.string(),
    conversation: z
      .object({
        id: z.string(),
        expiration_timestamp: z.string().optional(),
        origin: z
          .object({
            type: z.string(),
          })
          .strict(),
      })
      .strict()
      .optional(),
    pricing: z
      .object({
        billable: z.boolean(),
        pricing_model: z.string(),
        category: z.string(),
      })
      .strict()
      .optional(),
  })
  .strict();

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
                      .strict()
                      .optional(),
                    contacts: z
                      .array(
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
                      )
                      .optional(),
                    messages: z
                      .array(
                        WhatsAppMessageSchema.merge(WhatsAppMessagePropsSchema),
                      )
                      .optional(),
                    statuses: z.array(WhatsAppStatusesSchema).optional(),
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
