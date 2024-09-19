import { Kysely } from 'kysely';
import { Agent, AgentAuth, AgentSession, AuthType } from './model';

interface Tables {
  agent: Agent;
  agentAuth: AgentAuth;
  agentSession: AgentSession;
  authType: AuthType;
}

export class Database extends Kysely<Tables> {}
