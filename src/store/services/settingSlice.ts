import { apiSlice } from './apiSlice'
import { SETTING_URL } from '../constants'

export interface ISetting {
  _id?: string;
  companyName: string;
  logo?: string;
  signatureName?: string;
  signatureRole?: string;
  address?: string;
  mobileNo?: string;
  email?: string;
  gstNo?: string;
  tenantId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SettingResponse {
  success: boolean;
  data: ISetting;
}

export const settingSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanySettings: builder.query<SettingResponse, void>({
      query: () => ({
        url: `${SETTING_URL}/company`,
      }),
      providesTags: ['Setting']
    }),
    
    updateCompanySettings: builder.mutation<SettingResponse, FormData>({
      query: (body) => ({
        url: `${SETTING_URL}/company`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Setting']
    }),
  })
});

export const {
  useGetCompanySettingsQuery,
  useUpdateCompanySettingsMutation,
} = settingSlice;
