import { apiSlice } from './apiSlice'
import { USER_URL } from '../constants'
import { IUser } from '@/types/user'

interface PaginatedUsersResponse {
  success: boolean;
  data: {
    items: IUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}

const userSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, { page?: number, limit?: number, role?: string, search?: string }>({
      query: (params) => ({
        url: `${USER_URL}`,
        params
      }),
      providesTags: ['User']
    }),
    
    createUser: builder.mutation<{success: boolean, data: IUser}, Partial<IUser>>({
      query: (body) => ({
        url: `${USER_URL}`,
        method: 'POST',
        body
      }),
      invalidatesTags: ['User']
    }),
    
    updateUser: builder.mutation<{success: boolean, data: IUser}, {id: string, body: Partial<IUser>}>({
      query: ({id, body}) => ({
        url: `${USER_URL}/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['User']
    }),
    
    toggleUserStatus: builder.mutation<{success: boolean, data: {isActive: boolean}}, string>({
      query: (id) => ({
        url: `${USER_URL}/${id}/status`,
        method: 'PATCH'
      }),
      invalidatesTags: ['User']
    }),
    
    deleteUser: builder.mutation<{success: boolean}, string>({
      query: (id) => ({
        url: `${USER_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['User']
    }),
    
    forceLogoutUser: builder.mutation<{success: boolean}, string>({
      query: (id) => ({
        url: `${USER_URL}/${id}/force-logout`,
        method: 'POST'
      }),
      invalidatesTags: ['User']
    })
  })
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useForceLogoutUserMutation
} = userSlice;
