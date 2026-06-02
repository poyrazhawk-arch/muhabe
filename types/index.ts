export type AccountantPlan = "free" | "pro" | "enterprise";
export type ClientStatus = "active" | "passive" | "archived";
export type DocumentStatus = "pending" | "received" | "approved" | "rejected";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "critical";
export type RecurrenceType = "monthly" | "quarterly" | "yearly" | "custom";
export type ReminderChannel = "email" | "in_app";
export type NotificationType = "info" | "warning" | "success" | "error";

// RAG durumu
export type RAGStatus = "red" | "amber" | "green";

export interface Accountant {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  office_name: string | null;
  phone: string | null;
  plan: AccountantPlan;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  accountant_id: string;
  full_name: string;
  company_name: string | null;
  tax_number: string | null;
  email: string | null;
  phone: string | null;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Computed fields for dashboard
  pending_documents?: number;
  overdue_tasks?: number;
  rag_status?: RAGStatus;
}

export interface Document {
  id: string;
  client_id: string;
  accountant_id: string;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  mime_type: string | null;
  status: DocumentStatus;
  notes: string | null;
  uploaded_at: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadToken {
  id: string;
  client_id: string;
  accountant_id: string;
  token: string;
  document_types: string[];
  message: string | null;
  expires_at: string;
  used_count: number;
  max_uses: number;
  is_active: boolean;
  created_at: string;
}

export interface TaskTemplate {
  id: string;
  accountant_id: string;
  title: string;
  description: string | null;
  recurrence_type: RecurrenceType;
  due_day: number | null;
  due_month: number | null;
  advance_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  accountant_id: string;
  client_id: string | null;
  template_id: string | null;
  title: string;
  description: string | null;
  due_date: string;
  status: TaskStatus;
  priority: TaskPriority;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface Notification {
  id: string;
  accountant_id: string;
  title: string;
  body: string;
  type: NotificationType;
  is_read: boolean;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
}

// Dashboard
export interface DashboardStats {
  total_clients: number;
  active_clients: number;
  pending_documents: number;
  overdue_tasks: number;
  tasks_due_today: number;
  tasks_due_this_week: number;
}
