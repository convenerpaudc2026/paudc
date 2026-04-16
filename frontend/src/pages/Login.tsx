import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authApi } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import LOGO_URL from '../assets/paudc.png';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check if user is already logged in with Firebase
                if (auth.currentUser) {
                    const idToken = await auth.currentUser.getIdToken();
                    await authApi.firebaseLogin(idToken);
                    navigate('/dashboard');
                    return;
                }
            } catch (err) {
                console.log("Not logged in or Firebase error:", err);
            } finally {
                setChecking(false);
            }
        };

        checkAuth();
    }, [navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userCredential;

            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            }

            // Get Firebase ID token
            const idToken = await userCredential.user.getIdToken();

            // Exchange Firebase token for backend JWT
            await authApi.firebaseLogin(idToken);

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
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

            {/* Decorative Background Elements */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[-10%] -right-20 w-[400px] h-[400px] rounded-full bg-[#C8A046] opacity-20 blur-[100px]" />
                <div className="absolute bottom-[-10%] -left-20 w-[500px] h-[500px] rounded-full bg-[#1B5E3B] opacity-10 blur-[120px]" />
            </div>

            {/* Login Card */}
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

                <CardContent className="px-8 pb-8 space-y-6">
                    <form onSubmit={handleAuth} className="space-y-4">
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
                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Password</label>
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

                        <Button
                            type="submit"
                            className="w-full bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] h-14 text-lg font-bold rounded-xl shadow-md transition-transform hover:-translate-y-0.5"
                            disabled={loading}
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