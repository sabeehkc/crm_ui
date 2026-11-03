import { apiSlice } from './apiSlice'
import { EXPENSE_URL } from '../constants'
import { IExpense, IExpenseSummary } from '@/types/expense'

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

const expenseSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getExpenseSummary: builder.query<{success: boolean, data: IExpenseSummary}, void>({
      query: () => `${EXPENSE_URL}/summary`,
      providesTags: ['Expense']
    }),

    listExpenses: builder.query<listResponse<IExpense>, {page?: number, limit?: number, category?: string, search?: string, startDate?: string, endDate?: string}>({
      query: (params) => ({
        url: EXPENSE_URL,
        params,
      }),
      providesTags: ['Expense']
    }),

    createExpense: builder.mutation<{success: boolean, data: IExpense}, FormData | Partial<IExpense>>({
      query: (data) => ({
        url: EXPENSE_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Expense']
    }),

    updateExpense: builder.mutation<{success: boolean, data: IExpense}, {id: string, data: FormData | Partial<IExpense>}>({
      query: ({ id, data }) => ({
        url: `${EXPENSE_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Expense']
    }),

    deleteExpense: builder.mutation<{success: boolean}, string>({
      query: (id) => ({
        url: `${EXPENSE_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Expense']
    }),

  })
})

export const {
  useGetExpenseSummaryQuery,
  useListExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseSlice
