export type ContactTypeId = 'whatsapp' | 'line';

export interface ContactType {
  typeId: ContactTypeId;
  contactName: string;
}
