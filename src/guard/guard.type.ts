export type AccessLevel = 'normal' | 'bypass';

export type GuardAccess = {
  isOwner?: boolean;
  permissions?: bigint[];
};
