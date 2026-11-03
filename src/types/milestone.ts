import { IUser } from './user';

export type MilestoneStatus = 'pending' | 'in_progress' | 'done';

export interface ITask {
  _id: string;
  title: string;
  dueDate?: string;
  status: 'Pending' | 'In Progress' | 'Done';
  milestoneId: string;
  projectId: string;
  createdAt: string;
}

export interface IMilestone {
  _id: string;
  title: string;
  dueDate: string;
  status: MilestoneStatus;
  projectId: string;
  tasks: ITask[];
  createdAt: string;
}
