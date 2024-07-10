export interface LocalUser {
  publicId: string;
}

export interface AccessUser {
  publicId: string;
}

export interface RefreshUser {
  publicId: string;
  sessionToken: string;
}

export interface AccessContent {
  sub: string;
}

export interface RefreshContent {
  sub: string;
  session_token: string;
}
