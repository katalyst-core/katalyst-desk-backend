export interface WARequest extends JSON {
  object: string;
  entry: {
    id: string;
    changes: {
      field: string;
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts: {
          profile: {
            name: string;
          };
          wa_id: string;
        }[];
        messages: WAMessage[];
      };
    }[];
  }[];
}

export interface WAMessage extends JSON {
  from: string;
  id: string;
  timestamp: string;
  type: 'text' | 'sticker' | 'image' | 'audio' | 'video';
  image?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
  sticker?: {
    mime_type: string;
    sha256: string;
    id: string;
    animated: boolean;
  };
  text?: {
    body: string;
  };
  audio?: {
    mime_type: string;
    sha256: string;
    id: string;
    voice: boolean;
  };
  video?: {
    caption?: string;
    mime_type: string;
    sha256: string;
    id: string;
  };
}

// export interface WAEntry {
//   id: string;
//   changes: WAChange;
// }

// export interface WAChange {
//   value: WAChangeValue;
//   field: string;
// }

// export interface WAChangeValue {
//   messaging_product: string;
//   metadata: WAMetadata;
// }

// export interface WAMetadata {
//   display_phone_number: string;
//   phone_number_id: string;
// }

// export interface WAContact {
//   profile: {
//     name: string;
//   };

// }
