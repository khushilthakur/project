import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INITIAL_ROADMAPS } from '../lib/mockData';

export const roadmapService = {
  // Get all roadmaps for user
  async getRoadmaps(userId) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('learning_roadmaps')
        .select('*, roadmap_items(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          ...r,
          items: r.roadmap_items || [],
        }));
      }
    }

    let list = storage.get(STORAGE_KEYS.ROADMAPS);
    if (!list || !Array.isArray(list) || list.length === 0) {
      list = INITIAL_ROADMAPS.map((rm) => ({ ...rm, user_id: userId }));
      storage.set(STORAGE_KEYS.ROADMAPS, list);
    }
    return list;
  },

  // Create new roadmap
  async createRoadmap({ targetRole, title, description, items = [], userId }) {
    const newRoadmap = {
      id: 'roadmap-' + Date.now(),
      user_id: userId,
      target_role: targetRole,
      title: title || `${targetRole} Roadmap`,
      description: description || `Structured learning path to master core skills for ${targetRole}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: items.map((item, idx) => ({
        id: 'item-' + Date.now() + '-' + idx,
        skill_name: item.skill_name,
        category: item.category || 'Core Concept',
        status: 'Not Started',
        priority: item.priority || 'Medium',
        milestone: item.milestone || '',
        resources: item.resources || [],
        personal_notes: '',
        target_date: item.target_date || null,
      })),
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('learning_roadmaps')
        .insert({
          id: newRoadmap.id,
          user_id: userId,
          target_role: targetRole,
          title: newRoadmap.title,
          description: newRoadmap.description,
        })
        .select()
        .single();

      if (!error && data) {
        if (newRoadmap.items.length > 0) {
          const itemRows = newRoadmap.items.map((it) => ({
            id: it.id,
            roadmap_id: data.id,
            user_id: userId,
            skill_name: it.skill_name,
            category: it.category,
            status: it.status,
            priority: it.priority,
            milestone: it.milestone,
            resources: it.resources,
          }));
          await supabase.from('roadmap_items').insert(itemRows);
        }
      }
    }

    const list = storage.get(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
    const updated = [newRoadmap, ...list];
    storage.set(STORAGE_KEYS.ROADMAPS, updated);
    return newRoadmap;
  },

  // Update item status
  async updateItemStatus(roadmapId, itemId, newStatus) {
    const list = storage.get(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
    const rIndex = list.findIndex((r) => r.id === roadmapId);

    if (rIndex >= 0) {
      const iIndex = list[rIndex].items.findIndex((i) => i.id === itemId);
      if (iIndex >= 0) {
        list[rIndex].items[iIndex].status = newStatus;
        list[rIndex].updated_at = new Date().toISOString();
        storage.set(STORAGE_KEYS.ROADMAPS, list);

        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('roadmap_items')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', itemId);
        }

        return list[rIndex];
      }
    }
    return null;
  },

  // Add personal note or update item
  async updateItemDetails(roadmapId, itemId, updates) {
    const list = storage.get(STORAGE_KEYS.ROADMAPS, INITIAL_ROADMAPS);
    const rIndex = list.findIndex((r) => r.id === roadmapId);

    if (rIndex >= 0) {
      const iIndex = list[rIndex].items.findIndex((i) => i.id === itemId);
      if (iIndex >= 0) {
        list[rIndex].items[iIndex] = { ...list[rIndex].items[iIndex], ...updates };
        list[rIndex].updated_at = new Date().toISOString();
        storage.set(STORAGE_KEYS.ROADMAPS, list);

        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('roadmap_items')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', itemId);
        }

        return list[rIndex];
      }
    }
    return null;
  },
};
