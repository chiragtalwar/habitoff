import { 
  HabitStore, 
  HabitOperation, 
  HabitWithCompletedDates,
  OperationType
} from '../types/habit';
import { supabase } from '../lib/supabase';

const STORE_VERSION = 1;
const MAX_RETRIES = 3;

export class HabitCoreService {
  private store: HabitStore = {
    version: STORE_VERSION,
    lastSynced: null,
    habits: new Map(),
    operationQueue: []
  };


  constructor() {
    this.initialize();
    this.setupVisibilityHandler();
  }

  private async initialize(): Promise<void> {
    try {
      // Load from storage
      const stored = await this.loadFromStorage();
      if (stored) {
        this.store = stored;
      }

      // Start sync if online
      if (navigator.onLine) {
        await this.syncWithServer();
      }
    } catch (error) {
      console.error('Failed to initialize habit store:', error);
      throw error;
    }
  }

  private async loadFromStorage(): Promise<HabitStore | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['habitStore'], (result) => {
        const stored = result.habitStore;
        if (stored && stored.version === STORE_VERSION) {
          stored.habits = new Map(Object.entries(stored.habits));
          resolve(stored);
        } else {
          resolve(null);
        }
      });
    });
  }

  private async saveToStorage(): Promise<void> {
    return new Promise((resolve) => {
      // Convert Map to object for storage
      const serializedStore = {
        ...this.store,
        habits: Object.fromEntries(this.store.habits)
      };
      chrome.storage.local.set({ habitStore: serializedStore }, resolve);
    });
  }

  private async queueOperation(
    type: OperationType, 
    habitId: string, 
    data: Record<string, any>
  ): Promise<void> {
    const operation: HabitOperation = {
      type,
      habitId,
      data,
      status: 'PENDING',
      retryCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.store.operationQueue.push(operation);
    await this.saveToStorage();
    await this.processOperationQueue();
  }

  private async processOperationQueue(): Promise<void> {
    if (!navigator.onLine) return;

    for (const op of this.store.operationQueue) {
      if (op.status !== 'PENDING' || op.retryCount >= MAX_RETRIES) continue;

      try {
        op.status = 'IN_PROGRESS';
        op.updatedAt = new Date().toISOString();

        switch (op.type) {
          case 'MARK':
            await this.markHabitComplete(op.habitId, op.data.date);
            break;
          case 'UNMARK':
            await this.unmarkHabitComplete(op.habitId, op.data.date);
            break;
          // Add other operation types here
        }

        op.status = 'COMPLETED';
      } catch (error) {
        op.status = 'FAILED';
        op.retryCount++;
        console.error(`Operation failed (attempt ${op.retryCount}):`, error);
      }

      op.updatedAt = new Date().toISOString();
      await this.saveToStorage();
    }

    // Clean up completed operations
    this.store.operationQueue = this.store.operationQueue.filter(
      op => op.status !== 'COMPLETED'
    );
    await this.saveToStorage();
  }

  // Sync with server
  private async syncWithServer(): Promise<void> {
    try {
      // Fetch remote habits
      const { data: remoteHabits, error: habitsError } = await supabase
        .from('habits')
        .select('*');

      if (habitsError) throw habitsError;

      // Fetch habit completions
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('habit_id, completed_date');

      if (completionsError) throw completionsError;

      // Update local store with remote data
      this.updateStoreWithRemoteData(remoteHabits || [], completions || []);

      const timestamp = new Date().toISOString();
      this.store.lastSynced = timestamp;
      await this.saveToStorage();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        this.syncWithServer().catch(console.error);
      }
    });
  }

  // Core operations
  private async markHabitComplete(habitId: string, date: string): Promise<void> {
    const habit = this.store.habits.get(habitId);
    if (!habit) throw new Error('Habit not found');

    // Update local state
    const updatedDates = [...new Set([...habit.completedDates, date])];
    const updatedHabit = {
      ...habit,
      completedDates: updatedDates,
      currentStreak: this.calculateStreak(updatedDates),
      lastCompleted: date,
      updatedAt: new Date().toISOString()
    };

    // Update store
    this.store.habits.set(habitId, updatedHabit);
    await this.saveToStorage();

    // Try to sync with server
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            completed_date: date,
            created_at: new Date().toISOString()
          });

        if (error) throw error;
      } catch (error) {
        console.error('Failed to sync completion:', error);
        // Don't throw - we've already updated local state
      }
    }
  }

  private async unmarkHabitComplete(habitId: string, date: string): Promise<void> {
    const habit = this.store.habits.get(habitId);
    if (!habit) throw new Error('Habit not found');

    // Update local state
    const updatedDates = habit.completedDates.filter(d => d !== date);
    const updatedHabit = {
      ...habit,
      completedDates: updatedDates,
      currentStreak: this.calculateStreak(updatedDates),
      lastCompleted: updatedDates.length > 0 ? updatedDates[updatedDates.length - 1] : null,
      updatedAt: new Date().toISOString()
    };

    // Update store
    this.store.habits.set(habitId, updatedHabit);
    await this.saveToStorage();

    // Try to sync with server
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('habit_completions')
          .delete()
          .eq('habit_id', habitId)
          .eq('completed_date', date);

        if (error) throw error;
      } catch (error) {
        console.error('Failed to sync completion removal:', error);
        // Don't throw - we've already updated local state
      }
    }
  }

  private calculateStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If not completed today or yesterday, streak is broken
    if (sortedDates[0] !== today && sortedDates[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i - 1]);
      const prev = new Date(sortedDates[i]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private updateStoreWithRemoteData(
    remoteHabits: any[], 
    completions: { habit_id: string; completed_date: string }[]
  ): void {
    // Group completions by habit
    const completionsByHabit = completions.reduce((acc, completion) => {
      if (!acc[completion.habit_id]) {
        acc[completion.habit_id] = [];
      }
      acc[completion.habit_id].push(completion.completed_date);
      return acc;
    }, {} as Record<string, string[]>);

    // Update habits in store
    remoteHabits.forEach(remoteHabit => {
      const habitCompletions = completionsByHabit[remoteHabit.id] || [];
      const existingHabit = this.store.habits.get(remoteHabit.id);

      // Merge remote and local data
      const mergedHabit = {
        ...remoteHabit,
        completedDates: [...new Set([
          ...(existingHabit?.completedDates || []),
          ...habitCompletions
        ])].sort(),
        pendingOperations: existingHabit?.pendingOperations || [],
        isOffline: false
      };

      // Update streaks
      mergedHabit.currentStreak = this.calculateStreak(mergedHabit.completedDates);
      mergedHabit.longestStreak = this.calculateLongestStreak(mergedHabit.completedDates);

      this.store.habits.set(remoteHabit.id, mergedHabit as HabitWithCompletedDates);
    });
  }

  private calculateLongestStreak(dates: string[]): number {
    if (dates.length === 0) return 0;

    const sortedDates = [...dates].sort();
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const curr = new Date(sortedDates[i]);
      const prev = new Date(sortedDates[i - 1]);
      const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  }

  // Public API
  public async markHabit(habitId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.queueOperation('MARK', habitId, { date: today });
  }

  public async unmarkHabit(habitId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await this.queueOperation('UNMARK', habitId, { date: today });
  }

  public getHabit(habitId: string): HabitWithCompletedDates | undefined {
    return this.store.habits.get(habitId);
  }

  public getAllHabits(): HabitWithCompletedDates[] {
    return Array.from(this.store.habits.values());
  }

  public isHabitMarkedToday(habitId: string): boolean {
    const habit = this.store.habits.get(habitId);
    if (!habit) return false;

    const today = new Date().toISOString().split('T')[0];
    return habit.completedDates.includes(today);
  }
}

export const habitCore = new HabitCoreService(); 
