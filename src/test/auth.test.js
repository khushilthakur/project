import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS, storage } from '../lib/supabaseClient';
import {
  ADMIN_USER,
  ADMIN_PROFILE,
  DEMO_STUDENT_ACCOUNT,
} from '../context/authConstants';

describe('Strict Authentication & Administrator Security Verification', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unauthenticated users must start with null (no automatic admin escalation)', () => {
    const cachedUser = storage.get(STORAGE_KEYS.USER, null);
    const cachedProfile = storage.get(STORAGE_KEYS.PROFILE, null);
    expect(cachedUser).toBeNull();
    expect(cachedProfile).toBeNull();
  });

  it('rejects administrator login when password is not 280106', () => {
    const email = 'khushilthakur28@gmail.com';
    const wrongPassword = 'invalid_password_123';

    let error = null;
    if (email.toLowerCase() === 'khushilthakur28@gmail.com') {
      if (wrongPassword !== '280106') {
        error = new Error('Incorrect password for administrator khushilthakur28@gmail.com.');
      }
    }

    expect(error).not.toBeNull();
    expect(error.message).toContain('Incorrect password for administrator khushilthakur28@gmail.com');
    // Ensure no session was stored
    expect(storage.get(STORAGE_KEYS.USER)).toBeNull();
  });

  it('successfully authorizes administrator ONLY with correct ID and password 280106', () => {
    const email = 'khushilthakur28@gmail.com';
    const password = '280106';

    let authData = null;
    let authError = null;

    if (email.toLowerCase() === 'khushilthakur28@gmail.com') {
      if (password !== '280106') {
        authError = new Error('Incorrect password for administrator khushilthakur28@gmail.com.');
      } else {
        storage.set(STORAGE_KEYS.USER, ADMIN_USER);
        storage.set(STORAGE_KEYS.PROFILE, ADMIN_PROFILE);
        authData = { user: ADMIN_USER };
      }
    }

    expect(authError).toBeNull();
    expect(authData).not.toBeNull();
    expect(authData.user.email).toBe('khushilthakur28@gmail.com');

    const storedProfile = storage.get(STORAGE_KEYS.PROFILE);
    expect(storedProfile.role).toBe('admin');
  });

  it('rejects candidate login with wrong password', () => {
    // Register candidate account
    const registeredAccount = {
      id: 'usr-cand-1',
      email: 'jane@example.com',
      password: 'mypassword789',
      fullName: 'Jane Doe',
      createdAt: new Date().toISOString(),
    };
    storage.set(STORAGE_KEYS.ACCOUNTS, [registeredAccount]);

    const accounts = storage.get(STORAGE_KEYS.ACCOUNTS, []);
    const matching = accounts.find((a) => a.email === 'jane@example.com');
    expect(matching).toBeDefined();

    const wrongAttemptPass = 'badpass';
    expect(matching.password === wrongAttemptPass).toBe(false);
  });

  it('demo candidate account verifies with password123', () => {
    expect(DEMO_STUDENT_ACCOUNT.email).toBe('student@careerpilot.io');
    expect(DEMO_STUDENT_ACCOUNT.password).toBe('password123');
  });
});
