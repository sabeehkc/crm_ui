import { apiSlice } from './apiSlice';
import { SUBSCRIPTIONS_URL } from '../constants';
import {
  ListSubscriptionsResponse,
  GetSubscriptionStatsResponse,
  GetSubscriptionResponse,
  CreateSubscriptionResponse,
  ISubscription,
  SubscriptionStatus,
} from '@/types/subscription';

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listSubscriptions: builder.query<ListSubscriptionsResponse, { page?: number; limit?: number; search?: string; status?: string }>({
      query: (params) => ({
        url: SUBSCRIPTIONS_URL,
        method: 'GET',
        params,
      }),
      providesTags: ['Subscription'],
    }),

    getSubscriptionStats: builder.query<GetSubscriptionStatsResponse, void>({
      query: () => `${SUBSCRIPTIONS_URL}/stats`,
      providesTags: ['SubscriptionStats'],
    }),

    getSubscriptionDetails: builder.query<GetSubscriptionResponse, string>({
      query: (id) => `${SUBSCRIPTIONS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Subscription', id }],
    }),

    createSubscription: builder.mutation<CreateSubscriptionResponse, Partial<ISubscription>>({
      query: (data) => ({
        url: SUBSCRIPTIONS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),

    updateSubscriptionStatus: builder.mutation<{ success: boolean; data: ISubscription }, { id: string; status: SubscriptionStatus }>({
      query: ({ id, status }) => ({
        url: `${SUBSCRIPTIONS_URL}/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => ['Subscription', { type: 'Subscription', id }, 'SubscriptionStats'],
    }),

    deleteSubscription: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `${SUBSCRIPTIONS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscription', 'SubscriptionStats'],
    }),
  }),
});

export const {
  useListSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useGetSubscriptionDetailsQuery,
  useCreateSubscriptionMutation,
  useUpdateSubscriptionStatusMutation,
  useDeleteSubscriptionMutation,
} = subscriptionApi;
