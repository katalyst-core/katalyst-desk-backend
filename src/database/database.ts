import { Kysely } from 'kysely';
import { Team } from './model/Team';
import { Agent } from './model/Agent';
import { Ticket } from './model/Ticket';
import { AuthType } from './model/AuthType';
import { TeamAgent } from './model/TeamAgent';
import { AgentAuth } from './model/AgentAuth';
import { ChannelType } from './model/ChannelType';
import { ContactType } from './model/ContactType';
import { AgentSession } from './model/AgentSession';
import { TicketStatus } from './model/TicketStatus';
import { Organization } from './model/Organization';
import { TicketMessage } from './model/TicketMessage';
import { MessageStatus } from './model/MessageStatus';
import { TicketCustomer } from './model/TicketCustomer';
import { OrganizationAgent } from './model/OrganizationAgent';
import { OrganizationChannel } from './model/OrganizationChannel';

interface Tables {
  team: Team;
  agent: Agent;
  ticket: Ticket;
  authType: AuthType;
  teamAgent: TeamAgent;
  agentAuth: AgentAuth;
  contactType: ContactType;
  channelType: ChannelType;
  ticketStatus: TicketStatus;
  agentSession: AgentSession;
  organization: Organization;
  ticketMessage: TicketMessage;
  messageStatus: MessageStatus;
  ticketCustomer: TicketCustomer;
  organizationAgent: OrganizationAgent;
  organizationChannel: OrganizationChannel;
}

export class Database extends Kysely<Tables> {}
