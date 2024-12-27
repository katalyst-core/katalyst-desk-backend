import { Kysely } from 'kysely';
import { Team } from './model/Team';
import { Role } from './model/Role';
import { Agent } from './model/Agent';
import { Ticket } from './model/Ticket';
import { Channel } from './model/Channel';
import { AuthType } from './model/AuthType';
import { AgentTeam } from './model/AgentTeam';
import { AgentRole } from './model/AgentRole';
import { AgentAuth } from './model/AgentAuth';
import { TicketTeam } from './model/TicketTeam';
import { ChannelType } from './model/ChannelType';
import { TicketStatus } from './model/TicketStatus';
import { AgentSession } from './model/AgentSession';
import { Organization } from './model/Organization';
import { TicketMessage } from './model/TicketMessage';
import { MessageStatus } from './model/MessageStatus';
import { MasterCustomer } from './model/MasterCustomer';
import { ChannelCustomer } from './model/ChannelCustomer';
import { ChannelEventLog } from './model/ChannelEventLog';
import { OrganizationAgent } from './model/OrganizationAgent';

interface Tables {
  team: Team;
  role: Role;
  agent: Agent;
  ticket: Ticket;
  channel: Channel;
  authType: AuthType;
  agentTeam: AgentTeam;
  agentRole: AgentRole;
  agentAuth: AgentAuth;
  ticketTeam: TicketTeam;
  channelType: ChannelType;
  ticketStatus: TicketStatus;
  agentSession: AgentSession;
  organization: Organization;
  ticketMessage: TicketMessage;
  messageStatus: MessageStatus;
  masterCustomer: MasterCustomer;
  channelCustomer: ChannelCustomer;
  channelEventLog: ChannelEventLog;
  organizationAgent: OrganizationAgent;
}

export class Database extends Kysely<Tables> {}
