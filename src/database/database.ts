import { Kysely } from 'kysely';
import {
  Agent,
  AgentAuth,
  AgentSession,
  AuthType,
  Organization,
  OrganizationAgent,
} from './model';

interface Tables {
  agent: Agent;
  agentAuth: AgentAuth;
  agentSession: AgentSession;
  authType: AuthType;
  organization: Organization;
  organizationAgent: OrganizationAgent;
}

export class Database extends Kysely<Tables> {}
