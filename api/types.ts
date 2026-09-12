export type UserRole = "admin" | "specialist" | "patient";

export interface AuthUser {
  id: number;
  username: string;
  user_id: number;
  account_type: number; // 1=admin, 2=specialist, 3=patient
  role: UserRole;
  name: string;
  display_name: string;
  avatar: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export interface Service {
  id: number;
  image: string;
  name: string;
  description: string;
  requires_approval: boolean;
  is_active: boolean;
}

export interface ScheduleSlot {
  time: string;
  booked: number;
  capacity: number;
  is_full: boolean;
}

export interface ScheduleAvailability {
  schedule_id: number;
  service: Service;
  date: string;
  quota: number;
  total_booked: number;
  day_full: boolean;
  slots: ScheduleSlot[];
}

export interface Schedule {
  id: number;
  specialist_id: number;
  service_id: number;
  date: string;
  time_start: string;
  time_end: string;
  quota: number;
  slot_duration_minutes: number;
  slot_capacity: number | null;
  is_active: boolean;
  service?: Service;
}

export interface Appointment {
  id: number;
  patient_id: number;
  schedule_id: number;
  preffered_time: string;
  status: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  gender: number;
  contact_number: string;
  address: string;
  created_at: string;
  schedule?: Schedule;
}

export interface PublicAvailabilityEntry {
  schedule_id: number;
  service: string;
  specialist_name: string | null;
  date: string;
  time_start: string;
  time_end: string;
  remaining: number;
  is_full: boolean;
}

export type PublicAvailabilityResponse = Record<
  string,
  PublicAvailabilityEntry[]
>;

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
