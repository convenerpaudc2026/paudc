import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, CheckCircle2, PlayCircle,
    Lock, BookOpen, ChevronDown, ChevronUp, FileText,
    HelpCircle, AlertCircle, RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    api,
    type Course,
    type CourseModule,
    type Enrollment,
    type ProgressTracking,
    type Quiz,
    type QuizQuestion,
} from '@/lib/api';
import LMSSidebar from '@/components/lms/LMSSidebar';

declare global {
    interface Window {
        YT?: any;
        onYouTubeIframeAPIReady?: () => void;
    }
}

/* Fraction of a video that must genuinely be watched before it can be completed.
   0.95 (rather than 1.0) absorbs end-cards and the final un-ticked second. */
const VIDEO_THRESHOLD = 0.95;

const moduleIcon = (type?: string) => {
    if (type === 'video') return PlayCircle;
    if (type === 'quiz') return HelpCircle;
    return FileText;
};

const safeParseOptions = (raw: string): string[] => {
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
    } catch {
        // not JSON — fall through
    }
    return raw.split('|').map(s => s.trim()).filter(Boolean);
};

const extractVideoId = (url?: string): string | null => {
    if (!url) return null;
    const embed = url.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
    if (embed) return embed[1];
    const watch = url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    if (watch) return watch[1];
    const short = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if (short) return short[1];
    return null;
};

const fmtTime = (s: number): string => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
};

/* ── Persisted per-video watch state (localStorage) ─────────────────────── */
interface VideoProgress {
    watched: number[];   // distinct whole-second marks actually watched
    position: number;    // last playback position, for resume
    duration: number;    // cached video duration
}

const loadVideoProgress = (key: string): VideoProgress | null => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.watched)) return parsed as VideoProgress;
    } catch {
        // corrupt entry — ignore
    }
    return null;
};

const saveVideoProgress = (key: string, data: VideoProgress) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch {
        // quota / private mode — ignore
    }
};

/* Loads the YouTube IFrame API exactly once and resolves when ready */
let ytApiPromise: Promise<void> | null = null;
const loadYouTubeApi = (): Promise<void> => {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise<void>(resolve => {
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            prev?.();
            resolve();
        };
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
    });
    return ytApiPromise;
};

interface VideoPlayerProps {
    videoId: string;
    storageKey: string;
    onProgress: (fraction: number) => void;
}

/**
 * YouTube player with seek-proof watch tracking AND resume.
 *
 * Tracking: each second the player is PLAYING, the current whole-second
 * position is added to a Set. A seek leaves a gap > 3s that is NOT filled,
 * so jumping to the end cannot inflate progress. Watched fraction is the
 * count of distinct watched seconds over the video duration.
 *
 * Resume: the watched Set, last position, and duration are persisted to
 * localStorage (keyed per user + module). On return, the Set is restored
 * so progress carries over, and the player seeks back to the saved
 * position — the learner continues exactly where they stopped.
 */
function VideoPlayer({ videoId, storageKey, onProgress }: VideoPlayerProps) {
    const hostRef = useRef<HTMLDivElement>(null);
    const playerRef = useRef<any>(null);
    const watchedRef = useRef<Set<number>>(new Set());
    const lastTimeRef = useRef<number | null>(null);
    const durationRef = useRef<number>(0);
    const positionRef = useRef<number>(0);
    const onProgressRef = useRef(onProgress);
    const [pct, setPct] = useState(0);
    const [resumeAt, setResumeAt] = useState(0);

    useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

    useEffect(() => {
        let cancelled = false;
        let interval: number | undefined;
        let ticks = 0;

        const persist = () => {
            saveVideoProgress(storageKey, {
                watched: [...watchedRef.current],
                position: positionRef.current,
                duration: durationRef.current,
            });
        };

        const reportProgress = () => {
            if (durationRef.current > 0) {
                const frac = Math.min(1, watchedRef.current.size / durationRef.current);
                setPct(Math.round(frac * 100));
                onProgressRef.current(frac);
            }
        };

        // ── restore any saved progress for this module ──
        const saved = loadVideoProgress(storageKey);
        watchedRef.current = new Set(saved?.watched ?? []);
        durationRef.current = saved?.duration ?? 0;
        positionRef.current = saved?.position ?? 0;
        lastTimeRef.current = null;
        const savedPos = saved?.position ?? 0;
        setResumeAt(savedPos);
        if (saved && saved.duration > 0) {
            reportProgress();
        } else {
            setPct(0);
            onProgressRef.current(0);
        }

        const handleBeforeUnload = () => persist();
        window.addEventListener('beforeunload', handleBeforeUnload);

        loadYouTubeApi().then(() => {
            if (cancelled || !hostRef.current) return;

            const mount = document.createElement('div');
            mount.className = 'w-full h-full';
            hostRef.current.appendChild(mount);

            playerRef.current = new window.YT.Player(mount, {
                videoId,
                width: '100%',
                height: '100%',
                playerVars: { rel: 0, modestbranding: 1 },
                events: {
                    onReady: (e: any) => {
                        // resume exactly where the learner stopped
                        if (savedPos > 1) {
                            try { e.target.seekTo(savedPos, true); } catch { /* ignore */ }
                        }
                    },
                },
            });

            interval = window.setInterval(() => {
                const p = playerRef.current;
                if (!p) return;
                try {
                    if (typeof p.getPlayerState !== 'function') return;
                    const state = p.getPlayerState();
                    const cur = typeof p.getCurrentTime === 'function' ? p.getCurrentTime() : 0;
                    const dur = typeof p.getDuration === 'function' ? Math.floor(p.getDuration()) : 0;
                    if (dur > 0) durationRef.current = dur;

                    if (state === 1) { // 1 === playing
                        const last = lastTimeRef.current;
                        if (last != null && cur > last && cur - last <= 3) {
                            // contiguous playback — fill the small gap
                            for (let s = Math.floor(last); s <= Math.floor(cur); s++) {
                                watchedRef.current.add(s);
                            }
                        } else {
                            // first tick after load, or a seek jump — only "now" counts
                            watchedRef.current.add(Math.floor(cur));
                        }
                        positionRef.current = cur;
                    }
                    lastTimeRef.current = cur;

                    reportProgress();

                    // persist roughly every 4s so a refresh/close loses almost nothing
                    ticks++;
                    if (ticks % 4 === 0) persist();
                } catch {
                    // player not ready yet — ignore
                }
            }, 1000);
        });

        return () => {
            cancelled = true;
            if (interval) window.clearInterval(interval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            // capture the final position, then persist before tearing down
            try {
                const p = playerRef.current;
                if (p && typeof p.getCurrentTime === 'function') {
                    positionRef.current = p.getCurrentTime();
                }
            } catch { /* ignore */ }
            persist();
            try { playerRef.current?.destroy?.(); } catch { /* ignore */ }
            playerRef.current = null;
        };
    }, [videoId, storageKey]);

    const reached = pct >= VIDEO_THRESHOLD * 100;

    return (
        <div className="mb-7">
            <div className="bg-[#022512] rounded-2xl overflow-hidden aspect-video">
                <div ref={hostRef} className="w-full h-full" />
            </div>
            <div className="mt-3">
                <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className={reached ? 'text-[#1B5E3B]' : 'text-[#022512]/60'}>
                        Watched {pct}%
                    </span>
                    <span className={reached ? 'text-[#1B5E3B]' : 'text-[#022512]/45'}>
                        {reached ? 'Video completed' : 'Finish the video to unlock'}
                    </span>
                </div>
                <div className="w-full bg-[#022512]/10 rounded-full h-2 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all ${reached ? 'bg-[#1B5E3B]' : 'bg-[#C8A046]'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <p className="text-[10px] text-[#022512]/40 mt-1">
                    {resumeAt > 5
                        ? `Progress saved — resumed at ${fmtTime(resumeAt)}. Skipping ahead doesn't count.`
                        : "Progress is saved automatically — you can stop and resume anytime. Skipping ahead doesn't count."}
                </p>
            </div>
        </div>
    );
}

interface QuizPanelProps {
    quiz: Quiz;
    questions: QuizQuestion[];
    onPassed: () => void;
}

function QuizPanel({ quiz, questions, onPassed }: QuizPanelProps) {
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const totalPoints = useMemo(
        () => questions.reduce((s, q) => s + (q.points ?? 0), 0),
        [questions],
    );
    const passingScore = quiz.passing_score ?? 70;

    const handleSubmit = async () => {
        if (submitting) return;
        setSubmitting(true);
        const earned = questions.reduce((sum, q) => {
            return answers[q.id] === q.correct_answer ? sum + (q.points ?? 0) : sum;
        }, 0);
        const pct = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0;
        setScore(pct);
        setSubmitted(true);

        try {
            await api.entities.quiz_attempts.create({
                quiz_id: quiz.id,
                score: pct,
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
                attempt_number: 1,
                passed: pct >= passingScore,
            });
        } catch (err) {
            console.error('Failed to record quiz attempt', err);
        } finally {
            setSubmitting(false);
        }

        if (pct >= passingScore) {
            onPassed();
        }
    };

    const handleRetry = () => {
        setAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    const passed = submitted && score >= passingScore;

    if (questions.length === 0) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-[#022512]/5 text-center">
                <AlertCircle className="w-8 h-8 text-[#022512]/20 mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#022512]/55">
                    No questions have been added to this quiz yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-[#022512]/5">
                <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-[#A4372C]" />
                    <h3 className="font-black text-[#022512] text-sm">{quiz.title}</h3>
                </div>
                {quiz.description && (
                    <p className="text-xs text-[#022512]/55 mb-4">{quiz.description}</p>
                )}
                <p className="text-xs text-[#022512]/45">
                    {questions.length} questions · Passing score {passingScore}%
                </p>
            </div>

            {questions.map((q, idx) => {
                const opts = safeParseOptions(q.options);
                const userAnswer = answers[q.id];
                const isCorrect = submitted && userAnswer === q.correct_answer;
                return (
                    <div key={q.id} className="bg-white rounded-2xl p-5 border border-[#022512]/5">
                        <p className="text-sm font-bold text-[#022512] mb-3">
                            {idx + 1}. {q.question_text}
                        </p>
                        <div className="space-y-2">
                            {opts.map(opt => {
                                const selected = userAnswer === opt;
                                const correctAnswer = submitted && opt === q.correct_answer;
                                const wrongChoice = submitted && selected && opt !== q.correct_answer;
                                return (
                                    <label
                                        key={opt}
                                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                                            correctAnswer
                                                ? 'border-[#1B5E3B] bg-[#1B5E3B]/8'
                                                : wrongChoice
                                                    ? 'border-[#A4372C] bg-[#A4372C]/8'
                                                    : selected
                                                        ? 'border-[#022512] bg-[#022512]/5'
                                                        : 'border-[#022512]/10 hover:border-[#022512]/25'
                                        } ${submitted ? 'cursor-default' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${q.id}`}
                                            value={opt}
                                            checked={selected}
                                            disabled={submitted}
                                            onChange={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                                            className="mt-0.5 accent-[#1B5E3B]"
                                        />
                                        <span className={`text-xs leading-snug ${
                                            correctAnswer ? 'text-[#1B5E3B] font-semibold' :
                                            wrongChoice ? 'text-[#A4372C]' :
                                            'text-[#022512]/80'
                                        }`}>
                                            {opt}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                        {submitted && !isCorrect && (
                            <p className="mt-2 text-xs text-[#A4372C] font-semibold">
                                Correct answer: {q.correct_answer}
                            </p>
                        )}
                    </div>
                );
            })}

            {!submitted ? (
                <button
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(answers).length !== questions.length}
                    className="w-full bg-[#1B5E3B] hover:bg-[#0d301e] disabled:opacity-50 disabled:cursor-not-allowed text-[#F6F0E1] font-bold py-3 rounded-xl text-sm transition-colors"
                >
                    {submitting ? 'Submitting…' : `Submit Quiz (${Object.keys(answers).length}/${questions.length})`}
                </button>
            ) : (
                <div className={`rounded-2xl p-5 border-2 text-center ${
                    passed
                        ? 'bg-[#1B5E3B]/8 border-[#1B5E3B]/30'
                        : 'bg-[#A4372C]/8 border-[#A4372C]/30'
                }`}>
                    <p className={`text-2xl font-black ${passed ? 'text-[#1B5E3B]' : 'text-[#A4372C]'}`}>
                        {score}%
                    </p>
                    <p className={`text-sm font-bold mt-1 ${passed ? 'text-[#1B5E3B]' : 'text-[#A4372C]'}`}>
                        {passed ? 'Passed — Module marked complete!' : `Below passing score (${passingScore}%)`}
                    </p>
                    {!passed && (
                        <button
                            onClick={handleRetry}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#A4372C] text-[#F6F0E1] text-xs font-bold rounded-xl hover:bg-[#8a2d24] transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Try Again
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default function LMSModuleViewer() {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState<Course | null>(null);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
    const [progress, setProgress] = useState<ProgressTracking[]>([]);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [marking, setMarking] = useState(false);
    const [videoWatchedFrac, setVideoWatchedFrac] = useState(0);

    const currentIdx = Math.max(0, modules.findIndex(m => m.id === Number(moduleId)));
    const current = modules[currentIdx];
    const prev = modules[currentIdx - 1] ?? null;
    const next = modules[currentIdx + 1] ?? null;

    const completedModuleIds = new Set(
        progress.filter(p => p.status === 'completed' && p.module_id != null).map(p => p.module_id),
    );
    const completedCount = modules.filter(m => completedModuleIds.has(m.id)).length;
    const isDone = (mod?: CourseModule) => !!mod && completedModuleIds.has(mod.id);

    useEffect(() => {
        if (!loading && !user) window.location.href = '/login';
    }, [user, loading]);

    useEffect(() => {
        if (!user || !courseId) return;
        (async () => {
            setDataLoading(true);
            try {
                const cId = Number(courseId);
                const [cr, mr, er] = await Promise.all([
                    api.entities.courses.get(cId),
                    api.entities.course_modules.query({ query: { course_id: cId }, sort: 'order_index', limit: 200 }),
                    api.entities.enrollments.query({ query: { course_id: cId }, limit: 5 }),
                ]);
                setCourse(cr.data);
                setModules(mr.data.items);
                const enr = er.data.items[0] ?? null;
                setEnrollment(enr);

                if (enr) {
                    const pr = await api.entities.progress_tracking.query({
                        query: { course_id: cId },
                        limit: 200,
                    });
                    setProgress(pr.data.items);
                }
            } catch (err) {
                console.error('Failed to load module viewer', err);
            } finally {
                setDataLoading(false);
            }
        })();
    }, [user, courseId]);

    useEffect(() => {
        if (!current || current.content_type !== 'quiz') {
            setQuiz(null);
            setQuizQuestions([]);
            return;
        }
        (async () => {
            try {
                const qr = await api.entities.quizzes.query({
                    query: { module_id: current.id },
                    limit: 1,
                });
                const q = qr.data.items[0];
                if (!q) {
                    setQuiz(null);
                    setQuizQuestions([]);
                    return;
                }
                setQuiz(q);
                const qqr = await api.entities.quiz_questions.query({
                    query: { quiz_id: q.id },
                    sort: 'order_index',
                    limit: 100,
                });
                setQuizQuestions(qqr.data.items);
            } catch (err) {
                console.error('Failed to load quiz', err);
                setQuiz(null);
                setQuizQuestions([]);
            }
        })();
    }, [current]);

    const persistCompletion = async (moduleObj: CourseModule) => {
        if (!enrollment || !course) return;
        const courseIdNum = Number(courseId);

        const existing = progress.find(
            p => p.module_id === moduleObj.id && p.course_id === courseIdNum,
        );

        let updated: ProgressTracking;
        if (existing) {
            const res = await api.entities.progress_tracking.update(existing.id, {
                status: 'completed',
                last_accessed_at: new Date().toISOString(),
            });
            updated = res.data;
        } else {
            const res = await api.entities.progress_tracking.create({
                course_id: courseIdNum,
                module_id: moduleObj.id,
                status: 'completed',
                last_accessed_at: new Date().toISOString(),
            });
            updated = res.data;
        }

        const newProgress = existing
            ? progress.map(p => (p.id === existing.id ? updated : p))
            : [...progress, updated];
        setProgress(newProgress);

        const newCompletedIds = new Set(
            newProgress.filter(p => p.status === 'completed' && p.module_id != null).map(p => p.module_id),
        );
        const newCompletedCount = modules.filter(m => newCompletedIds.has(m.id)).length;
        const newPct = modules.length
            ? Math.round((newCompletedCount / modules.length) * 100)
            : 100;

        try {
            const enrRes = await api.entities.enrollments.update(enrollment.id, {
                progress_percentage: newPct,
                status: newPct === 100 ? 'completed' : 'in_progress',
            });
            setEnrollment(enrRes.data);
        } catch (err) {
            console.error('Failed to update enrollment progress', err);
        }
    };

    const handleMarkComplete = async () => {
        if (!current || marking) return;
        setMarking(true);
        try {
            await persistCompletion(current);
            if (next) {
                navigate(`/lms/courses/${courseId}/modules/${next.id}`);
            }
        } catch (err) {
            console.error('Failed to mark complete', err);
        } finally {
            setMarking(false);
        }
    };

    const handleQuizPassed = async () => {
        if (!current) return;
        try {
            await persistCompletion(current);
        } catch (err) {
            console.error('Failed to mark quiz module complete', err);
        }
    };

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

    if (!current) {
        return (
            <div className="flex min-h-screen bg-[#F6F0E1]">
                <LMSSidebar />
                <div className="flex-1 flex items-center justify-center mt-[52px] md:mt-0">
                    <div className="text-center">
                        <BookOpen className="w-12 h-12 text-[#022512]/15 mx-auto mb-3" />
                        <p className="font-bold text-[#022512] text-sm">Module not found</p>
                        <Link
                            to={`/lms/courses/${courseId}`}
                            className="text-[#1B5E3B] text-xs font-semibold hover:underline mt-2 inline-block"
                        >
                            ← Back to course
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const Icon = moduleIcon(current.content_type);
    const typeLabel = current.content_type || 'lesson';
    const videoId = current.content_type === 'video' ? extractVideoId(current.video_url) : null;
    const videoStorageKey = `lms_video_${user?.id ?? 'anon'}_${current.id}`;

    // A video module's completion is gated until it has genuinely been watched
    const videoLocked =
        current.content_type === 'video' &&
        !isDone(current) &&
        !!videoId &&
        videoWatchedFrac < VIDEO_THRESHOLD;

    return (
        <div className="flex min-h-screen bg-[#F6F0E1]">
            <LMSSidebar />

            <div className="flex-1 flex flex-col overflow-hidden mt-[52px] md:mt-0">
                <header className="sticky top-0 z-20 bg-[#F6F0E1]/95 backdrop-blur-sm border-b border-[#022512]/10 px-4 md:px-6 py-3 flex items-center gap-3">
                    <Link
                        to={`/lms/courses/${courseId}`}
                        className="p-2 rounded-xl hover:bg-[#022512]/6 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#022512]" />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs text-[#022512]/50 truncate">{course?.title}</p>
                        <h1 className="text-sm font-black text-[#022512] truncate">{current.title}</h1>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(o => !o)}
                        className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#022512]/55 hover:text-[#022512] transition-colors"
                    >
                        {sidebarOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Modules
                    </button>
                </header>

                <div className="flex flex-1 overflow-hidden">
                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-4xl mx-auto px-4 md:px-8 py-7">
                            {current.content_type === 'video' && (
                                videoId ? (
                                    <VideoPlayer
                                        key={current.id}
                                        videoId={videoId}
                                        storageKey={videoStorageKey}
                                        onProgress={setVideoWatchedFrac}
                                    />
                                ) : (
                                    <div className="bg-[#022512] rounded-2xl overflow-hidden mb-7 aspect-video flex items-center justify-center">
                                        <div className="flex flex-col items-center gap-3 text-[#F6F0E1]/50">
                                            <PlayCircle className="w-16 h-16" />
                                            <p className="text-sm font-semibold">Video URL not configured</p>
                                        </div>
                                    </div>
                                )
                            )}

                            <div className="flex items-center gap-3 mb-5">
                                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                                    current.content_type === 'video'
                                        ? 'bg-[#1B5E3B]/12 text-[#1B5E3B]'
                                        : current.content_type === 'quiz'
                                            ? 'bg-[#A4372C]/12 text-[#A4372C]'
                                            : 'bg-[#C8A046]/12 text-[#C8A046]'
                                }`}>
                                    <Icon className="w-3 h-3" />
                                    {typeLabel}
                                </span>
                                {current.duration_minutes && (
                                    <span className="text-xs text-[#022512]/45">
                                        {current.duration_minutes} min
                                    </span>
                                )}
                                {isDone(current) && (
                                    <span className="ml-auto flex items-center gap-1 text-xs text-[#1B5E3B] font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        Completed
                                    </span>
                                )}
                            </div>

                            {current.content && (
                                <div
                                    className="prose-paudc bg-white rounded-2xl p-6 md:p-8 border border-[#022512]/5"
                                    dangerouslySetInnerHTML={{ __html: current.content }}
                                />
                            )}

                            {current.content_type === 'quiz' && quiz && (
                                <div className="mt-7">
                                    <QuizPanel
                                        quiz={quiz}
                                        questions={quizQuestions}
                                        onPassed={handleQuizPassed}
                                    />
                                </div>
                            )}

                            {current.content_type === 'quiz' && !quiz && (
                                <div className="mt-7 bg-white rounded-2xl p-6 border border-[#022512]/5 text-center">
                                    <AlertCircle className="w-8 h-8 text-[#022512]/20 mx-auto mb-2" />
                                    <p className="text-sm font-semibold text-[#022512]/55">
                                        Quiz not yet configured for this module.
                                    </p>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center gap-3 mt-7">
                                {prev ? (
                                    <Link
                                        to={`/lms/courses/${courseId}/modules/${prev.id}`}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 border border-[#022512]/15 rounded-xl text-sm font-semibold text-[#022512] hover:bg-[#022512]/5 transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Previous
                                    </Link>
                                ) : <div className="flex-1 sm:flex-none" />}

                                {current.content_type !== 'quiz' && (
                                    isDone(current) ? (
                                        <div className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E3B]/12 text-[#1B5E3B] font-bold py-3 px-6 rounded-xl text-sm">
                                            <CheckCircle2 className="w-4 h-4" /> Completed
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleMarkComplete}
                                            disabled={marking || videoLocked}
                                            className="flex-1 flex items-center justify-center gap-2 bg-[#1B5E3B] hover:bg-[#0d301e] disabled:opacity-60 disabled:cursor-not-allowed text-[#F6F0E1] font-bold py-3 px-6 rounded-xl text-sm transition-colors"
                                        >
                                            {videoLocked ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                            {marking
                                                ? 'Saving…'
                                                : videoLocked
                                                    ? `Finish the video to unlock · ${Math.round(videoWatchedFrac * 100)}%`
                                                    : 'Mark as Complete'}
                                        </button>
                                    )
                                )}

                                {next ? (
                                    <Link
                                        to={`/lms/courses/${courseId}/modules/${next.id}`}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#C8A046] hover:bg-[#b08c3e] rounded-xl text-sm font-bold text-[#022512] transition-colors"
                                    >
                                        Next <ArrowRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/lms/courses/${courseId}`}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#022512] rounded-xl text-sm font-bold text-[#F6F0E1] hover:bg-[#011508] transition-colors"
                                    >
                                        Finish Course <CheckCircle2 className="w-4 h-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </main>

                    {sidebarOpen && (
                        <aside className="hidden md:flex flex-col w-72 border-l border-[#022512]/10 bg-white overflow-y-auto">
                            <div className="px-4 py-4 border-b border-[#022512]/8">
                                <p className="text-xs font-black text-[#022512] uppercase tracking-wider">
                                    Course Modules
                                </p>
                                <p className="text-[10px] text-[#022512]/45 mt-1">
                                    {completedCount} of {modules.length} complete
                                </p>
                            </div>
                            <nav className="p-3 space-y-1">
                                {modules.map((mod, idx) => {
                                    const done = completedModuleIds.has(mod.id);
                                    const active = mod.id === current.id;
                                    const locked = !enrollment;
                                    const ModIcon = moduleIcon(mod.content_type);
                                    return (
                                        <Link
                                            key={mod.id}
                                            to={locked ? '#' : `/lms/courses/${courseId}/modules/${mod.id}`}
                                            onClick={e => locked && e.preventDefault()}
                                            className={`flex items-start gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-all ${
                                                active
                                                    ? 'bg-[#022512] text-[#F6F0E1]'
                                                    : done
                                                        ? 'text-[#1B5E3B] hover:bg-[#1B5E3B]/8'
                                                        : locked
                                                            ? 'text-[#022512]/25 cursor-not-allowed'
                                                            : 'text-[#022512]/65 hover:bg-[#022512]/5'
                                            }`}
                                        >
                                            <span className="shrink-0 mt-0.5">
                                                {done ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                ) : active ? (
                                                    <PlayCircle className="w-3.5 h-3.5" />
                                                ) : locked ? (
                                                    <Lock className="w-3.5 h-3.5" />
                                                ) : (
                                                    <ModIcon className="w-3.5 h-3.5" />
                                                )}
                                            </span>
                                            <span className="leading-snug">
                                                {idx + 1}. {mod.title}
                                            </span>
                                            {mod.duration_minutes != null && (
                                                <span className={`ml-auto shrink-0 text-[10px] ${
                                                    active ? 'text-[#F6F0E1]/60' : 'text-[#022512]/35'
                                                }`}>
                                                    {mod.duration_minutes}m
                                                </span>
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                    )}
                </div>
            </div>
        </div>
    );
}
