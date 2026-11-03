import { apiSlice } from './apiSlice'
import { QUOTATION_URL } from '../constants'
import { IQuotation } from '@/types/quotation'

const quotationSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    listQuotations: builder.query<any, {page?: number, limit?: number, search?: string, enquiryId?: string}>({
      query: ({page = 1, limit = 20, search, enquiryId}) => ({
        url: QUOTATION_URL,
        method: 'GET',
        params: { page, limit, search, enquiryId }
      }),
      providesTags: ['Quotation']
    }),

    getQuotation: builder.query<IQuotation, string>({
      query: (id) => `${QUOTATION_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Quotation', id }]
    }),

    createQuotation: builder.mutation<IQuotation, Partial<IQuotation>>({
      query: (data) => ({
        url: QUOTATION_URL,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Quotation']
    }),

    updateQuotation: builder.mutation<IQuotation, {id: string, data: Partial<IQuotation>}>({
      query: ({id, data}) => ({
        url: `${QUOTATION_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => ['Quotation', { type: 'Quotation', id }]
    }),

    deleteQuotation: builder.mutation<any, string>({
      query: (id) => ({
        url: `${QUOTATION_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Quotation']
    }),
    
  }),
});

export const {
  useListQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation
} = quotationSlice;
