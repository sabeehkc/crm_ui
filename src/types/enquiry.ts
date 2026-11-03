export type EnquiryStatus =
  | "New"
  | "Followup"
  | "Quotation Sent"
  | "Converted"
  | "Rejected"
  | "Revised Quotation";

export interface IEnquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: Date;
  status: EnquiryStatus;
  type: 'Normal' | 'Sales';
  notes?: string;
  followupDate?: Date;
  followupTime?: string;
  quotationSentDate?: Date;
  convertedDate?: Date;
  rejectedDate?: Date;
  rejectReason?: string;
  revisedQuotationDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface listEnquiriesResponse {
  success: boolean;
  message: string;
  data: {
    items: IEnquiry[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
