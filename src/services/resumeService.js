import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';

export const resumeService = {
  // Get all resumes for user
  async getResumes(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      const cached = storage.get(STORAGE_KEYS.RESUMES);
      if (cached && Array.isArray(cached)) {
        return cached;
      }
      return [];
    }
  },

  // Get single resume by id
  async getResumeById(id) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } else {
      const list = storage.get(STORAGE_KEYS.RESUMES, []);
      return list.find((r) => r.id === id) || null;
    }
  },

  // Save / Update resume
  async saveResume(resume) {
    const updated = {
      ...resume,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('resumes')
        .upsert(updated)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      let list = storage.get(STORAGE_KEYS.RESUMES, []);
      const index = list.findIndex((r) => r.id === resume.id);
      if (index >= 0) {
        list[index] = updated;
      } else {
        list = [updated, ...list];
      }
      storage.set(STORAGE_KEYS.RESUMES, list);
      return updated;
    }
  },

  // Duplicate resume
  async duplicateResume(resume, userId) {
    const duplicated = {
      ...resume,
      id: 'res-' + Date.now(),
      user_id: userId,
      title: `${resume.title} (Copy)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_default: false,
    };
    return this.saveResume(duplicated);
  },

  // Delete resume
  async deleteResume(id) {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('resumes').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const list = storage.get(STORAGE_KEYS.RESUMES, []);
      const filtered = list.filter((r) => r.id !== id);
      storage.set(STORAGE_KEYS.RESUMES, filtered);
      return true;
    }
  },
};
