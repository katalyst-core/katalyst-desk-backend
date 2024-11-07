-- Custom SQL migration file, put you code below! --
INSERT INTO "auth_type" ("type_id") VALUES ('basic');
INSERT INTO "channel_type" ("type_id") VALUES ('instagram'), ('facebook'), ('whatsapp'), ('telegram');
INSERT INTO "ticket_status" ("status_id") VALUES ('open'), ('close');
INSERT INTO "message_status" ("status_id") VALUES ('sent'), ('received'), ('read');