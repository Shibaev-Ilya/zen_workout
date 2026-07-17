'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrainingStore } from '@/lib/store';
import styles from './page.module.scss';

function mapAuthError(message: string): string {
  const map: Record<string, string> = {
    'Login already taken': 'Этот логин уже занят',
    'Invalid login or password': 'Неверный логин или пароль',
    'Login must be 3–64 chars: letters, digits, _ or -':
      'Логин: 3–64 символа (латиница, цифры, _ или -)',
    'Password must be at least 6 characters':
      'Пароль не меньше 6 символов',
    'Missing required fields: login, password': 'Введите логин и пароль',
    'Network error': 'Не удалось подключиться к серверу',
  };
  return map[message] ?? message;
}

function AuthScreen() {
  const register = useTrainingStore((s) => s.register);
  const loginUser = useTrainingStore((s) => s.loginUser);
  const enterGuestMode = useTrainingStore((s) => s.enterGuestMode);
  const [mode, setMode] = useState<'register' | 'login' | null>(null);
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDev = process.env.NODE_ENV === 'development';

  const resetForm = () => {
    setLoginValue('');
    setPassword('');
    setPasswordRepeat('');
    setError('');
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordRepeat) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await register(loginValue.trim(), password);
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : 'Ошибка'));
    }
    setLoading(false);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(loginValue.trim(), password);
    } catch (err) {
      setError(mapAuthError(err instanceof Error ? err.message : 'Ошибка'));
    }
    setLoading(false);
  };

  if (!mode) {
    return (
      <div className={styles.authScreen}>
        <h1 className={styles.title}>Zen Workout</h1>
        <p className={styles.subtitle}>Дневник тренировок</p>
        <div className={styles.authButtons}>
          <Button size="lg" onClick={() => setMode('register')}>
            Регистрация
          </Button>
          <Button size="lg" variant="outline" onClick={() => setMode('login')}>
            Вход
          </Button>
          {isDev && (
            <Button size="lg" variant="ghost" onClick={enterGuestMode}>
              Продолжить локально
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <form className={styles.authScreen} onSubmit={handleRegister}>
        <h1 className={styles.title}>Регистрация</h1>
        <p className={styles.subtitle}>Создайте аккаунт для синхронизации</p>
        <div className={styles.authForm}>
          <Input
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            placeholder="Логин"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Input
            type="password"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            placeholder="Повтор пароля"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button size="lg" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Создание...' : 'Зарегистрироваться'}
        </Button>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => {
            setMode(null);
            resetForm();
          }}
        >
          ← Назад
        </button>
      </form>
    );
  }

  return (
    <form className={styles.authScreen} onSubmit={handleLogin}>
      <h1 className={styles.title}>Вход</h1>
      <p className={styles.subtitle}>Войдите в свой аккаунт</p>
      <div className={styles.authForm}>
        <Input
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="Логин"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <Button size="lg" type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Вход...' : 'Войти'}
      </Button>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => {
          setMode(null);
          resetForm();
        }}
      >
        ← Назад
      </button>
    </form>
  );
}

export default function HomePage() {
  const router = useRouter();
  const startTraining = useTrainingStore((s) => s.startTraining);
  const isActive = useTrainingStore((s) => s.isActive);
  const token = useTrainingStore((s) => s.token);
  const login = useTrainingStore((s) => s.login);
  const guestMode = useTrainingStore((s) => s.guestMode);
  const serverAvailable = useTrainingStore((s) => s.serverAvailable);
  const loadFromServer = useTrainingStore((s) => s.loadFromServer);
  const logout = useTrainingStore((s) => s.logout);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useTrainingStore.persist.onFinishHydration(() => {
      queueMicrotask(() => setHydrated(true));
    });
    if (useTrainingStore.persist.hasHydrated()) {
      queueMicrotask(() => setHydrated(true));
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (hydrated && token) {
      loadFromServer();
    }
  }, [hydrated, token, loadFromServer]);

  const handleStart = () => {
    if (!isActive) {
      startTraining();
    }
    router.push('/training');
  };

  if (!hydrated) return null;

  if (!token && !guestMode) {
    return (
      <main className={styles.page}>
        <div className={`${styles.container} container`}>
          <AuthScreen />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={`${styles.container} container`}>
        <h1 className={styles.title}>
          Zen Workout
        </h1>

        {guestMode ? (
          <p className={styles.userLogin}>Локальный режим</p>
        ) : (
          login && <p className={styles.userLogin}>{login}</p>
        )}

        {!serverAvailable && (
          <p className={styles.warning}>Сервер недоступен — данные не синхронизируются</p>
        )}

        <Button
          size="lg"
          onClick={handleStart}
          className={`${styles.startButton} animate-fade-in`}
        >
          {isActive ? 'Continue' : 'Start'}
        </Button>

        <button
          onClick={() => router.push('/history')}
          className={styles.historyLink}
        >
          Workout history
        </button>
        <button
          onClick={() => router.push('/analytics')}
          className={styles.historyLink}
        >
          Analytics
        </button>
        <button
          onClick={() => router.push('/repetition-maximum')}
          className={styles.historyLink}
        >
          Repetition Maximum
        </button>
        <button onClick={logout} className={styles.logoutLink} type="button">
          Выйти
        </button>
      </div>
    </main>
  );
}
