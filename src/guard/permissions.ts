export const NO_PERM = BigInt(0x0);
export const TICKET_DETAIL = BigInt(0x1);
export const TICKET_LIST = BigInt(0x2);
export const TICKET_CLOSE = BigInt(0x4);
export const TICKET_MANAGE = BigInt(0x8);
export const TICKET_MESSAGE_LIST = BigInt(0x10);
export const TICKET_MESSAGE_SEND = BigInt(0x20);
export const AGENT_LIST = BigInt(0x40);
export const AGENT_MANAGE = BigInt(0x80);
export const TEAM_LIST = BigInt(0x100);
export const TEAM_MANAGE = BigInt(0x200);
export const AGENT_TEAM_LIST = BigInt(0x400);
export const AGENT_TEAM_MANAGE = BigInt(0x800);
export const CHANNEL_LIST = BigInt(0x1000);
export const CHANNEL_MANAGE = BigInt(0x2000);
export const AGENT_ROLE_LIST = BigInt(0x4000);
export const AGENT_ROLE_MANAGE = BigInt(0x8000);
export const ORG_MANAGE = BigInt(0x10000);

export const defaultRoles = [
  {
    name: 'Everyone',
    permissions:
      TICKET_LIST |
      TICKET_DETAIL |
      TICKET_CLOSE |
      TICKET_MESSAGE_LIST |
      TICKET_MESSAGE_SEND |
      AGENT_LIST |
      TEAM_LIST |
      AGENT_TEAM_LIST,
    isDefault: true,
  },
  {
    name: 'Admin',
    permissions:
      AGENT_MANAGE |
      TEAM_MANAGE |
      AGENT_TEAM_MANAGE |
      CHANNEL_LIST |
      CHANNEL_MANAGE,
  },
];
