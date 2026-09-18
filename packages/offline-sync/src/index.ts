export type SyncStatus = 'saved_local' | 'syncing' | 'synced' | 'offline';

export interface QueuedMutation<T = unknown> {
  id: string;
  clientTimestamp: string;
  entityType: 'workout_set' | 'workout_session' | 'routine' | 'body_measurement' | 'gym_equipment';
  operation: 'insert' | 'update' | 'delete';
  payload: T;
  status: 'pending' | 'syncing' | 'synced' | 'error';
  retryCount: number;
}

const STORAGE_KEYS = {
  MUTATION_QUEUE: 'gym_progress_sync_queue',
  ACTIVE_SESSION: 'gym_progress_active_session',
  WORKOUT_HISTORY: 'gym_progress_workout_history',
  PERSONAL_RECORDS: 'gym_progress_prs',
  ROUTINES: 'gym_progress_routines',
  BODY_MEASUREMENTS: 'gym_progress_body_measurements',
  GYM_EQUIPMENT: 'gym_progress_gym_equipment',
  USER_PROFILE: 'gym_progress_user_profile'
};

export class OfflineSyncManager {
  private isOnline: boolean = true;
  private statusListeners: Array<(status: SyncStatus) => void> = [];
  private currentStatus: SyncStatus = 'synced';

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      this.currentStatus = this.isOnline ? 'synced' : 'offline';
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }
  }

  public subscribeStatus(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(callback);
    callback(this.currentStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
    };
  }

  private setStatus(status: SyncStatus) {
    this.currentStatus = status;
    this.statusListeners.forEach(cb => cb(status));
  }

  private handleNetworkChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      this.setStatus('syncing');
      this.processQueue().then(() => {
        this.setStatus('synced');
      }).catch(() => {
        this.setStatus('saved_local');
      });
    } else {
      this.setStatus('offline');
    }
  }

  public enqueueMutation<T = unknown>(
    entityType: QueuedMutation['entityType'],
    operation: QueuedMutation['operation'],
    payload: T
  ): QueuedMutation<T> {
    const randomId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9) + '_' + Date.now();
    const mutation: QueuedMutation<T> = {
      id: `mut_${randomId}`,
      clientTimestamp: new Date().toISOString(),
      entityType,
      operation,
      payload,
      status: 'pending',
      retryCount: 0
    };

    const queue = this.getQueue();
    queue.push(mutation);
    this.saveQueue(queue);

    if (this.isOnline) {
      this.setStatus('syncing');
      setTimeout(() => {
        this.processQueue().then(() => this.setStatus('synced'));
      }, 300);
    } else {
      this.setStatus('saved_local');
    }

    return mutation;
  }

  public getQueue(): QueuedMutation[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MUTATION_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueuedMutation[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.MUTATION_QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Error saving sync queue to localStorage:', e);
    }
  }

  public async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    // Simulación de batch sync con backend / Supabase
    await new Promise(resolve => setTimeout(resolve, 600));

    // Limpiar mutaciones sincronizadas
    this.saveQueue([]);
  }

  // --- Helpers de Almacenamiento Local Directo ---

  public static getItem<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  public static setItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Error in setItem for key ' + key, e);
    }
  }

  public static KEYS = STORAGE_KEYS;
}

export const syncManager = new OfflineSyncManager();