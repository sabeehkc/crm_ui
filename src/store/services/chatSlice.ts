import { apiSlice } from './apiSlice'
import { CHAT_URL } from '../constants'
import { IChatMessage } from '@/types/chat'

interface listResponse<T> {
  success: boolean
  data: {
    items: T[]
  }
}

const chatSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    
    getMessages: builder.query<listResponse<IChatMessage>, string>({
      query: (enquiryId) => `${CHAT_URL}/${enquiryId}/messages`,
      providesTags: (result, error, id) => [{ type: 'Chat', id }]
    }),

    sendMessage: builder.mutation<{success: boolean, data: IChatMessage}, { enquiryId: string, content: string, senderName: string }>({
      query: ({ enquiryId, ...body }) => ({
        url: `${CHAT_URL}/${enquiryId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Chat', id: arg.enquiryId }]
    }),

    sendVoiceMessage: builder.mutation<{success: boolean, data: IChatMessage}, { enquiryId: string, formData: FormData }>({
      query: ({ enquiryId, formData }) => ({
        url: `${CHAT_URL}/${enquiryId}/messages/voice`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Chat', id: arg.enquiryId }]
    }),

  })
})

export const {
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendVoiceMessageMutation,
} = chatSlice
