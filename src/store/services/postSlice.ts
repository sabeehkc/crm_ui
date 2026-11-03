import { apiSlice } from './apiSlice';
import { POSTS_URL } from '../constants';
import {
  ListPostsResponse,
  GetPostStatsResponse,
  GetPostResponse,
  CreatePostResponse,
  UpdatePostResponse,
  IPost,
  PostStatus,
} from '@/types/post';

export const postApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listPosts: builder.query<ListPostsResponse, { page?: number; limit?: number; search?: string; status?: string; category?: string }>({
      query: (params) => ({
        url: POSTS_URL,
        method: 'GET',
        params,
      }),
      providesTags: ['Post'],
    }),

    getPostStats: builder.query<GetPostStatsResponse, void>({
      query: () => `${POSTS_URL}/stats`,
      providesTags: ['PostStats'],
    }),

    getPostDetails: builder.query<GetPostResponse, string>({
      query: (id) => `${POSTS_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    createPost: builder.mutation<CreatePostResponse, Partial<IPost> | FormData>({
      query: (data) => ({
        url: POSTS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Post', 'PostStats'],
    }),

    updatePost: builder.mutation<UpdatePostResponse, { id: string; data: Partial<IPost> | FormData }>({
      query: ({ id, data }) => ({
        url: `${POSTS_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => ['Post', { type: 'Post', id }, 'PostStats'],
    }),

    updatePostStatus: builder.mutation<{ success: boolean; data: IPost }, { id: string; status: PostStatus }>({
      query: ({ id, status }) => ({
        url: `${POSTS_URL}/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => ['Post', { type: 'Post', id }, 'PostStats'],
    }),

    incrementViews: builder.mutation<{ success: boolean; data: { views: number } }, string>({
      query: (id) => ({
        url: `${POSTS_URL}/${id}/views`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    deletePost: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (id) => ({
        url: `${POSTS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Post', 'PostStats'],
    }),
    
    uploadImage: builder.mutation<{ success: boolean; data: { url: string } }, FormData>({
      query: (data) => ({
        url: `${POSTS_URL}/upload-image`,
        method: 'POST',
        body: data,
      }),
    }),
    
  }),
});

export const {
  useListPostsQuery,
  useGetPostStatsQuery,
  useGetPostDetailsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useUpdatePostStatusMutation,
  useIncrementViewsMutation,
  useDeletePostMutation,
  useUploadImageMutation,
} = postApi;
