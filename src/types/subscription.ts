export type SubscriptionStatus = 'Active' | 'Unsubscribed' | 'Bounced';
export type SubscriptionSource =
  | 'Homepage Footer'
  | 'E-book Landing'
  | 'Checkout Opt-in'
  | 'Webinar Registration'
  | 'Exit Intent Popup'
  | 'Manual';

export interface ISubscription {
  _id: string;
  name: string;
  email: string;
  source: SubscriptionSource;
  tags: string[];
  status: SubscriptionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ISubscriptionStats {
  total: number;
  active: number;
  unsubscribed: number;
  bounced: number;
  newToday: number;
}

export interface ListSubscriptionsResponse {
  success: boolean;
  data: {
    items: ISubscription[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetSubscriptionStatsResponse {
  success: boolean;
  data: ISubscriptionStats;
}

export interface GetSubscriptionResponse {
  success: boolean;
  data: ISubscription;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  data: ISubscription;
  message?: string;
}
