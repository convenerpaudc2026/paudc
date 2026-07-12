import { useEffect, useState } from 'react';
import { authApi } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                await authApi.completeCallback();
                window.location.href = '/dashboard';
            } catch (err: unknown) {
                console.error('Auth callback error:', err);
                setError(err instanceof Error ? err.message : 'Authentication failed');
            }
        };

        handleCallback();
    }, []);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <a href="/" className="text-[#C84B46] hover:underline">
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#C84B46] mx-auto mb-4" />
                <p className="text-gray-600">Completing authentication...</p>
            </div>
        </div>
    );
}
