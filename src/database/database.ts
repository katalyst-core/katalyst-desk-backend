import { Kysely } from 'kysely';
import { Team } from './model/Team';
import { Agent } from './model/Agent';
import { Ticket } from './model/Ticket';
import { Channel } from './model/Channel';
import { AuthType } from './model/AuthType';
import { TeamAgent } from './model/TeamAgent';
import { AgentAuth } from './model/AgentAuth';
import { ChannelAuth } from './model/ChannelAuth';
import { ChannelType } from './model/ChannelType';
import { AgentSession } from './model/AgentSession';
import { TicketStatus } from './model/TicketStatus';
import { Organization } from './model/Organization';
import { TicketMessage } from './model/TicketMessage';
import { MessageStatus } from './model/MessageStatus';
import { MasterCustomer } from './model/MasterCustomer';
import { ChannelCustomer } from './model/ChannelCustomer';
import { OrganizationAgent } from './model/OrganizationAgent';

interface Tables {
  team: Team;
  agent: Agent;
  ticket: Ticket;
  channel: Channel;
  authType: AuthType;
  teamAgent: TeamAgent;
  agentAuth: AgentAuth;
  channelAuth: ChannelAuth;
  channelType: ChannelType;
  ticketStatus: TicketStatus;
  agentSession: AgentSession;
  organization: Organization;
  ticketMessage: TicketMessage;
  messageStatus: MessageStatus;
  masterCustomer: MasterCustomer;
  channelCustomer: ChannelCustomer;
  organizationAgent: OrganizationAgent;
}

export class Database extends Kysely<Tables> {}
