export interface IFormEndpoint {
  _id: string;
  name: string;
  domain: string;
  notificationEmails: string[];
  accessKey: string;
  status: 'Active' | 'Inactive';
  redirectUrl?: string;
  successMessage: string;
  senderName: string;
  replyToHeader: string;
  subjectTemplate: string;
  recaptchaEnabled: boolean;
  honeypotEnabled: boolean;
  domainLocking: boolean;
  rateLimit: number;
  integrations: {
    slack: { enabled: boolean; webhookUrl?: string };
    discord: { enabled: boolean; webhookUrl?: string };
    telegram: { enabled: boolean; botToken?: string; chatId?: string };
    webhooks: { enabled: boolean; urls: string[] };
  };
  slug?: string;
  description?: string;
  fields?: Array<{
    id: string;
    name: string;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'number' | 'checkbox' | 'radio' | 'select' | 'rating' | 'date' | 'time' | 'page_break' | 'file';
    required: boolean;
    options?: string[];
  }>;
  totalSubmissions: number;
  spamBlocked: number;
  isShareForm?: boolean;
  lastSubmission?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type SubmissionStatus = 'Read' | 'Unread' | 'Spam';

export interface IFormSubmission {
  _id: string;
  formId: string;
  name: string;
  email: string;
  message?: string;
  data: Record<string, any>;
  status: SubmissionStatus;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}
