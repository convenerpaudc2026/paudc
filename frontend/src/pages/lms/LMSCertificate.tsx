import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowLeft, Printer, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Course, type Enrollment } from '@/lib/api';
import LMSSidebar from '@/components/lms/LMSSidebar';
import LOGO_URL from '@/assets/paudc.png';

export default function LMSCertificate() {
    const { user, loading } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) window.location.href = '/login';
    }, [user, loading]);

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const [cr, er] = await Promise.all([
                    api.entities.courses.query({ limit: 200 }),
                    api.entities.enrollments.query({ limit: 200 }),
                ]);
                setCourses(cr.data.items);
                setEnrollments(er.data.items);
            } catch (err) {
                console.error('Failed to load certificate data', err);
            } finally {
                setDataLoading(false);
            }
        })();
    }, [user]);

    const completedCourseIds = new Set(
        enrollments.filter(e => e.status === 'completed').map(e => e.course_id),
    );
    const completedCount = courses.filter(c => completedCourseIds.has(c.id)).length;
    const allComplete = courses.length > 0 && completedCount === courses.length;

    const recipientName = user?.name?.trim() || 'PAUDC Delegate';
    const issueDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    if (loading || dataLoading) {
        return (
            <div className="flex min-h-screen bg-[#F6F0E1]">
                <LMSSidebar />
                <div className="flex-1 flex items-center justify-center mt-[52px] md:mt-0">
                    <div className="w-10 h-10 rounded-full border-4 border-[#1B5E3B] border-t-transparent animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F6F0E1]">
            <div className="print:hidden">
                <LMSSidebar />
            </div>

            <main className="flex-1 overflow-y-auto">
                <header className="print:hidden sticky top-0 z-20 bg-[#F6F0E1]/95 backdrop-blur-sm border-b border-[#022512]/10 px-6 md:px-8 py-4 flex items-center gap-3 mt-[52px] md:mt-0">
                    <Link
                        to="/dashboard"
                        className="p-2 rounded-xl hover:bg-[#022512]/6 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#022512]" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-lg font-black text-[#022512]">Certificate of Completion</h1>
                        <p className="text-xs text-[#022512]/55">PAUDC 2026 LMS</p>
                    </div>
                    {allComplete && (
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Print / Save PDF
                        </button>
                    )}
                </header>

                <div className="px-6 md:px-8 py-8">
                    {!allComplete ? (
                        <div className="max-w-md mx-auto bg-white rounded-2xl p-8 border border-[#022512]/5 text-center">
                            <div className="w-14 h-14 rounded-full bg-[#022512]/5 flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-6 h-6 text-[#022512]/30" />
                            </div>
                            <h2 className="font-black text-[#022512] text-base">Certificate locked</h2>
                            <p className="text-sm text-[#022512]/55 mt-1.5">
                                Complete every course to unlock your certificate.
                            </p>
                            <div className="mt-5 text-left space-y-2">
                                {courses.map(c => {
                                    const done = completedCourseIds.has(c.id);
                                    return (
                                        <div
                                            key={c.id}
                                            className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#022512]/3"
                                        >
                                            {done ? (
                                                <CheckCircle2 className="w-4 h-4 text-[#1B5E3B] shrink-0" />
                                            ) : (
                                                <Lock className="w-4 h-4 text-[#022512]/25 shrink-0" />
                                            )}
                                            <span className={`text-xs font-semibold ${done ? 'text-[#1B5E3B]' : 'text-[#022512]/55'}`}>
                                                {c.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            <p className="text-xs text-[#022512]/45 mt-4">
                                {completedCount} of {courses.length} courses completed
                            </p>
                            <Link
                                to="/lms/courses"
                                className="inline-block mt-5 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
                            >
                                Continue Learning
                            </Link>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto">
                            {/* The certificate */}
                            <div className="certificate bg-white p-2 rounded-sm shadow-2xl print:shadow-none">
                                <div className="border-[3px] border-[#C8A046] p-1.5">
                                    <div className="border border-[#1B5E3B]/30 px-8 py-12 md:px-16 md:py-16 text-center relative overflow-hidden">

                                        {/* Corner flourishes */}
                                        <div className="pointer-events-none absolute -top-16 -left-16 w-44 h-44 rounded-full bg-[#C8A046]/10" />
                                        <div className="pointer-events-none absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-[#1B5E3B]/10" />

                                        <div className="relative">
                                            <img
                                                src={LOGO_URL}
                                                alt="PAUDC 2026"
                                                className="h-16 w-auto object-contain mx-auto mb-4"
                                            />
                                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#C8A046]">
                                                Pan-African University Debating Championship 2026
                                            </p>

                                            <h2 className="mt-6 text-3xl md:text-4xl font-black text-[#022512] tracking-tight">
                                                Certificate of Completion
                                            </h2>
                                            <div className="w-24 h-1 bg-[#C8A046] mx-auto mt-3 rounded-full" />

                                            <p className="mt-8 text-sm text-[#022512]/60">
                                                This certificate is proudly presented to
                                            </p>
                                            <p className="mt-3 text-3xl md:text-4xl font-black text-[#1B5E3B]">
                                                {recipientName}
                                            </p>
                                            <div className="w-48 h-px bg-[#022512]/20 mx-auto mt-2" />

                                            <p className="mt-6 text-sm text-[#022512]/70 max-w-lg mx-auto leading-relaxed">
                                                for successfully completing all{' '}
                                                <strong className="text-[#022512]">{courses.length}</strong>{' '}
                                                courses of the PAUDC 2026 Learning Management System,
                                                demonstrating dedication to the craft of competitive debate.
                                            </p>

                                            {/* Seal */}
                                            <div className="mt-8 flex justify-center">
                                                <div className="w-20 h-20 rounded-full bg-[#1B5E3B] flex items-center justify-center border-4 border-[#C8A046]">
                                                    <Award className="w-9 h-9 text-[#C8A046]" />
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-end justify-center gap-12 md:gap-20">
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-[#022512] border-t border-[#022512]/40 pt-1.5 px-4">
                                                        {issueDate}
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider text-[#022512]/45 mt-1">
                                                        Date of Issue
                                                    </p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-sm font-bold text-[#022512] border-t border-[#022512]/40 pt-1.5 px-4 font-serif italic">
                                                        PAUDC 2026
                                                    </p>
                                                    <p className="text-[10px] uppercase tracking-wider text-[#022512]/45 mt-1">
                                                        Organising Committee
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="print:hidden text-center text-xs text-[#022512]/45 mt-5">
                                This is a commemorative certificate issued by the PAUDC 2026 LMS.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
