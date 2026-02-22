export interface AdministrativeProfile {
  p_id: string;
  p_name: string;
  p_img: string;
  p_job: string;
  p_grade: string;
  p_stage: string;
  p_join_date: string;
  p_education: string;
  p_job_title: string;
  p_salary: string;
  p_promo_status: string;
  p_rollover: string;
  p_last_bonus: string;
  p_promo_date: string;
  p_due_pre: string;
  p_due_post: string;
  p_thanks: string;
  p_annual_leave: string; // Added: Accumulated Ordinary Leave
  p_sick_leave: string;   // Added: Sick Leave
}

export interface SalaryRecord {
  month: string;
  year: string;
  net_salary: string;
  details: { label: string; value: string }[];
  raw_date: string;
}

export interface GenericRecord {
  name: string;
  amount: number;
  date?: string; // Added for expiration logic
}

export interface Employee extends AdministrativeProfile {
  salary_history: SalaryRecord[];
  bonuses: GenericRecord[];
  dispatches: GenericRecord[];
  extra_hours: GenericRecord[];
  // Legacy fields for backward compatibility if needed
  employee_name?: string;
  employee_id?: string;
}

export type Theme = 'light' | 'dark';

export interface ApiError {
  message: string;
}

// --- Notification System Types ---

export type NotificationType = 'salary' | 'admin' | 'general' | 'system';
export type NotificationPriority = 'high' | 'normal' | 'low';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  timestamp: number; // For sorting
  read: boolean;
  type: NotificationType;
  priority: NotificationPriority;
}