import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, STORAGE_KEYS, storage } from '../lib/supabaseClient';
import { INITIAL_NOTIFICATIONS } from '../lib/mockData';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (!error && data && mounted) {
            setNotifications(data);
          }
        } else {
          const cached = storage.get(STORAGE_KEYS.NOTIFICATIONS);
          if (mounted) {
            if (cached && Array.isArray(cached)) {
              setNotifications(cached);
            } else {
              storage.set(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
              setNotifications(INITIAL_NOTIFICATIONS);
            }
          }
        }
      } catch (err) {
        console.warn('Error loading notifications:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      }
      const updated = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      setNotifications(updated);
      if (!isSupabaseConfigured) {
        storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (isSupabaseConfigured && supabase && user) {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id);
      }
      const updated = notifications.map((n) => ({ ...n, is_read: true }));
      setNotifications(updated);
      if (!isSupabaseConfigured) {
        storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('notifications').delete().eq('id', id);
      }
      const updated = notifications.filter((n) => n.id !== id);
      setNotifications(updated);
      if (!isSupabaseConfigured) {
        storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const addNotification = async ({ title, message, type = 'system', link = null, due_date = null }) => {
    const newNotif = {
      id: 'notif-' + Date.now(),
      user_id: user?.id,
      title,
      message,
      type,
      link,
      is_read: false,
      due_date,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase.from('notifications').insert(newNotif).select().single();
        if (!error && data) {
          setNotifications((prev) => [data, ...prev]);
          return data;
        }
      }
      const updated = [newNotif, ...notifications];
      setNotifications(updated);
      if (!isSupabaseConfigured) {
        storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
      }
      return newNotif;
    } catch (err) {
      console.error('Error adding notification:', err);
      return null;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
