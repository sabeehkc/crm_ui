export interface IForm {
  id: string;
  name: string;
  domain: string;
  accessEmail: string;
  totalSubmissions: number;
  spamBlocked: number;
  successRate: number;
  lastSubmission: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
  apiKey: string;
}

export interface ISubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'Read' | 'Unread' | 'Spam';
  submittedAt: string;
}

export const mockForms: IForm[] = [
  {
    id: 'frm_01hq29v',
    name: 'Contact Us Form',
    domain: 'example.com',
    accessEmail: 'admin@example.com',
    totalSubmissions: 254,
    spamBlocked: 12,
    successRate: 98,
    lastSubmission: '2026-05-11T10:30:00Z',
    createdDate: '2026-01-15T08:00:00Z',
    status: 'Active',
    apiKey: 'uts_sk_live_832fha9df7q23e4r8fh3498'
  },
  {
    id: 'frm_01hq34a',
    name: 'Newsletter Signup',
    domain: 'marketing.site.io',
    accessEmail: 'marketing@site.io',
    totalSubmissions: 1420,
    spamBlocked: 45,
    successRate: 99.5,
    lastSubmission: '2026-05-11T12:45:00Z',
    createdDate: '2026-01-20T09:30:00Z',
    status: 'Active',
    apiKey: 'uts_sk_live_129fjkal98dfa23r91d'
  },
  {
    id: 'frm_01hq56b',
    name: 'Beta Request',
    domain: 'beta.app.dev',
    accessEmail: 'support@app.dev',
    totalSubmissions: 89,
    spamBlocked: 2,
    successRate: 97,
    lastSubmission: '2026-05-09T14:20:00Z',
    createdDate: '2026-02-01T10:00:00Z',
    status: 'Inactive',
    apiKey: 'uts_sk_live_723hdnakj2093rnalksd'
  },
  {
    id: 'frm_01hq78c',
    name: 'Customer Feedback',
    domain: 'portal.biz.com',
    accessEmail: 'feedback@biz.com',
    totalSubmissions: 412,
    spamBlocked: 18,
    successRate: 95.5,
    lastSubmission: '2026-05-11T08:15:00Z',
    createdDate: '2026-03-05T11:15:00Z',
    status: 'Active',
    apiKey: 'uts_sk_live_429dhkjsn1023e9rjnas'
  }
];

export const mockSubmissions: ISubmission[] = [
  {
    id: 'sub_001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    message: 'I would like to request a quote for your enterprise plan. Looking forward to hearing from you.',
    status: 'Read',
    submittedAt: '2026-05-11T12:30:00Z'
  },
  {
    id: 'sub_002',
    name: 'Jane Smith',
    email: 'jane@designagency.com',
    message: 'Great product! Had a quick question about your API rate limits. Can you guide me?',
    status: 'Unread',
    submittedAt: '2026-05-11T11:15:00Z'
  },
  {
    id: 'sub_003',
    name: 'Buy Cheap Rolex',
    email: 'spammer@spammail.net',
    message: 'Special offer just for today, cheap items for you my friend.',
    status: 'Spam',
    submittedAt: '2026-05-11T10:45:00Z'
  },
  {
    id: 'sub_004',
    name: 'Michael Johnson',
    email: 'mjohnson@techcorp.org',
    message: 'We are having an issue integrating the react components. Do you have any specific documentation for version 18?',
    status: 'Read',
    submittedAt: '2026-05-10T16:40:00Z'
  },
  {
    id: 'sub_005',
    name: 'Sarah Connor',
    email: 'sconnor@future.net',
    message: 'Save the date for tomorrow\'s meeting.',
    status: 'Read',
    submittedAt: '2026-05-10T09:20:00Z'
  }
];
