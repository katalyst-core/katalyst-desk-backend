export interface InstagramAuthConfig extends JSON {
  access_token: string;
  permissions: string[];
  profile_picture_url: string;
}
