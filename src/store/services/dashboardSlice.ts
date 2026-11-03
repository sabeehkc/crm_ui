import { apiSlice } from './apiSlice'
import { DASHBOARD_URL } from '../constants'
import { DashboardMetricsResponse, RecentEnquiriesResponse } from '@/types/dashboard'

export const dashboardSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMetrics: builder.query<DashboardMetricsResponse, void>({
      query: () => ({
        url: DASHBOARD_URL,
        method: 'GET',
      }),
      providesTags: ['Enquiry', 'Invoice'] // Assuming Invoice tag exists or will be needed
    }),
    getRecentEnquiries: builder.query<RecentEnquiriesResponse, void>({
      query: () => ({
        url: `${DASHBOARD_URL}/enquiries`,
        method: 'GET',
      }),
      providesTags: ['Enquiry']
    }),
  }),
});

export const {
  useGetDashboardMetricsQuery,
  useGetRecentEnquiriesQuery,
} = dashboardSlice;
