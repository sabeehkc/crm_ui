import { apiSlice } from './apiSlice';
import { FORM_URL } from '../constants';
import { IFormEndpoint, IFormSubmission } from '@/types/form';

export const formApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listForms: builder.query<{ success: boolean; data: { items: IFormEndpoint[]; total: number; page: number; limit: number; totalPages: number } }, { page?: number; limit?: number; search?: string; isShareForm?: boolean }>({
      query: (params) => ({
        url: FORM_URL,
        params,
      }),
      providesTags: ['Form'],
    }),

    getForm: builder.query<{ success: boolean; data: IFormEndpoint }, string>({
      query: (id) => `${FORM_URL}/${id}`,
      providesTags: (result, error, arg) => [{ type: 'Form', id: arg }],
    }),

    createForm: builder.mutation<{ success: boolean; data: IFormEndpoint }, Partial<IFormEndpoint>>({
      query: (data) => ({
        url: FORM_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Form'],
    }),

    updateForm: builder.mutation<{ success: boolean; data: IFormEndpoint }, { id: string; data: Partial<IFormEndpoint> }>({
      query: ({ id, data }) => ({
        url: `${FORM_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Form', id: arg.id }, 'Form'],
    }),

    updateFormStatus: builder.mutation<{ success: boolean }, { id: string; status: 'Active' | 'Inactive' }>({
      query: ({ id, status }) => ({
        url: `${FORM_URL}/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Form', id: arg.id }, 'Form'],
    }),

    regenerateFormKey: builder.mutation<{ success: boolean; data: { accessKey: string } }, string>({
      query: (id) => ({
        url: `${FORM_URL}/${id}/regenerate-key`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Form', id: arg }],
    }),

    deleteForm: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${FORM_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Form'],
    }),

    // Submissions
    listSubmissions: builder.query<{ success: boolean; data: { items: IFormSubmission[]; total: number } }, { id: string; page?: number; limit?: number }>({
      query: ({ id, ...params }) => ({
        url: `${FORM_URL}/${id}/submissions`,
        params,
      }),
      providesTags: ['Submission'],
    }),

    updateSubmissionStatus: builder.mutation<{ success: boolean }, { id: string; subId: string; status: string }>({
      query: ({ id, subId, status }) => ({
        url: `${FORM_URL}/${id}/submissions/${subId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Submission'],
    }),

    deleteSubmission: builder.mutation<{ success: boolean }, { id: string; subId: string }>({
      query: ({ id, subId }) => ({
        url: `${FORM_URL}/${id}/submissions/${subId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Submission'],
    }),
  }),
});

export const {
  useListFormsQuery,
  useGetFormQuery,
  useCreateFormMutation,
  useUpdateFormMutation,
  useUpdateFormStatusMutation,
  useRegenerateFormKeyMutation,
  useDeleteFormMutation,
  useListSubmissionsQuery,
  useUpdateSubmissionStatusMutation,
  useDeleteSubmissionMutation,
} = formApiSlice;
