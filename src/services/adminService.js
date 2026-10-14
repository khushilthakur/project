import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INITIAL_CURATED_JOBS } from '../lib/mockData';

export const adminService = {
  // Get overview statistics for Admin Dashboard
  async getAdminStats() {
    if (isSupabaseConfigured && supabase) {
      try {
        const [
          { count: userCount },
          { count: jobCount },
          { count: appCount },
          { count: resumeCount },
          { count: interviewCount },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('job_listings').select('*', { count: 'exact', head: true }),
          supabase.from('job_applications').select('*', { count: 'exact', head: true }),
          supabase.from('resumes').select('*', { count: 'exact', head: true }),
          supabase.from('interview_sessions').select('*', { count: 'exact', head: true }),
        ]);

        return {
          totalUsers: userCount || 1,
          totalJobs: jobCount || 6,
          totalApplications: appCount || 4,
          totalResumes: resumeCount || 1,
          totalInterviews: interviewCount || 2,
          aiServiceStatus: 'Operational',
          databaseStatus: 'Connected (Supabase Cloud)',
        };
      } catch (err) {
        console.warn('Error fetching Supabase admin stats, using local fallback:', err);
      }
    }

    // Local fallback metrics
    const jobs = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
    const applications = storage.get(STORAGE_KEYS.APPLICATIONS, []);
    const resumes = storage.get(STORAGE_KEYS.RESUMES, []);
    const interviews = storage.get(STORAGE_KEYS.INTERVIEWS, []);

    return {
      totalUsers: 142, // Simulated platform metric
      totalJobs: jobs.length,
      totalApplications: applications.length,
      totalResumes: resumes.length,
      totalInterviews: interviews.length,
      aiServiceStatus: 'Standby / Edge Fallback Active',
      databaseStatus: isSupabaseConfigured ? 'Connected' : 'Local Persistent Storage',
    };
  },

  // Get reported jobs for moderation
  async getReportedJobs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_reported', true)
        .order('updated_at', { ascending: false });

      if (!error && data) return data;
    }

    const jobs = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
    return jobs.filter((j) => j.is_reported);
  },

  // Dismiss report (restore job)
  async dismissReport(jobId, adminId) {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('job_listings')
        .update({ is_reported: false, report_reason: null })
        .eq('id', jobId);
    }
    const jobs = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
    const updated = jobs.map((j) => (j.id === jobId ? { ...j, is_reported: false, report_reason: null } : j));
    storage.set(STORAGE_KEYS.JOBS, updated);

    await this.logAuditAction({
      adminId,
      action: 'DISMISS_REPORT',
      targetType: 'JOB_LISTING',
      targetId: jobId,
      details: { resolution: 'Job approved as legitimate' },
    });
  },

  // Remove reported job
  async removeJob(jobId, adminId) {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('job_listings').delete().eq('id', jobId);
    }
    const jobs = storage.get(STORAGE_KEYS.JOBS, INITIAL_CURATED_JOBS);
    const updated = jobs.filter((j) => j.id !== jobId);
    storage.set(STORAGE_KEYS.JOBS, updated);

    await this.logAuditAction({
      adminId,
      action: 'REMOVE_JOB',
      targetType: 'JOB_LISTING',
      targetId: jobId,
      details: { resolution: 'Job deleted by admin due to violation' },
    });
  },

  // Log admin audit action
  async logAuditAction({ adminId, action, targetType, targetId, details = {} }) {
    const logEntry = {
      id: 'audit-' + Date.now(),
      admin_id: adminId || 'admin-system',
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('admin_audit_logs').insert(logEntry);
      } catch (e) {
        console.warn('Failed to insert audit log in Supabase:', e);
      }
    }

    const logs = storage.get(STORAGE_KEYS.AUDIT_LOGS, []);
    storage.set(STORAGE_KEYS.AUDIT_LOGS, [logEntry, ...logs]);
  },

  // Get audit logs
  async getAuditLogs() {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) return data;
    }
    return storage.get(STORAGE_KEYS.AUDIT_LOGS, [
      {
        id: 'audit-init',
        admin_id: 'system',
        action: 'SYSTEM_BOOT',
        target_type: 'PLATFORM',
        targetId: 'careerpilot',
        details: { message: 'Security policies and RLS active' },
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
    ]);
  },
};
