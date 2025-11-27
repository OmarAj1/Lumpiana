
import { User, SongStats } from '../types';

const USERS_KEY = 'luma_users';
const CURRENT_USER_KEY = 'luma_current_user_id';

const MOCK_DELAY = 500;

const getDb = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveDb = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authService = {
  async signIn(tagOrEmail: string, password: string): Promise<User> {
    await new Promise(r => setTimeout(r, MOCK_DELAY));

    // Admin Backdoor
    if (tagOrEmail === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: 'admin-user',
        email: 'admin@luma.com',
        password: 'admin',
        name: 'Admin User',
        tag: 'admin',
        isAdmin: true,
        xp: 99999,
        streak: 999,
        level: 99,
        progress: {}
      };
      localStorage.setItem(CURRENT_USER_KEY, adminUser.id);
      return adminUser;
    }

    const users = getDb();
    const user = users.find(u => (u.email === tagOrEmail || u.tag === tagOrEmail) && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    localStorage.setItem(CURRENT_USER_KEY, user.id);
    return user;
  },

  async signUp(email: string, password: string, name: string, tag: string): Promise<User> {
    await new Promise(r => setTimeout(r, MOCK_DELAY));

    const users = getDb();

    // Validation
    if (!email.includes('@')) throw new Error('Invalid email address');
    if (users.some(u => u.email === email)) throw new Error('Email already exists');
    if (users.some(u => u.tag === tag)) throw new Error('Tag is already taken');
    
    // SECURITY: Prevent registration of system reserved handles
    const reservedTags = ['admin', 'moderator', 'system', 'root', 'support'];
    if (reservedTags.includes(tag.toLowerCase())) throw new Error('This tag is reserved');

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      password,
      name,
      tag,
      isAdmin: false,
      xp: 0,
      streak: 1,
      level: 1,
      progress: {}
    };

    users.push(newUser);
    saveDb(users);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    return newUser;
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  async getCurrentUser(): Promise<User | null> {
    const id = localStorage.getItem(CURRENT_USER_KEY);
    if (!id) return null;
    
    // Check for admin session
    if (id === 'admin-user') {
       return {
        id: 'admin-user',
        email: 'admin@luma.com',
        password: 'admin',
        name: 'Admin User',
        tag: 'admin',
        isAdmin: true,
        xp: 99999,
        streak: 999,
        level: 99,
        progress: {}
      };
    }

    const users = getDb();
    return users.find(u => u.id === id) || null;
  },

  async updateUserProgress(userId: string, songId: string, stats: Partial<SongStats>, xpGained: number): Promise<User> {
      // Don't save progress for admin user
      if (userId === 'admin-user') {
          return await this.getCurrentUser() as User;
      }

      const users = getDb();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');

      const user = users[userIndex];
      
      // Update Global Stats
      user.xp += xpGained;
      // Simple level up logic: 1000 XP per level
      user.level = Math.floor(user.xp / 1000) + 1;

      // Update Song Stats
      const currentStats = user.progress[songId] || { stars: 0, highScore: 0, timesPlayed: 0 };
      
      const newStats: SongStats = {
          stars: Math.max(currentStats.stars, stats.stars || 0),
          // Store the BEST percentage achieved
          highScore: Math.max(currentStats.highScore, stats.highScore || 0),
          timesPlayed: currentStats.timesPlayed + 1
      };

      user.progress[songId] = newStats;
      
      users[userIndex] = user;
      saveDb(users);
      return user;
  }
};
