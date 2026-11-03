export type TaskStatus = 'Pending' | 'In Progress' | 'Done';

export interface IUserSummary {
  _id: string;
  name?: string;
  email: string;
  role?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

export interface ITask {
  _id: string;
  title?: string;
  task?: string;
  description?: string;
  taskDescription?: string;

  // Section 1
  clientName?: string;
  date?: string;
  activity?: string;

  // Section 2
  division?: string;
  workDetail?: string;

  // Section 3
  allottedBy?: IUserSummary;
  allottedTo?: IUserSummary;
  allottedDate?: string;
  targetDate?: string;
  completedDate?: string;

  // Section 4
  status: TaskStatus;
  clientStatus?: string;
  billing?: string;
  remarks?: string;

  tenantId: string;
  createdBy?: IUserSummary;
  assignedTo?: IUserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface ITaskCounts {
  total: number;
  pending: number;
  inProgress: number;
  done: number;
}
