export interface ILineItem {
  desc: string;
  qty: number;
  rate: number;
  amount?: number; // virtual
}

export interface ITimelineItem {
  title: string;
  description: string;
  duration: string;
  amount: number;
}

export interface IFeatureItem {
  module: string;
  user: string;
  feature: string;
}

export interface IQuotation {
  _id?: string;
  enquiryId?: string;
  referenceNumber?: string;
  lineItems: ILineItem[];
  welcomeTitle?: string;
  salutation?: string;
  projectOverview?: string;
  coreObjective?: string;
  features?: IFeatureItem[];
  thanksNote?: string;
  closingNote?: string;
  signatureName?: string;
  signatureRole?: string;
  termsPoints?: string[];
  terms?: string;
  timelineItems: ITimelineItem[];
  companyDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
  clientDetails: {
    name: string;
    company: string;
    email: string;
  };
  quoteMeta: {
    date: string;
    validFor: string;
    ref: string;
  };
  gstPercent: number;
  subtotal?: number; // virtual
  gstAmount?: number; // virtual
  totalAmount?: number; // virtual
  status?: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Revised';
  revisionNumber?: number;
  parentQuotationId?: string;
  revisionNotes?: string;
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
