import { UUID } from 'crypto';

export interface AgentAccessJWT {
  sub: string;
}

export interface AgentRefreshJWT {
  sub: string;
  session_id: string;
}

export interface AgentAccess {
  agentId: UUID;
}

export interface AgentRefresh {
  agentId: UUID;
  sessionId: UUID;
}

export interface AgentBasicAuth {
  agentId: UUID;
}
