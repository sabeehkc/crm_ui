export type PostStatus = 'Draft' | 'Published' | 'Scheduled' | 'Archived';
export type PostCategory = 'Blog' | 'News' | 'Announcement' | 'Documentation' | 'Tips & Tricks' | 'Case Study';

export interface IPost {
  _id: string;
  title: string;
  slug: string;
  category: PostCategory;
  summary?: string;
  thumbnail?: string;
  metaTags: string[];
  status: PostStatus;
  content?: any[];
  publishDate?: string;
  views: number;
  author: {
    _id: string;
    name: string;
    email?: string;
    profile?: {
      avatar?: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface IPostStats {
  total: number;
  published: number;
  scheduled: number;
  drafts: number;
  archived: number;
}

export interface ListPostsResponse {
  success: boolean;
  data: {
    items: IPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetPostStatsResponse {
  success: boolean;
  data: IPostStats;
}

export interface GetPostResponse {
  success: boolean;
  data: IPost;
}

export interface CreatePostResponse {
  success: boolean;
  data: IPost;
  message?: string;
}

export interface UpdatePostResponse {
  success: boolean;
  data: IPost;
  message?: string;
}
