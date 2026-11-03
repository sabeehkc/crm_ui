import { apiSlice } from './apiSlice';
import { UI_MANAGER_URL } from '../constants';

export const websiteContentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Websites
    getWebsites: builder.query<any, void>({
      query: () => `${UI_MANAGER_URL}/websites`,
      providesTags: ['WebsiteContent'],
    }),
    createWebsite: builder.mutation<any, { name: string; domain?: string }>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/websites`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateWebsite: builder.mutation<any, { id: string; data: { name: string; domain?: string } }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/websites/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteWebsite: builder.mutation<any, string>({
      query: (id) => ({
        url: `${UI_MANAGER_URL}/websites/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    getWebsiteContent: builder.query<any, { tab?: string; websiteId?: string | null } | void>({
      query: (params) => {
        let url = UI_MANAGER_URL;
        const q = new URLSearchParams();
        if (params?.tab) q.append('tab', params.tab);
        if (params?.websiteId) q.append('websiteId', params.websiteId);
        return q.toString() ? url + '?' + q.toString() : url;
      },
      providesTags: ['WebsiteContent'],
    }),
    updateHero: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/hero`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    // About Us
    addAboutUs: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/about-us`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateAboutUs: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/about-us/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteAboutUs: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/about-us/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    toggleAboutUs: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/about-us/${id}/toggle${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    
    // Products
    addProduct: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/products`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateProduct: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteProduct: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/products/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    toggleProduct: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/products/${id}/toggle${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    // Clients
    addClient: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/clients`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateClient: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/clients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteClient: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/clients/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    // Directors (Part of AboutUs)
    addDirector: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/directors`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateDirector: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/directors/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteDirector: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/directors/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    // News
    addNews: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/news`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateNews: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/news/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteNews: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/news/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    togglePublishNews: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/news/${id}/toggle-publish${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    // Tools
    addTool: builder.mutation<any, FormData>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/tools`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateTool: builder.mutation<any, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/tools/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteTool: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/tools/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),

    // FAQ
    addFaq: builder.mutation<any, Partial<{ question: string, answer: string, isLive: boolean, displayOrder: number, websiteId?: string | null }>>({
      query: (data) => ({
        url: `${UI_MANAGER_URL}/faq`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    updateFaq: builder.mutation<any, { id: string; data: Partial<{ question: string, answer: string, isLive: boolean, displayOrder: number, websiteId?: string | null }> }>({
      query: ({ id, data }) => ({
        url: `${UI_MANAGER_URL}/faq/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    deleteFaq: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/faq/${id}${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
    toggleFaq: builder.mutation<any, { id: string; websiteId?: string | null }>({
      query: ({ id, websiteId }) => ({
        url: `${UI_MANAGER_URL}/faq/${id}/toggle${websiteId ? `?websiteId=${websiteId}` : ''}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['WebsiteContent'],
    }),
  }),
  overrideExisting: false,
});

export const {
    useGetWebsitesQuery,
  useCreateWebsiteMutation,
  useUpdateWebsiteMutation,
  useDeleteWebsiteMutation,
  useGetWebsiteContentQuery,
  useUpdateHeroMutation,
  useAddAboutUsMutation,
  useUpdateAboutUsMutation,
  useDeleteAboutUsMutation,
  useToggleAboutUsMutation,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleProductMutation,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useAddDirectorMutation,
  useUpdateDirectorMutation,
  useDeleteDirectorMutation,
  useAddNewsMutation,
  useUpdateNewsMutation,
  useDeleteNewsMutation,
  useTogglePublishNewsMutation,
  useAddToolMutation,
  useUpdateToolMutation,
  useDeleteToolMutation,
  useAddFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useToggleFaqMutation,
} = websiteContentApi;
