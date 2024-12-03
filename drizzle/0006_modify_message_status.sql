-- Custom SQL migration file, put you code below! --
INSERT INTO "message_status" ("status_id") VALUES ('delivered');

UPDATE "ticket_message" SET "message_status" = 'delivered' WHERE "message_status" = 'received';

DELETE FROM "message_status" WHERE "status_id" = 'received';