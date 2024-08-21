import { UUID } from 'crypto';
import { Generated } from 'kysely';
import { AuditFields } from '.';

export interface ProductVariantModel extends AuditFields {
  variantId: Generated<UUID>;
  productId: UUID;
  sku: string;
  weight: number;
  name: string;
  stock: number;
  images: string[];
}
