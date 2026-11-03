import { apiSlice } from './apiSlice'
import { ENQUIRY_URL } from '../constants'
import { IEnquiry, listEnquiriesResponse } from '@/types/enquiry'

const enquirySlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    listEnquiries: builder.query<listEnquiriesResponse, {page?: number, limit?: number, search?: string, status?: string, type?: 'Normal' | 'Sales'}>({
      query: ({page = 1, limit = 20, search, status, type}) => ({
        url: ENQUIRY_URL,
        method: 'GET',
        params: { page, limit, search, status, type }
      }),
      providesTags: ['Enquiry']
    }),

    createEnquiry: builder.mutation<IEnquiry, Partial<IEnquiry>>({
      query: (data) => ({
        url: ENQUIRY_URL,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Enquiry']
    }),

    updateEnquiry: builder.mutation<IEnquiry, {id: string, data: Partial<IEnquiry>}>({
      query: ({id, data}) => ({
        url: `${ENQUIRY_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: ['Enquiry']
    }),

    deleteEnquiry: builder.mutation<any, string>({
      query: (id) => ({
        url: `${ENQUIRY_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Enquiry']
    }),
    
  }),
});

export const {
  useListEnquiriesQuery,
  useCreateEnquiryMutation,
  useUpdateEnquiryMutation,
  useDeleteEnquiryMutation,
} = enquirySlice;

