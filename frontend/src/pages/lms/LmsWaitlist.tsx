import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Bell } from 'lucide-react';
import { submitForm } from '@/lib/googleForms';

export default function LmsWaitlist() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateEmail(email)) {
            setSubmitStatus({ type: 'error', message: 'Please enter a valid email address.' });
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const success = await submitForm({
                type: 'lms_waitlist',
                email
            });

            if (success) {
                setSubmitStatus({
                    type: 'success',
                    message: 'Thanks for signing up! We\'ll notify you when the LMS goes live.'
                });
                setEmail('');
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Failed to submit. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B] relative overflow-hidden">
            <Navbar />

            {/* Decorative Blur Blobs */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[15%] -left-32 w-[500px] h-[500px] rounded-full bg-[#C8A046] opacity-30 blur-[120px]" />
                <div className="absolute top-[50%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#A4372C] opacity-20 blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-[#A4372C] to-[#C8A046] relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 drop-shadow-md">
                        LMS Coming Soon
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 font-medium max-w-2xl mx-auto">
                        The PAUDC Learning Management System will be available in June 2026
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-12 md:py-24 relative z-10">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 mb-12">
                        {/* Information Card */}
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#1B5E3B]/10 flex items-center justify-center flex-shrink-0">
                                    <Clock className="h-6 w-6 md:h-7 md:w-7 text-[#1B5E3B]" />
                                </div>
                                <div>
                                    <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-2">Available June 2026</h3>
                                    <p className="text-[#1B5E3B]/80 text-sm md:text-lg">
                                        Get early access and be among the first to experience our comprehensive learning platform designed for PAUDC participants.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Waitlist Signup Card */}
                    <Card className="border border-[#1B5E3B]/10 shadow-xl rounded-3xl bg-white overflow-hidden">
                        <CardContent className="p-8 md:p-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Bell className="h-6 w-6 text-[#C8A046]" />
                                <h2 className="text-2xl font-bold text-[#1B5E3B]">
                                    Be the First to Know
                                </h2>
                            </div>

                            <p className="text-[#1B5E3B]/80 text-base md:text-lg mb-8">
                                Enter your email and we'll notify you as soon as the LMS goes live. No spam, just important updates.
                            </p>

                            {submitStatus && (
                                <div className={`mb-6 p-4 rounded-xl ${submitStatus.type === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : 'bg-red-50 border border-red-200 text-red-800'
                                    }`}>
                                    {submitStatus.message}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                        Email Address
                                    </label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] h-12"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold h-14 rounded-xl text-lg transition-transform hover:-translate-y-1 shadow-md"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Signing up...' : 'Notify Me'}
                                </Button>

                                <p className="text-xs text-[#1B5E3B]/60 text-center">
                                    We respect your privacy. No spam, ever.
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}
