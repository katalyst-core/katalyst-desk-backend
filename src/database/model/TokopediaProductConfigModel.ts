import { UUID } from 'crypto';
import { AuditFields } from '.';

export interface TokopediaProductConfigModel extends AuditFields {
  productId: UUID;
  categoryId: number;
}
