import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INITIAL_CURATED_JOBS } from '../lib/mockData';

export const jobService = {
  // Get all job listings with optional filtering
  async getJobListings(filters = {}) {
    if (isSupabaseConfigured && supabase) {
      let query = supabase
        .from('job_listings')
        .select('*')
        .eq('is_reported', false)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,company.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters.type && filters.type !== 'All') {
        query = query.eq('type', filters.type);
      }
      if (filters.work_mode && filters.work_mode !== 'All') {
        query = query.eq('work_mode', filters.work_mode);
      }
      if (filters.experience_level && filters.experience_level !== 'All') {
        query = query.eq('experience_level', filters.experience_level);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } else {
      let list = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
      if (!list || list.length === 0) {
        list = INITIAL_CURATED_JOBS;
        storage.set(STORAGE_KEYS.JOBS, list);
      }

      return list.filter((job) => {
        if (job.is_reported) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchSkills = job.skills_required?.some((s) => s.toLowerCase().includes(q));
          if (!matchTitle && !matchCompany && !matchSkills) return false;
        }
        if (filters.type && filters.type !== 'All' && job.type !== filters.type) return false;
        if (filters.work_mode && filters.work_mode !== 'All' && job.work_mode !== filters.work_mode) return false;
        if (filters.experience_level && filters.experience_level !== 'All' && job.experience_level !== filters.experience_level) return false;
        return true;
      });
    }
  },

  // Create manual job entry
  async createJobListing(jobData, userId) {
    const newJob = {
      ...jobData,
      id: 'job-' + Date.now(),
      created_by: userId,
      source: jobData.source || 'Manual User Entry',
      is_verified: false,
      is_reported: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_listings')
        .insert(newJob)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
      const updated = [newJob, ...list];
      storage.set(STORAGE_KEYS.JOBS, updated);
      return newJob;
    }
  },

  // Save / Unsave Job
  async toggleSaveJob(jobId, userId) {
    if (isSupabaseConfigured && supabase) {
      const { data: existing } = await supabase
        .from('saved_jobs')
        .select('id')
        .eq('user_id', userId)
        .eq('job_id', jobId)
        .maybeSingle();

      if (existing) {
        await supabase.from('saved_jobs').delete().eq('id', existing.id);
        return false; // now unsaved
      } else {
        await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId });
        return true; // now saved
      }
    } else {
      let saved = storage.get(STORAGE_KEYS.SAVED_JOBS, ['job-1', 'job-3']);
      const isSaved = saved.includes(jobId);
      if (isSaved) {
        saved = saved.filter((id) => id !== jobId);
      } else {
        saved.push(jobId);
      }
      storage.set(STORAGE_KEYS.SAVED_JOBS, saved);
      return !isSaved;
    }
  },

  // Get user's saved job IDs
  async getSavedJobIds(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', userId);
      if (error) throw error;
      return data ? data.map((d) => d.job_id) : [];
    } else {
      return storage.get(STORAGE_KEYS.SAVED_JOBS, ['job-1', 'job-3']);
    }
  },

  // Report job listing
  async reportJob(jobId, reason) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('job_listings')
        .update({ is_reported: true, report_reason: reason })
        .eq('id', jobId);
      if (error) throw error;
      return true;
    } else {
      const list = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
      const updated = list.map((j) => (j.id === jobId ? { ...j, is_reported: true, report_reason: reason } : j));
      storage.set(STORAGE_KEYS.JOBS, updated);
      return true;
    }
  },
};
