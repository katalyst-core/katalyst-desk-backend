import { UUID } from 'crypto';
import { AuditFields } from '.';
import { Generated } from 'kysely';

export interface MasterProductModel extends AuditFields {
  productId: Generated<UUID>;
  storeId: UUID;
  name: string;
  sku: string;
  description: string;
  stock: number;
  active: boolean;
}
