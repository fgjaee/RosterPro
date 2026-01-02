
export type DayKey = 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';

export interface Shift {
  id: string; // Unique ID for the employee/row
  name: string;
  role: string;
  sun: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  isManual?: boolean;
}

export interface Employee {
    id: string;
    name: string;
    role: string;
    isActive: boolean;
    email?: string;
    phone?: string;
    aliases?: string[]; // OCR name variations (e.g., ["Ken", "Kenneth A", "K. Andrews"])
}

export interface ScheduleData {
  week_period: string;
  shifts: Shift[];
}

export type TaskType = 'skilled' | 'general' | 'shift_based' | 'manual' | 'all_staff';

export interface TaskRule {
  id: number;
  code: string;
  name: string;
  type: TaskType;
  fallbackChain: string[]; // List of employee names prioritized for this task
  timing?: string;
  dueTime?: string; // e.g. "9:00 AM", "Store Open"
  effort?: number; // Estimated duration in minutes
  frequency?: 'daily' | 'weekly' | 'monthly';
  frequencyDay?: DayKey; // For Weekly: Which day?
  frequencyDate?: number; // For Monthly: Which date (1-31)?
  excludedDays?: DayKey[]; // Days to skip this task
}

export interface AssignedTask extends TaskRule {
  instanceId: string; // Unique ID for this specific assignment
  isComplete?: boolean;
}

// Map: "fri-JohnDoe" -> [Task1, Task2]
export type TaskAssignmentMap = Record<string, AssignedTask[]>;

export type CalendarEventType =
  | 'deep_clean'
  | 'anniversary'
  | 'birthday'
  | 'food_safety_audit'
  | 'maintenance'
  | 'meeting'
  | 'training'
  | 'other';

export interface CalendarEvent {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description?: string;
  eventType: CalendarEventType;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt?: string;
  updatedAt?: string;
}

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  deep_clean: 'Deep Clean',
  anniversary: 'Anniversary',
  birthday: 'Birthday',
  food_safety_audit: 'Food Safety Audit',
  maintenance: 'Maintenance',
  meeting: 'Meeting',
  training: 'Training',
  other: 'Other'
};

export const EVENT_TYPE_COLORS: Record<CalendarEventType, {bg: string, text: string, border: string}> = {
  deep_clean: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  anniversary: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
  birthday: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-300' },
  food_safety_audit: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' },
  maintenance: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  meeting: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-300' },
  training: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-300' },
  other: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-300' }
};

export interface AppState {
  activeTab: 'schedule' | 'tasks' | 'team' | 'calendar';
  selectedDay: DayKey;
  isLoading: boolean;
  isSaving: boolean;
}

export const DAY_LABELS: Record<DayKey, string> = {
  sun: 'Sunday',
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday'
};

// Intentionally empty default. The app now generates the initial schedule 
// dynamically from the Team Database in StorageService.ts
export const INITIAL_SCHEDULE: ScheduleData = {
  week_period: 'New Week',
  shifts: [] 
};
