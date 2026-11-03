import { apiSlice } from './apiSlice'
import { PAYMENT_URL } from '../constants'
import { IPaymentOverviewItem, IInvoice, ITransaction } from '@/types/transaction'

interface listResponse<T> {
  success: boolean
  data: {
    items: T[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

const transactionSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getPaymentOverview: builder.query<{success: boolean, data: IPaymentOverviewItem[]}, void>({
      query: () => `${PAYMENT_URL}/overview`,
      providesTags: ['Payment', 'Invoice']
    }),

    listTransactions: builder.query<listResponse<ITransaction>, {page?: number, limit?: number, projectId?: string, startDate?: string, endDate?: string}>({
      query: (params) => ({
        url: PAYMENT_URL,
        params,
      }),
      providesTags: ['Payment']
    }),

    createTransaction: builder.mutation<{success: boolean, data: ITransaction}, FormData | Partial<ITransaction>>({
      query: (data) => ({
        url: PAYMENT_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Invoice']
    }),

    deleteTransaction: builder.mutation<{success: boolean}, string>({
      query: (id) => ({
        url: `${PAYMENT_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Payment', 'Invoice']
    }),

    // Invoices
    listInvoices: builder.query<listResponse<IInvoice>, {page?: number, limit?: number, projectId?: string, status?: string}>({
      query: (params) => ({
        url: `${PAYMENT_URL}/invoices`,
        params,
      }),
      providesTags: ['Invoice']
    }),

    createInvoice: builder.mutation<{success: boolean, data: IInvoice}, Partial<IInvoice>>({
      query: (data) => ({
        url: `${PAYMENT_URL}/invoices`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Invoice']
    }),

    updateInvoiceReceivedAmount: builder.mutation<{success: boolean, data: IInvoice}, {id: string, receivedAmount: number}>({
      query: ({ id, ...body }) => ({
        url: `${PAYMENT_URL}/invoices/${id}/received`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Invoice']
    })

  }),
  
})

export const {
  useGetPaymentOverviewQuery,
  useListTransactionsQuery,
  useCreateTransactionMutation,
  useDeleteTransactionMutation,
  useListInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceReceivedAmountMutation,
} = transactionSlice
