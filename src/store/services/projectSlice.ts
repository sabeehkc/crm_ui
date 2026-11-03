import { apiSlice } from './apiSlice'
import { PROJECT_URL } from '../constants'
import { IProject, listProjectsResponse } from '@/types/project'
import { IMilestone, ITask } from '@/types/milestone'
import { IBug } from '@/types/bug'

const projectSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    listProjects: builder.query<listProjectsResponse, {page?: number, limit?: number, search?: string, status?: string}>({
      query: ({page = 1, limit = 20, search, status}) => ({
        url: PROJECT_URL,
        method: 'GET',
        params: { page, limit, search, status }
      }),
      providesTags: ['Project']
    }),

    getProjectDetails: builder.query<{success: boolean, data: IProject}, string>({
      query: (id) => `${PROJECT_URL}/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }]
    }),

    createProject: builder.mutation<{success: boolean, data: IProject}, Partial<IProject>>({
      query: (data) => ({
        url: PROJECT_URL,
        method: 'POST',
        body: data
      }),
      invalidatesTags: ['Project']
    }),

    updateProject: builder.mutation<{success: boolean, data: IProject}, {id: string, data: Partial<IProject>}>({
      query: ({id, data}) => ({
        url: `${PROJECT_URL}/${id}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => ['Project', { type: 'Project', id }]
    }),

    updateProjectProgress: builder.mutation<{success: boolean, data: IProject}, {id: string, progress: number}>({
      query: ({id, progress}) => ({
        url: `${PROJECT_URL}/${id}/progress`,
        method: 'PATCH',
        body: { progress }
      }),
      invalidatesTags: (result, error, { id }) => ['Project', { type: 'Project', id }]
    }),

    deleteProject: builder.mutation<{success: boolean}, string>({
      query: (id) => ({
        url: `${PROJECT_URL}/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Project']
    }),

    // === MILESTONES ===
    getMilestones: builder.query<{success: boolean, data: IMilestone[]}, string>({
      query: (id) => `${PROJECT_URL}/${id}/milestones`,
      providesTags: (result, error, id) => [{ type: 'Project', id: `MILESTONES_${id}` }]
    }),

    createMilestone: builder.mutation<{success: boolean, data: IMilestone}, {id: string, data: Partial<IMilestone>}>({
      query: ({id, data}) => ({
        url: `${PROJECT_URL}/${id}/milestones`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id: `MILESTONES_${id}` }, { type: 'Project', id }]
    }),

    updateMilestone: builder.mutation<{success: boolean, data: IMilestone}, {projectId: string, milestoneId: string, data: Partial<IMilestone>}>({
      query: ({projectId, milestoneId, data}) => ({
        url: `${PROJECT_URL}/${projectId}/milestones/${milestoneId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: `MILESTONES_${projectId}` }, { type: 'Project', id: projectId }]
    }),

    // === TASKS ===
    createTask: builder.mutation<{success: boolean, data: ITask}, {projectId: string, milestoneId: string, data: Partial<ITask>}>({
      query: ({projectId, milestoneId, data}) => ({
        url: `${PROJECT_URL}/${projectId}/milestones/${milestoneId}/tasks`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: `MILESTONES_${projectId}` }, { type: 'Project', id: projectId }]
    }),

    updateTask: builder.mutation<{success: boolean, data: ITask}, {projectId: string, milestoneId: string, taskId: string, data: Partial<ITask>}>({
      query: ({projectId, milestoneId, taskId, data}) => ({
        url: `${PROJECT_URL}/${projectId}/milestones/${milestoneId}/tasks/${taskId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: `MILESTONES_${projectId}` }, { type: 'Project', id: projectId }]
    }),

    // === BUGS ===
    getBugs: builder.query<{success: boolean, data: { items: IBug[], total: number }}, string>({
      query: (id) => `${PROJECT_URL}/${id}/bugs`,
      providesTags: (result, error, id) => [{ type: 'Project', id: `BUGS_${id}` }]
    }),

    createBug: builder.mutation<{success: boolean, data: IBug}, {id: string, data: Partial<IBug>}>({
      query: ({id, data}) => ({
        url: `${PROJECT_URL}/${id}/bugs`,
        method: 'POST',
        body: data
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id: `BUGS_${id}` }, { type: 'Project', id }]
    }),

    updateBug: builder.mutation<{success: boolean, data: IBug}, {projectId: string, bugId: string, data: Partial<IBug>}>({
      query: ({projectId, bugId, data}) => ({
        url: `${PROJECT_URL}/${projectId}/bugs/${bugId}`,
        method: 'PUT',
        body: data
      }),
      invalidatesTags: (result, error, { projectId }) => [{ type: 'Project', id: `BUGS_${projectId}` }, { type: 'Project', id: projectId }]
    }),
    
  }),
});

export const {
  useListProjectsQuery,
  useGetProjectDetailsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useUpdateProjectProgressMutation,
  useDeleteProjectMutation,
  useGetMilestonesQuery,
  useCreateMilestoneMutation,
  useUpdateMilestoneMutation,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useGetBugsQuery,
  useCreateBugMutation,
  useUpdateBugMutation,
} = projectSlice;
