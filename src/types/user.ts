export type UserRole = 'admin' | 'staff';

export interface IPermissionValue {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

export interface IStaffPermissions {
  projects: IPermissionValue;
  enquiries: IPermissionValue;
  quotations: IPermissionValue;
  invoices: IPermissionValue;
  expenses: IPermissionValue;
  forms: IPermissionValue;
  tasks?: IPermissionValue;
}

export interface IUser {
  _id: string;
  name?: string;
  email: string;
  password?: string;
  phone?: string;
  role: UserRole;
  tenantId: string;
  isActive: boolean;
  profile: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
  pages: string[];
  projects: string[];
  permissions?: IStaffPermissions;
  lastLogin?: Date;
  refreshTokens: string[];
  googleId?: string;
  authProvider?: 'local' | 'google';
  createdAt: Date;
  updatedAt: Date;
}
