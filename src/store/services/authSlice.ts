import { apiSlice } from './apiSlice';
import { AUTH_URL } from '../constants';
import { setCredentials, logOut, updateTokens } from '../slices/authSlice';
import { IUser } from '@/types/user';

interface loginResponse {
  success: boolean;
  message: string;
  data: {
    user: IUser;
    accessToken: string;
    refreshToken: string;
  };
}

interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<loginResponse, Partial<IUser> & { companyName?: string }>({
        query: (data) => ({
            url: `${AUTH_URL}/register`,
            method: 'POST',
            body: data,
        }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled
                if (data.success && data.data) {
                    const { user, accessToken, refreshToken } = data.data
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', accessToken)
                        localStorage.setItem('refreshToken', refreshToken)
                        localStorage.setItem('user', JSON.stringify(user))
                    }
                    dispatch(setCredentials({ user, accessToken, refreshToken }))
                }
            } catch (error) {
                console.error('Registration failed:', error)
            }
        }
    }),

    login: builder.mutation<loginResponse, Partial<IUser>>({
        query: (data) => ({
            url: `${AUTH_URL}/login`,
            method: 'POST',
            body: data,
        }),
        async onQueryStarted(arg, { dispatch, queryFulfilled }) {
            try {
                const { data } = await queryFulfilled
                if (data.success && data.data) {
                    const { user, accessToken, refreshToken } = data.data
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('accessToken', accessToken)
                        localStorage.setItem('refreshToken', refreshToken)
                        localStorage.setItem('user', JSON.stringify(user))
                    }
                    dispatch(setCredentials({ user, accessToken, refreshToken }))
                }
            } catch (error) {
                console.error('Login failed:', error)
            }
        }
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: `${AUTH_URL}/refresh-token`,
        method: 'POST',
        body: {
          refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled

          if (data.success && data.data) {
            // Update both tokens in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('accessToken', data.data.accessToken);
              localStorage.setItem('refreshToken', data.data.refreshToken);
            }
            dispatch(updateTokens({ accessToken: data.data.accessToken, refreshToken: data.data.refreshToken }))
          }
        } catch (error) {
          // Handle error - clear all auth data if refresh fails
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
          }
          dispatch(logOut())

          console.error('Token refresh failed:', error)
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: `${AUTH_URL}/logout`,
        method: 'POST',
        headers: {
          ...(typeof window !== 'undefined' && localStorage.getItem('refreshToken')
            ? { 'x-refresh-token': localStorage.getItem('refreshToken') || '' }
            : {}),
        },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled

          // Clear all auth data from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
          dispatch(logOut())
        } catch (error) {
          // Even if logout fails, clear local data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
          }
          dispatch(logOut())

          console.error('Logout failed:', error)
        }
      },
    }),
  }),
});

export const {
    useRegisterMutation,
    useLoginMutation,
    useRefreshTokenMutation,
    useLogoutMutation,
 } = authSlice;
