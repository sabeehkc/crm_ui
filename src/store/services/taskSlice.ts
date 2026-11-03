import { apiSlice } from './apiSlice';
import { TASK_URL } from '../constants';
import { ITask, ITaskCounts } from '@/types/task';

export interface ListTaskResponse {
  success: boolean;
  data: {
    items: ITask[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: ITaskCounts;
  };
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  clientStatus?: string;
  division?: string;
  activity?: string;
  search?: string;
}

export interface TaskPayload {
  task?: string;
  title?: string;
  taskDescription?: string;
  description?: string;
  clientName?: string;
  date?: string;
  activity?: string;
  division?: string;
  workDetail?: string;
  allottedBy?: string;
  allottedTo?: string;
  allottedDate?: string;
  targetDate?: string;
  completedDate?: string;
  status?: string;
  clientStatus?: string;
  billing?: string;
  remarks?: string;
}

export const taskSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listTasks: builder.query<ListTaskResponse, TaskQueryParams | void>({
      query: (params) => ({
        url: TASK_URL,
        params: params || {},
      }),
      providesTags: ['Task'],
    }),

    getTask: builder.query<{ success: boolean; data: ITask }, string>({
      query: (id) => `${TASK_URL}/${id}`,
      providesTags: ['Task'],
    }),

    createTask: builder.mutation<{ success: boolean; data: ITask }, TaskPayload>({
      query: (data) => ({
        url: TASK_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),

    updateTask: builder.mutation<
      { success: boolean; data: ITask },
      { id: string; data: TaskPayload }
    >({
      query: ({ id, data }) => ({
        url: `${TASK_URL}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),

    deleteTask: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `${TASK_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useListTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskSlice;
