import { ScheduleData, TaskRule, TaskAssignmentMap, Employee } from "../types";
import { DEFAULT_TASK_DB, DEFAULT_TEAM } from "../constants";
import { supabase, TABLES } from './supabaseClient';

// Helper to get current user ID
const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

export const StorageService = {
  // --- Schedule Management ---
  getSchedule: async (): Promise<ScheduleData> => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from(TABLES.SCHEDULE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      if (data && data.schedule_data) {
        return data.schedule_data as ScheduleData;
      }

      // No schedule exists, generate from default team
      return {
        week_period: 'New Week',
        shifts: DEFAULT_TEAM.map((emp, index) => ({
          id: emp.id || String(index + 1),
          name: emp.name,
          role: emp.role,
          sun: "OFF",
          mon: "OFF",
          tue: "OFF",
          wed: "OFF",
          thu: "OFF",
          fri: "OFF",
          sat: "OFF"
        }))
      };
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw error;
    }
  },

  saveSchedule: async (data: ScheduleData): Promise<void> => {
    try {
      const userId = await getUserId();

      // Check if schedule exists
      const { data: existing } = await supabase
        .from(TABLES.SCHEDULE)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing schedule
        const { error } = await supabase
          .from(TABLES.SCHEDULE)
          .update({
            schedule_data: data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new schedule
        const { error } = await supabase
          .from(TABLES.SCHEDULE)
          .insert({
            user_id: userId,
            schedule_data: data
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  },

  // --- Task DB Management ---
  getTaskDB: async (): Promise<TaskRule[]> => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from(TABLES.TASK_DB)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.tasks || DEFAULT_TASK_DB;
    } catch (error) {
      console.error('Error fetching task DB:', error);
      return DEFAULT_TASK_DB;
    }
  },

  saveTaskDB: async (data: TaskRule[]): Promise<void> => {
    try {
      const userId = await getUserId();

      const { data: existing } = await supabase
        .from(TABLES.TASK_DB)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from(TABLES.TASK_DB)
          .update({
            tasks: data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(TABLES.TASK_DB)
          .insert({
            user_id: userId,
            tasks: data
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving task DB:', error);
      throw error;
    }
  },

  // --- Task Assignments ---
  getAssignments: async (): Promise<TaskAssignmentMap> => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from(TABLES.ASSIGNMENTS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.assignments || {};
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return {};
    }
  },

  saveAssignments: async (data: TaskAssignmentMap): Promise<void> => {
    try {
      const userId = await getUserId();

      const { data: existing } = await supabase
        .from(TABLES.ASSIGNMENTS)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from(TABLES.ASSIGNMENTS)
          .update({
            assignments: data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(TABLES.ASSIGNMENTS)
          .insert({
            user_id: userId,
            assignments: data
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving assignments:', error);
      throw error;
    }
  },

  // --- Team / Employee Management ---
  getTeam: async (): Promise<Employee[]> => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from(TABLES.TEAM)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.team_members || DEFAULT_TEAM;
    } catch (error) {
      console.error('Error fetching team:', error);
      return DEFAULT_TEAM;
    }
  },

  saveTeam: async (data: Employee[]): Promise<void> => {
    try {
      const userId = await getUserId();

      const { data: existing } = await supabase
        .from(TABLES.TEAM)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from(TABLES.TEAM)
          .update({
            team_members: data,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(TABLES.TEAM)
          .insert({
            user_id: userId,
            team_members: data
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving team:', error);
      throw error;
    }
  },

  // --- Pinned Message ---
  getPinnedMessage: async (): Promise<string> => {
    try {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from(TABLES.SETTINGS)
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.pinned_message || "Welcome to the team! Focus on safety and customers today.";
    } catch (error) {
      console.error('Error fetching pinned message:', error);
      return "Welcome to the team! Focus on safety and customers today.";
    }
  },

  savePinnedMessage: async (msg: string): Promise<void> => {
    try {
      const userId = await getUserId();

      const { data: existing } = await supabase
        .from(TABLES.SETTINGS)
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        const { error } = await supabase
          .from(TABLES.SETTINGS)
          .update({
            pinned_message: msg,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(TABLES.SETTINGS)
          .insert({
            user_id: userId,
            pinned_message: msg
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error saving pinned message:', error);
      throw error;
    }
  },

  // --- Export / Import ---
  exportData: async () => {
    const schedule = await StorageService.getSchedule();
    const taskDB = await StorageService.getTaskDB();
    const assignments = await StorageService.getAssignments();
    const team = await StorageService.getTeam();
    const pinnedMsg = await StorageService.getPinnedMessage();

    const exportObj = {
      schedule,
      taskDB,
      assignments,
      team,
      pinnedMsg,
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `roster_backup_${new Date().toLocaleDateString().replace(/\//g,'-')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  importData: async (file: File, scheduleOnly: boolean = false): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);

          if (scheduleOnly) {
            // Only import schedule and assignments, preserve rules/team/settings
            if (json.schedule) await StorageService.saveSchedule(json.schedule);
            if (json.assignments) await StorageService.saveAssignments(json.assignments);
          } else {
            // Full import - everything
            if (json.schedule) await StorageService.saveSchedule(json.schedule);
            if (json.taskDB) await StorageService.saveTaskDB(json.taskDB);
            if (json.assignments) await StorageService.saveAssignments(json.assignments);
            if (json.team) await StorageService.saveTeam(json.team);
            if (json.pinnedMsg) await StorageService.savePinnedMessage(json.pinnedMsg);
          }
          resolve(true);
        } catch (error) {
          console.error("Import failed", error);
          reject(false);
        }
      };
      reader.readAsText(file);
    });
  }
};
