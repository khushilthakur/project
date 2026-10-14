import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INITIAL_APPLICATIONS } from '../lib/mockData';

export const applicationService = {
  // Get all applications for a user
  async getApplications(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      let list = storage.get(STORAGE_KEYS.APPLICATIONS);
      if (!list || !Array.isArray(list)) {
        list = INITIAL_APPLICATIONS.map((app) => ({ ...app, user_id: userId }));
        storage.set(STORAGE_KEYS.APPLICATIONS, list);
      }
      return list;
    }
  },

  // Add application
  async addApplication(appData, userId) {
    const newApp = {
      ...appData,
      id: 'app-' + Date.now(),
      user_id: userId,
      status: appData.status || 'Applied',
      applied_date: appData.applied_date || new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_applications')
        .insert(newApp)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = storage.get(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const updated = [newApp, ...list];
      storage.set(STORAGE_KEYS.APPLICATIONS, updated);

      // Record history in local storage
      const history = storage.get(STORAGE_KEYS.APP_HISTORY, []);
      history.push({
        id: 'hist-' + Date.now(),
        application_id: newApp.id,
        user_id: userId,
        previous_status: null,
        new_status: newApp.status,
        changed_at: new Date().toISOString(),
        notes: 'Application created',
      });
      storage.set(STORAGE_KEYS.APP_HISTORY, history);

      return newApp;
    }
  },

  // Update application
  async updateApplication(id, updates, userId) {
    const updated = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_applications')
        .update(updated)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = storage.get(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const index = list.findIndex((a) => a.id === id);
      if (index >= 0) {
        const oldStatus = list[index].status;
        list[index] = { ...list[index], ...updated };
        storage.set(STORAGE_KEYS.APPLICATIONS, list);

        if (updates.status && updates.status !== oldStatus) {
          const history = storage.get(STORAGE_KEYS.APP_HISTORY, []);
          history.push({
            id: 'hist-' + Date.now(),
            application_id: id,
            user_id: userId,
            previous_status: oldStatus,
            new_status: updates.status,
            changed_at: new Date().toISOString(),
            notes: 'Status updated',
          });
          storage.set(STORAGE_KEYS.APP_HISTORY, history);
        }

        return list[index];
      }
      return null;
    }
  },

  // Delete application
  async deleteApplication(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('job_applications').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const list = storage.get(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const filtered = list.filter((a) => a.id !== id);
      storage.set(STORAGE_KEYS.APPLICATIONS, filtered);
      return true;
    }
  },

  // Calculate real metrics from applications
  calculateMetrics(applications = []) {
    const total = applications.length;
    const byStatus = {
      Saved: 0,
      Applied: 0,
      Assessment: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
      Withdrawn: 0,
    };

    applications.forEach((app) => {
      if (byStatus[app.status] !== undefined) {
        byStatus[app.status]++;
      }
    });

    const activeApplications = total - byStatus.Saved - byStatus.Withdrawn;
    const interviewCount = byStatus.Interview + byStatus.Offer;
    const offerCount = byStatus.Offer;

    const interviewRate = activeApplications > 0
      ? Math.round((interviewCount / activeApplications) * 100)
      : 0;

    const offerRate = interviewCount > 0
      ? Math.round((offerCount / interviewCount) * 100)
      : 0;

    // Follow-ups requiring action: follow_up_date <= today or within next 3 days
    const now = new Date();
    const threeDaysAhead = new Date(Date.now() + 3 * 86400000);
    const followUpsNeeded = applications.filter((app) => {
      if (!app.follow_up_date || app.status === 'Offer' || app.status === 'Rejected' || app.status === 'Withdrawn') {
        return false;
      }
      const fDate = new Date(app.follow_up_date);
      return fDate <= threeDaysAhead;
    });

    return {
      total,
      byStatus,
      interviewCount,
      offerCount,
      interviewRate,
      offerRate,
      followUpsNeeded,
    };
  },
};
