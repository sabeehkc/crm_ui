import { IUser } from "./user";

export type BugSeverity = "Low" | "Medium" | "High" | "Critical";
export type BugStatus = "Open" | "In Progress" | "Resolved";

export interface IBug {
  _id: string;
  projectId: string;
  bugId: string;
  title: string;
  reporter: string;
  severity: BugSeverity;
  status: BugStatus;
  stepsToReproduce?: string;
  resolution?: string;
  reportedAt: Date;
  resolvedAt?: Date;
  resolutionTime?: string;
  createdAt: Date;
  updatedAt: Date;
}
