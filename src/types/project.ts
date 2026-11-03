import { IUser } from './user';

export type ProjectStatus =
  | 'Just Started'
  | 'In Progress'
  | 'Nearly Done'
  | 'Completed'
  | 'On Hold';

export interface IProject {
  _id: string;
  name: string;
  tags: string[];
  client: string;
  budget: number;
  progress: number;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  description?: string;
  createdBy: string | IUser;
  createdAt: string;
  updatedAt: string;
  // UI-only helper fields derived, etc.
  bugsCount?: number; 
}

export interface listProjectsResponse {
  success: boolean;
  message: string;
  data: {
    items: IProject[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
