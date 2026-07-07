import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "moderator" | "user";

export interface AdminUser {
  id: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  role: AppRole;
  status: "active" | "suspended";
  created_at: string;
  last_sign_in_at: string | null;
  trust_score: number;
  trust_status: string;
}

export interface AdminService {
  id: string;
  title: string;
  category: string;
  point_price: number;
  is_active: boolean;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_email: string;
}

export interface AdminOverview {
  total_users: number;
  active_users_30d: number;
  suspended_users: number;
  total_services: number;
  active_services: number;
  active_requests: number;
  completed_exchanges: number;
}

export interface AuditRow {
  id: string;
  admin_id: string;
  admin_name: string | null;
  action: string;
  target_type: string;
  target_id: string | null;
  target_label: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await (supabase as any).rpc("has_role", { _user_id: user.id, _role: "admin" });
  return !!data;
}

const rpc = async <T,>(fn: string, args?: Record<string, unknown>): Promise<T> => {
  const { data, error } = await (supabase as any).rpc(fn, args ?? {});
  if (error) throw error;
  return data as T;
};

export const listUsers = (search?: string) =>
  rpc<AdminUser[]>("admin_list_users", { _search: search ?? null, _limit: 200, _offset: 0 });
export const setUserStatus = (userId: string, status: "active" | "suspended", reason?: string) =>
  rpc<void>("admin_set_user_status", { _user_id: userId, _status: status, _reason: reason ?? null });
export const deleteUser = (userId: string, reason?: string) =>
  rpc<void>("admin_delete_user", { _user_id: userId, _reason: reason ?? null });
export const setUserRole = (userId: string, role: AppRole, reason?: string) =>
  rpc<void>("admin_set_user_role", { _user_id: userId, _role: role, _reason: reason ?? null });

export const listServices = (search?: string, onlyActive?: boolean | null) =>
  rpc<AdminService[]>("admin_list_services", {
    _search: search ?? null,
    _only_active: onlyActive ?? null,
    _limit: 200,
    _offset: 0,
  });
export const setServiceActive = (serviceId: string, active: boolean, reason?: string) =>
  rpc<void>("admin_set_service_active", { _service_id: serviceId, _active: active, _reason: reason ?? null });
export const deleteService = (serviceId: string, reason?: string) =>
  rpc<void>("admin_delete_service", { _service_id: serviceId, _reason: reason ?? null });
export const flagService = (serviceId: string, reason: string) =>
  rpc<void>("admin_flag_service", { _service_id: serviceId, _reason: reason });

export const getOverview = async () => {
  const rows = await rpc<AdminOverview[]>("admin_overview");
  return rows?.[0] ?? null;
};
export const newUsersMonthly = (months = 6) =>
  rpc<{ month: string; count: number }[]>("admin_new_users_monthly", { _months: months });
export const servicesByCategory = () =>
  rpc<{ category: string; count: number }[]>("admin_services_by_category");
export const requestsByStatus = () =>
  rpc<{ status: string; count: number }[]>("admin_requests_by_status");
export const listAudit = (limit = 100) =>
  rpc<AuditRow[]>("admin_list_audit", { _limit: limit });
