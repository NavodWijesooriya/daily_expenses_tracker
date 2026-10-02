export type ExpenseCategory = 'Home Needs' | 'Wife' | 'Personal' | 'Other' | 'Wife Personal' | string;

export interface Expense {
  id: string;
  expenseName: string;
  amount: number;
  category: ExpenseCategory;
  personName?: string;
  description?: string;
  date: string; // YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'synced' | 'pending' | 'saving';
}

export type UserApprovalStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  status: UserApprovalStatus;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  reviewedBy?: string;
}

export interface AdminNotification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'new_user_registration' | 'user_status_changed';
  status: UserApprovalStatus;
  message?: string;
  read?: boolean;
  createdAt: string;
}

export type DateFilterPreset = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'custom';

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';
