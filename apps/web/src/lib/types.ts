/** Response shapes mirrored from the API serializers. Keep them aligned with
 * the route schemas in `apps/api/src/routes/` until `@maria/contracts` exists. */

export type Contact = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  companyId: string | null;
  createdAt: string;
};

export type Company = {
  id: string;
  name: string;
  createdAt: string;
};

export type Pipeline = {
  id: string;
  name: string;
  position: string;
  createdAt: string;
};

export type Stage = {
  id: string;
  pipelineId: string;
  name: string;
  position: string;
  createdAt: string;
};

export type Deal = {
  id: string;
  pipelineId: string;
  stageId: string;
  title: string;
  valueCents: number | null;
  contactId: string | null;
  companyId: string | null;
  position: string;
  createdAt: string;
};

export type EntityDeal = {
  id: string;
  title: string;
  valueCents: number | null;
  stageName: string;
  pipelineName: string;
  contactName: string | null;
  companyName: string | null;
  createdAt: string;
};

export type DealDetail = Deal & EntityDeal;

export type Tag = {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
};

export type AttributeEntityType = "contact" | "company" | "deal";

export type AttributeType = "text" | "number" | "date" | "boolean" | "select";

export type AttributeValue = string | number | boolean | null;

export type AttributeDefinition = {
  id: string;
  entityType: AttributeEntityType;
  key: string;
  label: string;
  type: AttributeType;
  options: string[] | null;
  createdAt: string;
  updatedAt: string;
};

export type EntityAttribute = AttributeDefinition & {
  value: AttributeValue;
};

export type Note = {
  id: string;
  body: string;
  authorName: string | null;
  createdAt: string;
};

export type Task = {
  id: string;
  title: string;
  dueAt: string | null;
  doneAt: string | null;
  assigneeName: string | null;
  createdAt: string;
};

export type Conversation = {
  id: string;
  workspaceId: string;
  channelInstanceId: string;
  contactId: string | null;
  contactName: string | null;
  providerThreadId: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedAt: string | null;
  epoch: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationAssignment = {
  id: string;
  conversationId: string;
  assignedUserId: string | null;
  assignedUserName: string | null;
  assignedBy: string | null;
  assignedByName: string | null;
  createdAt: string;
};

export type Message = {
  id: string;
  workspaceId: string;
  conversationId: string;
  providerMessageId: string | null;
  direction: string;
  status: string;
  contentType: string;
  body: string | null;
  hasMedia: boolean;
  mediaMime: string | null;
  mediaFilename: string | null;
  createdAt: string;
};

export type ChannelInstance = {
  id: string;
  provider: string;
  providerInstanceId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  id: string;
  userId: string;
  role: "viewer" | "agent" | "manager" | "admin";
  email: string;
  name: string;
};

export type Invitation = {
  id: string;
  email: string;
  role: "viewer" | "agent" | "manager" | "admin";
  expiresAt: string;
  createdAt: string;
};

export type InvitationPreview = {
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: "viewer" | "agent" | "manager" | "admin";
  expiresAt: string;
};
