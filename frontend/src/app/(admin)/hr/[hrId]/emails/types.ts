export type Email = {
  _id?: number;
  type?: "member_crud" | "increment" | "decrement" | "penalty" | "general";
  recipient?: string;
  recipients?: string[];
  cc?: string[];
  sender?: string;
  senderId?: string;
  senderName?: string;
  recipientId?: string;
  recipientIds?: string[];
  recipientName?: string;
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
