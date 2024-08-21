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
  price: number;
  discount_price: number;
  discount_percentage: number;
  weight: number;
  images: string[];
  videos: string[];
  dimension_width: number;
  dimension_height: number;
  dimension_length: number;
  brand: string;
  condition: string;
  preorder: boolean;
  preorder_duration: number;
  variant_name: string;
  wholesale: {
    max_count: number;
    price: number;
  }[];
  attribute: any; // Change this later
  active: boolean;
}
