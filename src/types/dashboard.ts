import { IEnquiry } from "./enquiry";

import { IProject } from "./project";

export interface IDashboardMetrics {
  totalEnquiries: number;
  convertedSales: number;
  pendingFollowups: number;
  outstandingPayments: number;
  funnel: {
    new: number;
    followup: number;
    quotationSent: number;
    converted: number;
    rejected: number;
  };
  activeProjects: IProject[];
}

export interface DashboardMetricsResponse {
  success: boolean;
  message: string;
  data: IDashboardMetrics;
}

export interface RecentEnquiriesResponse {
  success: boolean;
  message: string;
  data: IEnquiry[];
}
