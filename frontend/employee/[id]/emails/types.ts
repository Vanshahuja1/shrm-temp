export type Email = {
  _id?: number;
  type?: "member_crud" | "increment" | "decrement" | "penalty" | "general";
  recipient?: string;
  recipients?: string[];
  cc?: string[];
  sender?: string;
  senderId?: string; // ID of the sender
  senderName?: string; // Name of the sender
  recipientId?: string; // ID of the recipient
  recipientIds?: string[];
  recipientName?: string; // Name of the recipient
  ccIds?: string[];
  subject?: string;
  message?: string;
  sentAt?: string;
  status?: "sent" | "pending" | "failed" | "draft";
  isRead?: boolean;
  isStarred?: boolean;
  attachments?: string[];
  recipientEmail?: string; // Optional for "other" recipient
  recipientEmails?: string[]; // Optional for multiple "other" recipients
  ccEmails?: string[]; // Optional for "other" CC recipients
};
