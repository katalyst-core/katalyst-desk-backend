import { UUID } from 'crypto';

export interface LocalUser {
  userId: UUID;
}

export interface AccessUser {
  userId: UUID;
}

export interface RefreshUser {
  userId: UUID;
  sessionToken: string;
}

export interface AccessContent {
  sub: string;
}

export interface RefreshContent {
  sub: string;
  session_token: string;
}
