import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    BookOpen, Clock, ArrowLeft, CheckCircle2,
    PlayCircle, Lock, Users, FileText, HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { api, type Course, type CourseModule, type Enrollment, type ProgressTracking } from '@/lib/api';
import LMSSidebar from '@/components/lms/LMSSidebar';

const DIFFICULTY_COLORS: Record<string, string> = {
    beginner: '#1B5E3B',
    intermediate: '#C8A046',
    advanced: '#A4372C',
};

const moduleIcon = (type?: string) => {
    if (type === 'video') return PlayCircle;
    if (type === 'quiz') return HelpCircle;
    return FileText;
};

export default function LMSCourseDetail() {
    const { id } = useParams<{ id: string }>();
    const { user, loading } = useAuth();
    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progress, setProgress] = useState<ProgressTracking[]>([]);
    const [enrolling, setEnrolling] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (!loading && !user) window.location.href = '/login';
    }, [user, loading]);

    useEffect(() => {
        if (!user || !id) return;
        (async () => {
            try {
                const courseId = Number(id);
                const [cr, mr, er] = await Promise.all([
                    api.entities.courses.get(courseId),
                    api.entities.course_modules.query({ query: { course_id: courseId }, sort: 'order_index', limit: 200 }),
                    api.entities.enrollments.query({ query: { course_id: courseId }, limit: 5 }),
                ]);
                setCourse(cr.data);
                setModules(mr.data.items);
                const enr = er.data.items[0] ?? null;
                setEnrollment(enr);

                if (enr) {
                    const pr = await api.entities.progress_tracking.query({
                        query: { course_id: courseId },
                        limit: 200,
                    });
                    setProgress(pr.data.items);
                }
            } catch (err) {
                console.error('Failed to load course detail', err);
            } finally {
                setDataLoading(false);
            }
        })();
    }, [user, id]);

    const handleEnroll = async () => {
        if (!course) return;
        setEnrolling(true);
        try {
            const res = await api.entities.enrollments.create({
                course_id: course.id,
                status: 'enrolled',
            });
            setEnrollment(res.data);
        } finally {
            setEnrolling(false);
        }
    };

    const completedModuleIds = new Set(
        progress.filter(p => p.status === 'completed' && p.module_id != null).map(p => p.module_id),
    );
    const completedCount = modules.filter(m => completedModuleIds.has(m.id)).length;
    const progressPercent = modules.length
        ? Math.round((completedCount / modules.length) * 100)
        : (enrollment?.progress_percentage ?? 0);

    const diff = course?.difficulty_level?.toLowerCase() || 'beginner';
    const diffColor = DIFFICULTY_COLORS[diff] || '#1B5E3B';

    const nextModule = modules.find(m => !completedModuleIds.has(m.id)) ?? modules[0];

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

    if (!course) {
        return (
            <div className="flex min-h-screen bg-[#F6F0E1]">
                <LMSSidebar />
                <div className="flex-1 flex items-center justify-center mt-[52px] md:mt-0">
                    <div className="text-center">
                        <BookOpen className="w-12 h-12 text-[#022512]/15 mx-auto mb-3" />
                        <p className="font-bold text-[#022512] text-sm">Course not found</p>
                        <Link
                            to="/lms/courses"
                            className="text-[#1B5E3B] text-xs font-semibold hover:underline mt-2 inline-block"
                        >
                            ← Back to courses
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F6F0E1]">
            <LMSSidebar />

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-20 bg-[#F6F0E1]/95 backdrop-blur-sm border-b border-[#022512]/10 px-6 md:px-8 py-4 flex items-center gap-3 mt-[52px] md:mt-0">
                    <Link
                        to="/lms/courses"
                        className="p-2 rounded-xl hover:bg-[#022512]/6 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#022512]" />
                    </Link>
                    <div className="min-w-0">
                        <h1 className="text-base font-black text-[#022512] line-clamp-1">{course.title}</h1>
                        <p className="text-xs text-[#022512]/50">Course Detail</p>
                    </div>
                </header>

                <div className="px-6 md:px-8 py-7 max-w-5xl">
                    <div className="bg-[#022512] rounded-2xl overflow-hidden mb-7 relative">
                        <div className="h-44 relative">
                            {course.thumbnail_url ? (
                                <img
                                    src={course.thumbnail_url}
                                    alt={course.title}
                                    className="w-full h-full object-cover opacity-35"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1B5E3B] to-[#022512]" />
                            )}
                            <div className="absolute inset-0 flex items-end px-6 pb-6">
                                <div>
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                                        style={{ background: `${diffColor}30`, color: diffColor }}
                                    >
                                        {diff}
                                    </span>
                                    <h2 className="text-xl font-black text-[#F6F0E1] mt-2 leading-snug max-w-xl">
                                        {course.title}
                                    </h2>
                                    <div className="flex items-center gap-4 mt-2">
                                        {course.estimated_hours && (
                                            <span className="flex items-center gap-1.5 text-xs text-[#F6F0E1]/65">
                                                <Clock className="w-3.5 h-3.5" />
                                                {course.estimated_hours}h
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5 text-xs text-[#F6F0E1]/65">
                                            <Users className="w-3.5 h-3.5" />
                                            {modules.length} {modules.length === 1 ? 'module' : 'modules'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-5">
                            {course.description && (
                                <div className="bg-white rounded-2xl p-5 border border-[#022512]/5">
                                    <h3 className="font-black text-[#022512] text-sm mb-2">About this Course</h3>
                                    <p className="text-xs text-[#022512]/65 leading-relaxed">{course.description}</p>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl p-5 border border-[#022512]/5">
                                <h3 className="font-black text-[#022512] text-sm mb-4">Course Modules</h3>
                                {modules.length === 0 ? (
                                    <div className="text-center py-8">
                                        <BookOpen className="w-8 h-8 text-[#022512]/15 mx-auto mb-2" />
                                        <p className="text-xs text-[#022512]/50 font-semibold">
                                            No modules have been added to this course yet.
                                        </p>
                                    </div>
                                ) : enrollment ? (
                                    <div className="space-y-2">
                                        {modules.map((mod, i) => {
                                            const done = completedModuleIds.has(mod.id);
                                            const current = !done && mod.id === nextModule?.id;
                                            const Icon = moduleIcon(mod.content_type);
                                            return (
                                                <Link
                                                    key={mod.id}
                                                    to={`/lms/courses/${id}/modules/${mod.id}`}
                                                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors hover:opacity-80 ${
                                                        done ? 'bg-[#1B5E3B]/8'
                                                            : current ? 'bg-[#C8A046]/8'
                                                                : 'bg-[#022512]/3'
                                                    }`}
                                                >
                                                    {done ? (
                                                        <CheckCircle2 className="w-4 h-4 text-[#1B5E3B] shrink-0" />
                                                    ) : (
                                                        <Icon className={`w-4 h-4 shrink-0 ${current ? 'text-[#C8A046]' : 'text-[#022512]/40'}`} />
                                                    )}
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`text-xs font-semibold leading-tight ${
                                                            done ? 'text-[#1B5E3B]'
                                                                : current ? 'text-[#022512]'
                                                                    : 'text-[#022512]/65'
                                                        }`}>
                                                            Module {i + 1}: {mod.title}
                                                        </p>
                                                        {mod.duration_minutes && (
                                                            <p className="text-[10px] text-[#022512]/40 mt-0.5">
                                                                {mod.duration_minutes} min · {mod.content_type || 'lesson'}
                                                            </p>
                                                        )}
                                                    </div>
                                                    {done && (
                                                        <span className="ml-auto text-xs text-[#1B5E3B] font-bold shrink-0">
                                                            Done
                                                        </span>
                                                    )}
                                                    {current && (
                                                        <span className="ml-auto text-xs text-[#C8A046] font-bold shrink-0">
                                                            Continue
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {modules.map((mod, i) => (
                                            <div
                                                key={mod.id}
                                                className="flex items-center gap-3 p-3 rounded-xl bg-[#022512]/3"
                                            >
                                                <Lock className="w-4 h-4 text-[#022512]/20 shrink-0" />
                                                <span className="text-xs font-semibold text-[#022512]/35">
                                                    Module {i + 1}: {mod.title}
                                                </span>
                                            </div>
                                        ))}
                                        <p className="text-center text-xs text-[#022512]/45 pt-3">
                                            Enroll to unlock module content.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="bg-white rounded-2xl p-5 border border-[#022512]/5 space-y-4 sticky top-24">
                                {enrollment ? (
                                    <>
                                        <div>
                                            <div className="flex justify-between text-xs text-[#022512]/55 mb-1.5">
                                                <span>Your Progress</span>
                                                <span className="font-bold">{progressPercent}%</span>
                                            </div>
                                            <div className="w-full bg-[#022512]/10 rounded-full h-2">
                                                <div
                                                    className="bg-[#1B5E3B] h-2 rounded-full transition-all"
                                                    style={{ width: `${progressPercent}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-[#022512]/45 mt-1.5">
                                                {completedCount} of {modules.length} modules completed
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2 bg-[#1B5E3B]/8 rounded-xl px-3 py-2">
                                            <CheckCircle2 className="w-4 h-4 text-[#1B5E3B] shrink-0" />
                                            <span className="text-xs font-bold text-[#1B5E3B]">Enrolled</span>
                                        </div>

                                        {nextModule ? (
                                            <Link
                                                to={`/lms/courses/${id}/modules/${nextModule.id}`}
                                                className="block w-full text-center bg-[#1B5E3B] text-[#F6F0E1] font-bold py-3 rounded-xl text-sm hover:bg-[#0d301e] transition-colors"
                                            >
                                                {completedCount === 0 ? 'Start Course' : 'Continue Learning'}
                                            </Link>
                                        ) : (
                                            <div className="text-center bg-[#022512] text-[#F6F0E1] font-bold py-3 rounded-xl text-sm">
                                                Course Complete
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="text-center">
                                            <p className="font-black text-[#022512] text-sm">Join this course</p>
                                            <p className="text-xs text-[#022512]/50 mt-1">Free for registered delegates</p>
                                        </div>

                                        <button
                                            onClick={handleEnroll}
                                            disabled={enrolling}
                                            className="w-full bg-[#C8A046] hover:bg-[#b08c3e] disabled:opacity-60 text-[#022512] font-bold py-3 rounded-xl text-sm transition-colors"
                                        >
                                            {enrolling ? 'Enrolling…' : 'Enroll Now'}
                                        </button>

                                        <Link
                                            to="/lms/courses"
                                            className="block text-center text-xs text-[#022512]/45 hover:text-[#022512] font-semibold"
                                        >
                                            ← Browse Courses
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
