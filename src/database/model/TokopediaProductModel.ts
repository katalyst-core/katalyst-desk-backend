import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface TokopediaProductModel extends AuditFields {
  extProductId: number;
  productId: UUID;
}
