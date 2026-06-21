import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import LOGO_URL from '../assets/paudc.png';

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.28-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.85 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.11V7.04H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.96l3.67-2.85z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.04l3.67 2.85C6.72 7.31 9.14 5.38 12 5.38z" />
    </svg>
);

export default function Login() {
    const navigate = useNavigate();
    const { refetch } = useAuth();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                if (auth.currentUser) {
                    const idToken = await auth.currentUser.getIdToken();
                    await authApi.firebaseLogin(idToken);
                    await refetch();
                    navigate('/dashboard');
                    return;
                }
            } catch (err) {
                console.log('Not logged in or Firebase error:', err);
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
    }, [navigate, refetch]);

    const friendlyError = (err: unknown): string => {
        const raw = err instanceof Error ? err.message : 'Authentication failed';
        if (raw.includes('auth/invalid-credential') || raw.includes('auth/wrong-password')) {
            return 'Email or password is incorrect.';
        }
        if (raw.includes('auth/user-not-found')) {
            return 'No account found with that email.';
        }
        if (raw.includes('auth/email-already-in-use')) {
            return 'That email already has an account. Try signing in instead.';
        }
        if (raw.includes('auth/weak-password')) {
            return 'Password is too weak. Use at least 6 characters.';
        }
        if (raw.includes('auth/popup-closed-by-user')) {
            return 'Google sign-in was cancelled.';
        }
        return raw;
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setInfo('');

        if (isSignUp && !fullName.trim()) {
            setError('Please enter your full name.');
            return;
        }

        setLoading(true);

        try {
            let idToken: string;

            if (isSignUp) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                // Store the name on the Firebase profile, then force a fresh
                // ID token so it carries the updated `name` claim.
                await updateProfile(cred.user, { displayName: fullName.trim() });
                idToken = await cred.user.getIdToken(true);
            } else {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                idToken = await cred.user.getIdToken();
            }

            await authApi.firebaseLogin(idToken);
            await refetch();
            navigate('/dashboard');
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setInfo('');
        setGoogleLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            await authApi.firebaseLogin(idToken);
            await refetch();
            navigate('/dashboard');
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleReset = async () => {
        setError('');
        setInfo('');
        if (!email.trim()) {
            setError('Enter your email above first, then click "Forgot password".');
            return;
        }
        setResetLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setInfo(`Password reset email sent to ${email}. Check your inbox.`);
        } catch (err) {
            setError(friendlyError(err));
        } finally {
            setResetLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F6F0E1]">
                <Loader2 className="h-10 w-10 animate-spin text-[#1B5E3B]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F6F0E1] px-4 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] -right-20 w-[400px] h-[400px] rounded-full bg-[#C8A046] opacity-20 blur-[100px]" />
                <div className="absolute bottom-[-10%] -left-20 w-[500px] h-[500px] rounded-full bg-[#1B5E3B] opacity-10 blur-[120px]" />
            </div>

            <Card className="w-full max-w-md relative z-10 border-[#1B5E3B]/10 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-6 pt-8">
                    <div className="flex justify-center mb-6">
                        <img
                            src={LOGO_URL}
                            alt="PAUDC 2026 Logo"
                            className="h-24 w-auto object-contain drop-shadow-sm"
                        />
                    </div>
                    <CardTitle className="text-3xl font-black text-[#022512] tracking-tight">
                        LMS Portal
                    </CardTitle>
                    <CardDescription className="text-base font-medium text-[#022512]/60 mt-2">
                        {isSignUp ? 'Create your account' : 'Welcome to the Pan-African University Debating Championship'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-8 space-y-5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogle}
                        disabled={googleLoading || loading}
                        className="w-full h-12 border-[#1B5E3B]/20 text-[#022512] font-bold rounded-xl flex items-center justify-center gap-3 bg-white hover:bg-[#F6F0E1]"
                    >
                        {googleLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <GoogleIcon />
                        )}
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold">
                            <span className="bg-white px-3 text-gray-400">or</span>
                        </div>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {isSignUp && (
                            <div>
                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Full Name</label>
                                <Input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Ada Lovelace"
                                    className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] h-12"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] h-12"
                                required
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-[#1B5E3B]">Password</label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={resetLoading}
                                        className="text-xs font-bold text-[#1B5E3B] hover:text-[#022512] hover:underline disabled:opacity-50"
                                    >
                                        {resetLoading ? 'Sending…' : 'Forgot password?'}
                                    </button>
                                )}
                            </div>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] h-12"
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        {info && (
                            <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                                {info}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] h-14 text-lg font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5"
                            disabled={loading || googleLoading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                    {isSignUp ? 'Creating account...' : 'Signing in...'}
                                </>
                            ) : isSignUp ? (
                                'Create Account'
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase font-bold">
                            <span className="bg-white px-3 text-gray-400">
                                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            </span>
                        </div>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] font-bold rounded-xl"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setInfo('');
                        }}
                    >
                        {isSignUp ? 'Sign In Instead' : 'Create Account'}
                    </Button>

                    <p className="text-center text-sm font-medium text-[#022512]/50 leading-relaxed mt-6">
                        Secure access for registered debaters, adjudicators, organizers, and speakers.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
