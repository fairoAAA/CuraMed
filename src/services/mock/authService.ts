import type { IAuthService } from '@/services/interfaces';
import type { User, UserRole } from '@/types';
import { resolveUserByPhone, normalizePhone, MOCK_USERS } from './mockData';

const MOCK_OTP = '123456';
const SESSION_KEY = 'curamed_session';

class MockAuthService implements IAuthService {
  private pendingPhones = new Set<string>();

  async requestOtp(phone: string): Promise<void> {
    const norm = normalizePhone(phone);
    await delay(400);
    this.pendingPhones.add(norm);
    console.info(`[MockAuth] OTP sent to ${norm}: ${MOCK_OTP}`);
  }

  async verifyOtp(phone: string, otp: string): Promise<User> {
    await delay(500);
    const norm = normalizePhone(phone);
    
    // In demo environment, accept MOCK_OTP directly even if requestOtp was skipped
    if (otp !== MOCK_OTP && otp !== '000000') {
      throw new Error('auth.invalidOtp');
    }

    this.pendingPhones.delete(norm);
    const user = resolveUserByPhone(norm);
    this.saveSession(user);
    return user;
  }

  async quickLogin(role: UserRole): Promise<User> {
    await delay(300);
    const roleMap: Record<UserRole, string> = {
      patient: 'u1',
      doctor: 'doc1',
      registrar: 'u6',
      admin: 'u7',
    };
    const targetId = roleMap[role];
    const user = MOCK_USERS.find(u => u.id === targetId) || MOCK_USERS.find(u => u.role === role) || MOCK_USERS[0];
    this.saveSession(user);
    return user;
  }

  private saveSession(user: User): void {
    const data = JSON.stringify(user);
    try {
      localStorage.setItem(SESSION_KEY, data);
    } catch {
      // fallback
    }
    try {
      sessionStorage.setItem(SESSION_KEY, data);
    } catch {
      // fallback
    }
  }

  async getSession(): Promise<User | null> {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

export const authService: IAuthService = new MockAuthService();
