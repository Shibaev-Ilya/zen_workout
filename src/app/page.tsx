'use client';

import { useEffect, useState, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTrainingStore } from '@/lib/store';
import styles from './page.module.scss';

function BrandTitle() {
  return (
    <div className={styles.brand}>
      <Image
        src="icon.webp"
        alt=""
        width={72}
        height={72}
        className={styles.logo}
        priority
      />
      <h1 className={styles.title}>Zen Workout</h1>
    </div>
  );
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
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(loginValue.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
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
      setError(err instanceof Error ? err.message : 'Error');
    }
    setLoading(false);
  };

  if (!mode) {
    return (
      <div className={styles.authScreen}>
        <BrandTitle />
        <p className={styles.subtitle}>Workout journal</p>
        <div className={styles.authButtons}>
          <Button size="lg" onClick={() => setMode('register')}>
            Sign up
          </Button>
          <Button size="lg" variant="outline" onClick={() => setMode('login')}>
            Log in
          </Button>
          {isDev && (
            <Button size="lg" variant="ghost" onClick={enterGuestMode}>
              Continue locally
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'register') {
    return (
      <form className={styles.authScreen} onSubmit={handleRegister}>
        <h1 className={styles.title}>Sign up</h1>
        <p className={styles.subtitle}>Create an account to sync your data</p>
        <div className={styles.authForm}>
          <Input
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
            placeholder="Login"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            required
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            autoComplete="new-password"
            required
            minLength={6}
          />
          <Input
            type="password"
            value={passwordRepeat}
            onChange={(e) => setPasswordRepeat(e.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <Button size="lg" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating...' : 'Sign up'}
        </Button>
        <button
          type="button"
          className={styles.backLink}
          onClick={() => {
            setMode(null);
            resetForm();
          }}
        >
          ← Back
        </button>
      </form>
    );
  }

  return (
    <form className={styles.authScreen} onSubmit={handleLogin}>
      <h1 className={styles.title}>Log in</h1>
      <p className={styles.subtitle}>Sign in to your account</p>
      <div className={styles.authForm}>
        <Input
          value={loginValue}
          onChange={(e) => setLoginValue(e.target.value)}
          placeholder="Login"
          autoComplete="username"
          autoCapitalize="off"
          spellCheck={false}
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          required
          minLength={6}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <Button size="lg" type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Signing in...' : 'Log in'}
      </Button>
      <button
        type="button"
        className={styles.backLink}
        onClick={() => {
          setMode(null);
          resetForm();
        }}
      >
        Back
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
        <BrandTitle />

        {guestMode ? (
          <p className={styles.userLogin}>Local mode</p>
        ) : (
          login && <p className={styles.userLogin}>{login}</p>
        )}

        {!serverAvailable && (
          <p className={styles.warning}>Server unavailable — data is not syncing</p>
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
          Log out
        </button>
      </div>
    </main>
  );
}
