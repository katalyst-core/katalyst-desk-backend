import { Generated } from 'kysely';
import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface MasterCustomer extends AuditFields {
  masterCustomerId: Generated<UUID>;
  customerName: string;
}
