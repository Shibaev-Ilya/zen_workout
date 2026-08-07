'use client';

import {useEffect, useRef, useState, FormEvent} from 'react';
import Image from 'next/image';
import {useRouter} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {PageLoader} from '@/components/page-loader';
import {useTrainingStore} from '@/lib/store';
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
                <BrandTitle/>
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
                <Button size="lg" type="submit" disabled={loading} style={{width: '100%'}}>
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
            <Button size="lg" type="submit" disabled={loading} style={{width: '100%'}}>
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

function IconProfile({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
        </svg>
    );
}

function IconAnalytics({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
            />
        </svg>
    );
}

function IconHistory({className}: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
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
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (!profileOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setProfileOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [profileOpen]);

    const handleStart = () => {
        if (!isActive) {
            startTraining();
        }
        router.push('/training');
    };

    const displayName = guestMode ? 'Local mode' : login;
    const avatarLetter = (displayName?.trim().charAt(0) || '?').toUpperCase();

    if (!hydrated) {
        return (
            <main className={styles.page}>
                <div className={`${styles.container} container`}>
                    <BrandTitle/>
                    <PageLoader/>
                </div>
            </main>
        );
    }

    if (!token && !guestMode) {
        return (
            <main className={styles.page}>
                <div className={`${styles.container} container`}>
                    <AuthScreen/>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.page}>
            <div className={`${styles.container} container`}>
                <BrandTitle/>

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
            </div>

            {profileOpen && (
                <div
                    className={styles.profileOverlay}
                    onClick={() => setProfileOpen(false)}
                >
                    <div
                        ref={profileRef}
                        className={`${styles.profilePopup} animate-slide-up`}
                        role="dialog"
                        aria-label="Profile"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.profileHeader}>
                            <span className={styles.profileAvatar}>{avatarLetter}</span>
                            <div className={styles.profileMeta}>
                                <p className={styles.profileName}>{displayName}</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={styles.profileLink}
                            onClick={() => {
                                setProfileOpen(false);
                                router.push('/repetition-maximum');
                            }}
                        >
                            Repetition Maximum (1RM)
                        </button>

                        <button
                            type="button"
                            className={styles.profileLogout}
                            onClick={() => {
                                setProfileOpen(false);
                                logout();
                            }}
                        >
                            Log out
                        </button>
                    </div>
                </div>
            )}

            <nav className={styles.bottomBar} aria-label="Main menu">
                <button
                    type="button"
                    className={styles.bottomBarItem}
                    onClick={() => router.push('/history')}
                    aria-label="History"
                >
                    <IconHistory className={styles.bottomBarIcon}/>
                </button>
                <button
                    type="button"
                    className={styles.bottomBarItem}
                    onClick={() => router.push('/analytics')}
                    aria-label="Analytics"
                >
                    <IconAnalytics className={styles.bottomBarIcon}/>
                </button>
                <button
                    type="button"
                    className={styles.bottomBarItem}
                    onClick={() => setProfileOpen((open) => !open)}
                    aria-label="Profile"
                    aria-expanded={profileOpen}
                    aria-haspopup="dialog"
                >
                    <IconProfile className={styles.bottomBarIcon}/>
                </button>
            </nav>
        </main>
    );
}
