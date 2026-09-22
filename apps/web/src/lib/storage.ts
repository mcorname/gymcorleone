import type { 
  Exercise, 
  WorkoutSession, 
  WorkoutSet, 
  PersonalRecord, 
  Routine, 
  BodyMeasurement, 
  Machine, 
  Gym,
  GymEquipmentItem,
  User,
  AccessCode,
  AuthSession
} from '@gym/types';
import { CANONICAL_MACHINES } from '@gym/ai';
import { 
  hashString, 
  hashPassword, 
  generateSalt, 
  normalizeAccessCode, 
  generateRandomAccessCode 
} from './crypto';

const KEYS = {
  EXERCISES: 'gym_progress_exercises',
  ACTIVE_SESSION: 'gym_progress_active_session',
  DRAFT_WORKOUT: 'gym_progress_draft_workout',
  WORKOUT_HISTORY: 'gym_progress_workout_history',
  PERSONAL_RECORDS: 'gym_progress_prs',
  ROUTINES: 'gym_progress_routines',
  BODY_MEASUREMENTS: 'gym_progress_body_measurements',
  MY_GYM: 'gym_progress_my_gym',
  LAST_REST_TIMER: 'gym_progress_rest_timer',
  // Claves del sistema de autenticación y códigos de acceso
  USERS: 'gym_progress_users',
  ACCESS_CODES: 'gym_progress_access_codes',
  CURRENT_SESSION: 'gym_progress_current_session'
};

// Rutinas predeterminadas de calidad profesional
export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-ppl',
    title: 'Push Pull Legs (Fuerza & Hipertrofia)',
    description: 'División clásica de 3 a 6 días por semana optimizada para recuperación muscular y sobrecarga progresiva.',
    category: 'PPL',
    isTemplate: true,
    days: [
      {
        id: 'day-push',
        name: 'Día 1: Empuje (Pecho, Hombro, Tríceps)',
        exercises: [
          {
            id: 're-1',
            exerciseId: '0025',
            targetSets: 4,
            minReps: 6,
            maxReps: 10,
            targetRir: 2,
            restSeconds: 120,
            notes: 'Enfócate en pausa de 1 segundo en el pecho.',
            exercise: {
              id: '0025',
              name: 'Barbell Bench Press',
              nameEs: 'Press de Banca con Barra',
              category: 'chest',
              bodyPart: 'chest',
              equipment: 'barbell',
              target: 'pectorals',
              muscleGroup: 'pecho',
              secondaryMuscles: ['tríceps', 'deltoides anterior'],
              instructionsEs: ['Acuéstate en el banco, baja la barra al esternón y empuja con fuerza controlada.'],
              instructionStepsEs: ['Coloca los pies planos en el suelo', 'Retrae las escápulas', 'Desciende en 2 segundos', 'Empuja sin despegar los hombros'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0025-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0025-2gPfomN.gif'
            }
          },
          {
            id: 're-2',
            exerciseId: '0047',
            targetSets: 3,
            minReps: 8,
            maxReps: 12,
            targetRir: 1,
            restSeconds: 90,
            exercise: {
              id: '0047',
              name: 'Dumbbell Incline Chest Press',
              nameEs: 'Press Inclinado con Mancuernas',
              category: 'chest',
              bodyPart: 'chest',
              equipment: 'dumbbell',
              target: 'pectorals',
              muscleGroup: 'pecho',
              secondaryMuscles: ['deltoides anterior'],
              instructionsEs: ['Banco a 30 grados, empuja verticalmente sintiendo la parte clavicular.'],
              instructionStepsEs: ['Banco inclinado a 30-45 grados', 'Alinea los codos a 45 grados del torso', 'Empuja hasta casi juntar las mancuernas arriba'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0047-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0047-2gPfomN.gif'
            }
          },
          {
            id: 're-3',
            exerciseId: '0032',
            targetSets: 3,
            minReps: 10,
            maxReps: 15,
            targetRir: 1,
            restSeconds: 60,
            exercise: {
              id: '0032',
              name: 'Cable Triceps Pushdown',
              nameEs: 'Extensiones de Tríceps en Polea',
              category: 'upper arms',
              bodyPart: 'upper arms',
              equipment: 'cable',
              target: 'triceps',
              muscleGroup: 'triceps',
              secondaryMuscles: ['antebrazo'],
              instructionsEs: ['Codos pegados al cuerpo, extiende hacia abajo contrayendo al máximo.'],
              instructionStepsEs: ['Fija los codos a los costados', 'Empuja la cuerda o barra hacia abajo', 'Controla la subida hasta 90 grados'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0032-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0032-2gPfomN.gif'
            }
          }
        ]
      },
      {
        id: 'day-pull',
        name: 'Día 2: Tracción (Espalda, Bíceps)',
        exercises: [
          {
            id: 're-4',
            exerciseId: '0015',
            targetSets: 4,
            minReps: 8,
            maxReps: 12,
            targetRir: 2,
            restSeconds: 90,
            exercise: {
              id: '0015',
              name: 'Cable Lat Pulldown',
              nameEs: 'Jalón al Pecho en Polea',
              category: 'back',
              bodyPart: 'back',
              equipment: 'cable',
              target: 'lats',
              muscleGroup: 'espalda',
              secondaryMuscles: ['bíceps', 'braquial'],
              instructionsEs: ['Sujeta con agarre amplio, jala la barra hacia la parte superior del pecho.'],
              instructionStepsEs: ['Espalda recta con leve inclinación atrás', 'Tracciona con los codos hacia abajo', 'Pausa en contracción y sube lento'],
              image: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/images/0015-2gPfomN.jpg',
              gifUrl: 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/videos/0015-2gPfomN.gif'
            }
          }
        ]
      }
    ]
  },
  {
    id: 'routine-upper-lower',
    title: 'Upper / Lower (Torso / Pierna)',
    description: 'Excelente frecuencia 2x para ganancias equilibradas en 4 sesiones semanales.',
    category: 'Torso Pierna',
    isTemplate: true,
    days: [
      {
        id: 'day-upper-1',
        name: 'Torso A (Fuerza)',
        exercises: []
      },
      {
        id: 'day-lower-1',
        name: 'Pierna A (Cuádriceps & Gemelos)',
        exercises: []
      }
    ]
  }
];

// Récords personales iniciales de demostración
export const INITIAL_PRS: PersonalRecord[] = [
  {
    id: 'pr-1',
    exerciseId: '0025',
    exerciseName: 'Press de Banca con Barra',
    recordType: 'max_weight',
    recordValue: 80,
    achievedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'pr-2',
    exerciseId: '0025',
    exerciseName: 'Press de Banca con Barra',
    recordType: 'max_1rm_estimated',
    recordValue: 96,
    achievedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Historial inicial de sesiones
export const INITIAL_HISTORY: WorkoutSession[] = [
  {
    id: 'ws-prev-1',
    title: 'Push Day (Empuje)',
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    durationSeconds: 3480, // 58 min
    totalVolumeKg: 8450,
    status: 'completed',
    exercises: [
      {
        id: 'we-1',
        sessionId: 'ws-prev-1',
        exerciseId: '0025',
        order: 1,
        exercise: DEFAULT_ROUTINES[0].days[0].exercises[0].exercise,
        sets: [
          {
            id: 's-1',
            workoutExerciseId: 'we-1',
            setNumber: 1,
            setType: 'normal',
            weightKg: 70,
            reps: 10,
            rir: 2,
            isCompleted: true,
            volumeKg: 700,
            estimated1rmKg: 93.33
          },
          {
            id: 's-2',
            workoutExerciseId: 'we-1',
            setNumber: 2,
            setType: 'normal',
            weightKg: 70,
            reps: 9,
            rir: 1,
            isCompleted: true,
            volumeKg: 630,
            estimated1rmKg: 91
          },
          {
            id: 's-3',
            workoutExerciseId: 'we-1',
            setNumber: 3,
            setType: 'normal',
            weightKg: 70,
            reps: 8,
            rir: 1,
            isCompleted: true,
            volumeKg: 560,
            estimated1rmKg: 88.67
          }
        ]
      }
    ]
  },
  {
    id: 'ws-prev-2',
    title: 'Upper Body (Torso)',
    startedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 4 + 3720000).toISOString(),
    durationSeconds: 3720, // 62 min
    totalVolumeKg: 9120,
    status: 'completed',
    exercises: []
  }
];

// 4 Códigos de Invitación Iniciales (Almacenados únicamente como hashes criptográficos SHA-256)
export const INITIAL_ACCESS_CODES: AccessCode[] = [
  {
    id: 'code-1',
    codeHash: '06d63aac5135f1541d0250aee92b0daee92b3fbdbd721dfd2836b05cf97dfd88',
    codeHint: 'Invitación #1',
    status: 'ACTIVE',
    createdAt: '2026-09-22T00:00:00.000Z',
    expiresAt: null,
    usedAt: null,
    usedByUserId: null,
    createdBy: 'admin',
    notes: 'Código de acceso inicial 1/4'
  },
  {
    id: 'code-2',
    codeHash: 'd673c5fb50ba904677095c0e9e25d1696d992e24edd4a1c41875d4f23c59fb16',
    codeHint: 'Invitación #2',
    status: 'ACTIVE',
    createdAt: '2026-09-22T00:00:00.000Z',
    expiresAt: null,
    usedAt: null,
    usedByUserId: null,
    createdBy: 'admin',
    notes: 'Código de acceso inicial 2/4'
  },
  {
    id: 'code-3',
    codeHash: 'a304fdff31107456ea6785099b99dc3ea67d7b6ccf56f3adbbf9872d58ace097',
    codeHint: 'Invitación #3',
    status: 'ACTIVE',
    createdAt: '2026-09-22T00:00:00.000Z',
    expiresAt: null,
    usedAt: null,
    usedByUserId: null,
    createdBy: 'admin',
    notes: 'Código de acceso inicial 3/4'
  },
  {
    id: 'code-4',
    codeHash: '2a6bfe10d63b8fac9a5799aa7f6f44e1b77d876ce01fa5820d43582af4e6d53d',
    codeHint: 'Invitación #4',
    status: 'ACTIVE',
    createdAt: '2026-09-22T00:00:00.000Z',
    expiresAt: null,
    usedAt: null,
    usedByUserId: null,
    createdBy: 'admin',
    notes: 'Código de acceso inicial 4/4'
  }
];

// Usuario inicial (Mario Castro)
export const DEFAULT_USERS: User[] = [
  {
    id: 'user-mario',
    name: 'Mario Castro',
    email: 'mario@email.com',
    passwordHash: '90501e416caf448e3b533978729018c20a7446a7cf30d512c71a8a7f8caa32b5',
    salt: 'mario-salt',
    status: 'ACTIVE',
    createdAt: '2026-09-01T00:00:00.000Z',
    heightCm: 178,
    weightKg: 76.8,
    bodyFatPercentage: 15.2,
    targetGoal: 'Fuerza & Hipertrofia',
    level: 'Intermedio'
  }
];

export class AppStorage {
  private static safeSetItem(key: string, value: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err: unknown) {
      if (err instanceof DOMException && (
        err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014
      )) {
        console.error(`[AppStorage] Alerta: Cuota de almacenamiento local excedida (QuotaExceededError) al guardar la clave "${key}".`);
      } else {
        console.error(`[AppStorage] Error al persistir en localStorage para la clave "${key}":`, err);
      }
      return false;
    }
  }

  private static safeRemoveItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[AppStorage] Error al eliminar clave "${key}" de localStorage:`, err);
    }
  }

  /**
   * Helper para aislar datos por usuario en localStorage.
   * Si no se especifica userId, utiliza el del usuario actualmente autenticado.
   */
  private static getUserKey(baseKey: string, userId?: string): string {
    const uId = userId || this.getCurrentUserId();
    return uId ? `${baseKey}_${uId}` : baseKey;
  }

  // ============================================================================
  // GESTIÓN DE USUARIOS Y AUTENTICACIÓN
  // ============================================================================

  public static getUsers(): User[] {
    if (typeof window === 'undefined') return DEFAULT_USERS;
    try {
      const stored = localStorage.getItem(KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer usuarios:', e);
    }
    return DEFAULT_USERS;
  }

  public static saveUser(user: User): void {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.safeSetItem(KEYS.USERS, JSON.stringify(users));
  }

  public static getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === id) || null;
  }

  public static getUserByEmail(email: string): User | null {
    const norm = email.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(u => u.email.toLowerCase() === norm) || null;
  }

  public static getCurrentSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(KEYS.CURRENT_SESSION);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer sesión actual:', e);
    }
    return null;
  }

  public static setCurrentSession(session: AuthSession | null): void {
    if (session) {
      this.safeSetItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
    } else {
      this.safeRemoveItem(KEYS.CURRENT_SESSION);
    }
  }

  public static getCurrentUserId(): string | null {
    const session = this.getCurrentSession();
    return session?.userId || null;
  }

  public static getCurrentUser(): User | null {
    const userId = this.getCurrentUserId();
    if (!userId) return null;
    return this.getUserById(userId);
  }

  /**
   * Registro de un nuevo usuario con estado inicial PENDING_ACCESS.
   * Requiere únicamente Nombre, Email y Contraseña.
   */
  public static async registerUser(
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      return { success: false, error: 'El nombre es obligatorio.' };
    }
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: 'Introduce un correo electrónico válido.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }

    // Verificar unicidad de correo
    if (this.getUserByEmail(trimmedEmail)) {
      return { success: false, error: 'Ya existe una cuenta con este correo.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const userId = 'user-' + Date.now();

    const newUser: User = {
      id: userId,
      name: trimmedName,
      email: trimmedEmail,
      passwordHash,
      salt,
      status: 'PENDING_ACCESS', // Requiere activación por código
      createdAt: new Date().toISOString()
    };

    this.saveUser(newUser);

    // Iniciar sesión inmediatamente (en estado PENDING_ACCESS)
    const session: AuthSession = {
      userId: newUser.id,
      token: 'tok_' + Date.now(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    this.setCurrentSession(session);

    return { success: true, user: newUser };
  }

  /**
   * Iniciar sesión de usuario existente.
   */
  public static async loginUser(
    email: string, 
    password: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const user = this.getUserByEmail(trimmedEmail);

    if (!user) {
      return { success: false, error: 'Credenciales incorrectas.' };
    }
    if (user.status === 'SUSPENDED') {
      return { success: false, error: 'Esta cuenta ha sido suspendida.' };
    }

    // Si tiene passwordHash guardado, verificarlo
    if (user.passwordHash) {
      const computedHash = await hashPassword(password, user.salt);
      if (computedHash !== user.passwordHash) {
        return { success: false, error: 'Credenciales incorrectas.' };
      }
    }

    const session: AuthSession = {
      userId: user.id,
      token: 'tok_' + Date.now(),
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    this.setCurrentSession(session);

    return { success: true, user };
  }

  /**
   * Validación y activación de código de acceso para un usuario.
   * Transforma PENDING_ACCESS -> ACTIVE y marca el código como USED.
   */
  public static async activateAccessCode(
    userId: string, 
    code: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const user = this.getUserById(userId);
    if (!user) {
      return { success: false, error: 'Usuario no encontrado.' };
    }

    const normalized = normalizeAccessCode(code);
    if (!normalized) {
      return { success: false, error: 'Código de acceso no válido.' };
    }

    const codeHash = await hashString(normalized);
    const codes = this.getAccessCodes();
    const matchedCode = codes.find(c => c.codeHash === codeHash);

    // Validar existencia y que esté ACTIVE (no usado, no revocado, no expirado)
    if (!matchedCode || matchedCode.status !== 'ACTIVE') {
      return { success: false, error: 'Código de acceso no válido.' };
    }

    // Marcar código como USADO
    matchedCode.status = 'USED';
    matchedCode.usedAt = new Date().toISOString();
    matchedCode.usedByUserId = user.id;
    matchedCode.usedByUserName = user.name;
    this.saveAccessCodes(codes);

    // Activar usuario
    user.status = 'ACTIVE';
    user.accessCodeId = matchedCode.id;
    user.updatedAt = new Date().toISOString();
    this.saveUser(user);

    return { success: true, user };
  }

  /**
   * Cerrar sesión del usuario actual sin borrar sus datos históricos.
   */
  public static logout(): void {
    this.setCurrentSession(null);
  }

  /**
   * Actualizar perfil de usuario.
   * Si se actualiza peso o grasa corporal, crea un nuevo registro histórico en BodyMeasurement
   * garantizando que nunca se sobrescriban mediciones anteriores.
   */
  public static updateUserProfile(userId: string, data: Partial<User>): User | null {
    const user = this.getUserById(userId);
    if (!user) return null;

    // Actualizar histórico si hay cambio en peso o grasa corporal
    if (data.weightKg !== undefined || data.bodyFatPercentage !== undefined) {
      const newWeight = data.weightKg !== undefined ? data.weightKg : user.weightKg;
      const newFat = data.bodyFatPercentage !== undefined ? data.bodyFatPercentage : user.bodyFatPercentage;

      if (newWeight && newWeight > 0) {
        const entry: BodyMeasurement = {
          id: 'bm-' + Date.now(),
          userId,
          measuredAt: new Date().toISOString().split('T')[0],
          weightKg: newWeight,
          heightCm: data.heightCm !== undefined ? data.heightCm : user.heightCm,
          bodyFatPercentage: newFat,
          notes: 'Registro generado desde Mi Perfil'
        };
        this.saveMeasurement(entry, userId);
      }
    }

    const updatedUser: User = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString()
    };
    this.saveUser(updatedUser);
    return updatedUser;
  }

  // ============================================================================
  // CÓDIGOS DE ACCESO / INVITACIONES
  // ============================================================================

  public static getAccessCodes(): AccessCode[] {
    if (typeof window === 'undefined') return INITIAL_ACCESS_CODES;
    try {
      const stored = localStorage.getItem(KEYS.ACCESS_CODES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer códigos de acceso:', e);
    }
    // Inicializar códigos predeterminados si no existen
    this.safeSetItem(KEYS.ACCESS_CODES, JSON.stringify(INITIAL_ACCESS_CODES));
    return INITIAL_ACCESS_CODES;
  }

  public static saveAccessCodes(codes: AccessCode[]): void {
    this.safeSetItem(KEYS.ACCESS_CODES, JSON.stringify(codes));
  }

  /**
   * Generar nuevo código de acceso para administración futura.
   * Devuelve el código en texto plano (para entrega) y almacena su hash seguro.
   */
  public static async generateNewAccessCode(notes?: string): Promise<{ plainCode: string; accessCode: AccessCode }> {
    const plainCode = generateRandomAccessCode();
    const codeHash = await hashString(plainCode);
    const codes = this.getAccessCodes();

    const accessCode: AccessCode = {
      id: 'code-' + Date.now(),
      codeHash,
      codeHint: `Invitación #${codes.length + 1}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      expiresAt: null,
      usedAt: null,
      usedByUserId: null,
      createdBy: 'admin',
      notes: notes || `Código generado administrativamente`
    };

    codes.push(accessCode);
    this.saveAccessCodes(codes);

    return { plainCode, accessCode };
  }

  // ============================================================================
  // CATÁLOGO DE EJERCICIOS (GLOBAL COMPARTIDO)
  // ============================================================================

  public static getExercises(): Exercise[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(KEYS.EXERCISES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer ejercicios de localStorage:', e);
    }
    return [];
  }

  public static setExercises(exercises: Exercise[]): void {
    this.safeSetItem(KEYS.EXERCISES, JSON.stringify(exercises));
  }

  // ============================================================================
  // SESIÓN ACTIVA Y BORRADOR (AISLADOS POR USUARIO)
  // ============================================================================

  public static getActiveSession(userId?: string): WorkoutSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = this.getUserKey(KEYS.ACTIVE_SESSION, userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed && 
          typeof parsed === 'object' && 
          parsed.id && 
          Array.isArray(parsed.exercises) &&
          parsed.status === 'in_progress' &&
          typeof parsed.startedAt === 'string' &&
          parsed.startedAt.length > 0
        ) {
          return parsed as WorkoutSession;
        }
      }
    } catch (e) {
      console.warn('[AppStorage] Error o formato inválido al leer sesión activa:', e);
    }
    return null;
  }

  public static setActiveSession(session: WorkoutSession | null, userId?: string): void {
    const key = this.getUserKey(KEYS.ACTIVE_SESSION, userId);
    if (session && session.status === 'in_progress' && session.startedAt) {
      this.safeSetItem(key, JSON.stringify(session));
    } else {
      this.safeRemoveItem(key);
    }
  }

  public static hasActiveWorkout(userId?: string): boolean {
    return this.getActiveSession(userId) !== null;
  }

  public static getDraftWorkout(userId?: string): WorkoutSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const key = this.getUserKey(KEYS.DRAFT_WORKOUT, userId);
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object' && parsed.id && Array.isArray(parsed.exercises)) {
          return parsed as WorkoutSession;
        }
      }
    } catch (e) {
      console.warn('[AppStorage] Error al leer borrador de entrenamiento:', e);
    }
    return null;
  }

  public static setDraftWorkout(draft: WorkoutSession | null, userId?: string): void {
    const key = this.getUserKey(KEYS.DRAFT_WORKOUT, userId);
    if (draft) {
      this.safeSetItem(key, JSON.stringify(draft));
    } else {
      this.safeRemoveItem(key);
    }
  }

  // ============================================================================
  // HISTORIAL DE SESIONES (AISLADO POR USUARIO)
  // ============================================================================

  public static getHistory(userId?: string): WorkoutSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const key = this.getUserKey(KEYS.WORKOUT_HISTORY, userId);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      // Compatibilidad hacia atrás para Mario si aún no tiene clave con prefijo
      const currentUId = userId || this.getCurrentUserId();
      if (currentUId === 'user-mario' || !currentUId) {
        const legacy = localStorage.getItem(KEYS.WORKOUT_HISTORY);
        if (legacy) {
          const parsed = JSON.parse(legacy);
          this.safeSetItem(key, legacy);
          return parsed;
        }
        return INITIAL_HISTORY;
      }
    } catch (e) {
      console.warn('[AppStorage] Error al leer historial:', e);
    }
    return [];
  }

  public static addCompletedWorkout(session: WorkoutSession, userId?: string): void {
    const history = this.getHistory(userId);
    const uId = userId || this.getCurrentUserId() || undefined;
    const sessionWithUser: WorkoutSession = {
      ...session,
      userId: uId
    };
    history.unshift(sessionWithUser);
    const key = this.getUserKey(KEYS.WORKOUT_HISTORY, userId);
    this.safeSetItem(key, JSON.stringify(history));
  }

  // ============================================================================
  // RÉCORDS PERSONALES (AISLADOS POR USUARIO)
  // ============================================================================

  public static getPRs(userId?: string): PersonalRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const key = this.getUserKey(KEYS.PERSONAL_RECORDS, userId);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      const currentUId = userId || this.getCurrentUserId();
      if (currentUId === 'user-mario' || !currentUId) {
        const legacy = localStorage.getItem(KEYS.PERSONAL_RECORDS);
        if (legacy) return JSON.parse(legacy);
        return INITIAL_PRS;
      }
    } catch (e) {
      console.warn('[AppStorage] Error al leer PRs:', e);
    }
    return [];
  }

  public static savePR(pr: PersonalRecord, userId?: string): void {
    const prs = this.getPRs(userId);
    const uId = userId || this.getCurrentUserId() || undefined;
    const prWithUser: PersonalRecord = { ...pr, userId: uId };

    const index = prs.findIndex(p => p.exerciseId === pr.exerciseId && p.recordType === pr.recordType);
    if (index >= 0) {
      prs[index] = prWithUser;
    } else {
      prs.unshift(prWithUser);
    }
    const key = this.getUserKey(KEYS.PERSONAL_RECORDS, userId);
    this.safeSetItem(key, JSON.stringify(prs));
  }

  // ============================================================================
  // RUTINAS (AISLADAS POR USUARIO)
  // ============================================================================

  public static getRoutines(userId?: string): Routine[] {
    const uId = userId || this.getCurrentUserId() || undefined;
    if (typeof window === 'undefined') return DEFAULT_ROUTINES;
    try {
      const key = this.getUserKey(KEYS.ROUTINES, userId);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      // Si es un usuario nuevo o no tiene rutinas guardadas, clonar las plantillas iniciales
      const defaultUserRoutines = DEFAULT_ROUTINES.map(r => ({
        ...r,
        id: `${r.id}-${uId || 'default'}`,
        userId: uId
      }));
      this.safeSetItem(key, JSON.stringify(defaultUserRoutines));
      return defaultUserRoutines;
    } catch (e) {
      console.warn('[AppStorage] Error al leer rutinas:', e);
    }
    return DEFAULT_ROUTINES;
  }

  public static saveRoutine(routine: Routine, userId?: string): void {
    const list = this.getRoutines(userId);
    const uId = userId || this.getCurrentUserId() || undefined;
    const routineWithUser: Routine = { ...routine, userId: uId };

    const index = list.findIndex(r => r.id === routine.id);
    if (index >= 0) list[index] = routineWithUser;
    else list.push(routineWithUser);

    const key = this.getUserKey(KEYS.ROUTINES, userId);
    this.safeSetItem(key, JSON.stringify(list));
  }

  // ============================================================================
  // MEDIDAS CORPORALES (HISTORIAL AISLADO POR USUARIO)
  // ============================================================================

  public static getMeasurements(userId?: string): BodyMeasurement[] {
    const currentUId = userId || this.getCurrentUserId();
    const defaults: BodyMeasurement[] = [
      {
        id: 'bm-1',
        userId: currentUId || 'user-mario',
        measuredAt: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
        weightKg: 78.2,
        bodyFatPercentage: 16.5,
        heightCm: 178,
        waistCm: 84,
        chestCm: 102,
        bicepRightCm: 37.5,
        notes: 'Inicio de definición limpia'
      },
      {
        id: 'bm-2',
        userId: currentUId || 'user-mario',
        measuredAt: new Date().toISOString().split('T')[0],
        weightKg: 76.8,
        bodyFatPercentage: 15.2,
        heightCm: 178,
        waistCm: 82,
        chestCm: 103,
        bicepRightCm: 37.8,
        notes: 'Pérdida de grasa manteniendo masa muscular'
      }
    ];

    if (typeof window === 'undefined') return defaults;
    try {
      const key = this.getUserKey(KEYS.BODY_MEASUREMENTS, userId);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);

      if (currentUId === 'user-mario' || !currentUId) {
        const legacy = localStorage.getItem(KEYS.BODY_MEASUREMENTS);
        if (legacy) return JSON.parse(legacy);
        return defaults;
      }
    } catch (e) {
      console.warn('[AppStorage] Error al leer medidas corporales:', e);
    }
    return [];
  }

  /**
   * Guarda un nuevo registro de medidas asegurando almacenamiento histórico no destructivo.
   */
  public static saveMeasurement(measurement: BodyMeasurement, userId?: string): void {
    const list = this.getMeasurements(userId);
    const uId = userId || this.getCurrentUserId() || undefined;
    const itemWithUser: BodyMeasurement = {
      ...measurement,
      userId: uId
    };
    list.unshift(itemWithUser);
    const key = this.getUserKey(KEYS.BODY_MEASUREMENTS, userId);
    this.safeSetItem(key, JSON.stringify(list));
  }

  // ============================================================================
  // MI GIMNASIO (AISLADO POR USUARIO)
  // ============================================================================

  public static getMyGym(userId?: string): Gym {
    const uId = userId || this.getCurrentUserId() || undefined;
    const defaultGym: Gym = {
      id: 'gym-1',
      userId: uId,
      name: 'SmartFit Centro',
      isActive: true,
      equipment: [
        {
          id: 'eq-1',
          gymId: 'gym-1',
          machineId: 'm-chest-press',
          customLabel: 'Prensa de Pecho de Placas',
          equipmentType: 'leverage machine',
          identifiedViaAi: true,
          isAvailable: true,
          machine: CANONICAL_MACHINES[0]
        },
        {
          id: 'eq-2',
          gymId: 'gym-1',
          machineId: 'm-lat-pulldown',
          customLabel: 'Jalón Dorsal Polea Alta',
          equipmentType: 'cable',
          identifiedViaAi: false,
          isAvailable: true,
          machine: CANONICAL_MACHINES[1]
        },
        {
          id: 'eq-3',
          gymId: 'gym-1',
          machineId: 'm-leg-press',
          customLabel: 'Prensa 45 Grados',
          equipmentType: 'plate-loaded',
          identifiedViaAi: true,
          isAvailable: true,
          machine: CANONICAL_MACHINES[2]
        },
        {
          id: 'eq-4',
          gymId: 'gym-1',
          machineId: 'm-smith-machine',
          customLabel: 'Smith Machine Multipower',
          equipmentType: 'smith',
          identifiedViaAi: false,
          isAvailable: true,
          machine: CANONICAL_MACHINES[3]
        }
      ]
    };

    if (typeof window === 'undefined') return defaultGym;
    try {
      const key = this.getUserKey(KEYS.MY_GYM, userId);
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('[AppStorage] Error al leer mi gimnasio:', e);
    }
    return defaultGym;
  }

  public static saveGymEquipment(item: GymEquipmentItem, userId?: string): void {
    const gym = this.getMyGym(userId);
    const existing = gym.equipment.findIndex(e => e.machineId === item.machineId);
    if (existing >= 0) {
      gym.equipment[existing] = item;
    } else {
      gym.equipment.unshift(item);
    }
    const key = this.getUserKey(KEYS.MY_GYM, userId);
    this.safeSetItem(key, JSON.stringify(gym));
  }
}