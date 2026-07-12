import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus, Edit2, Trash2, BookOpen, ShieldCheck, ArrowLeft,
    Save, X, ChevronRight, AlertCircle, FileText, PlayCircle, HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
    api,
    type Course,
    type CourseModule,
    type Quiz,
    type QuizQuestion,
} from '@/lib/api';
import LMSSidebar from '@/components/lms/LMSSidebar';

type ContentType = 'text' | 'video' | 'quiz';

const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const CONTENT_TYPE_OPTIONS: ContentType[] = ['text', 'video', 'quiz'];

interface CourseFormState {
    title: string;
    description: string;
    thumbnail_url: string;
    difficulty_level: string;
    estimated_hours: string;
    is_published: boolean;
}

const blankCourse: CourseFormState = {
    title: '',
    description: '',
    thumbnail_url: '',
    difficulty_level: 'beginner',
    estimated_hours: '',
    is_published: true,
};

interface ModuleFormState {
    title: string;
    description: string;
    order_index: string;
    content_type: ContentType;
    content: string;
    video_url: string;
    duration_minutes: string;
}

const blankModule: ModuleFormState = {
    title: '',
    description: '',
    order_index: '1',
    content_type: 'text',
    content: '',
    video_url: '',
    duration_minutes: '',
};

interface QuestionFormState {
    question_text: string;
    options: string[];
    correct_answer: string;
    points: string;
    order_index: string;
}

const blankQuestion: QuestionFormState = {
    question_text: '',
    options: ['', '', '', ''],
    correct_answer: '',
    points: '10',
    order_index: '1',
};

const moduleTypeIcon = (t?: string) => {
    if (t === 'video') return PlayCircle;
    if (t === 'quiz') return HelpCircle;
    return FileText;
};

export default function LMSAdmin() {
    const { user, loading } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [courses, setCourses] = useState<Course[]>([]);
    const [modules, setModules] = useState<CourseModule[]>([]);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
    const [editingCourseId, setEditingCourseId] = useState<number | 'new' | null>(null);
    const [courseForm, setCourseForm] = useState<CourseFormState>(blankCourse);

    const [editingModuleId, setEditingModuleId] = useState<number | 'new' | null>(null);
    const [moduleForm, setModuleForm] = useState<ModuleFormState>(blankModule);

    const [editingQuestion, setEditingQuestion] = useState<{ quizId: number; questionId: number | 'new' } | null>(null);
    const [questionForm, setQuestionForm] = useState<QuestionFormState>(blankQuestion);

    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!loading && !user) window.location.href = '/login';
    }, [user, loading]);

    const loadAll = async () => {
        try {
            const [cr, mr, qr] = await Promise.all([
                api.entities.courses.query({ limit: 200, sort: '-created_at' }),
                api.entities.course_modules.query({ limit: 500, sort: 'order_index' }),
                api.entities.quizzes.query({ limit: 200 }),
            ]);
            setCourses(cr.data.items);
            setModules(mr.data.items);
            setQuizzes(qr.data.items);

            if (qr.data.items.length > 0) {
                const qqr = await api.entities.quiz_questions.query({ limit: 1000, sort: 'order_index' });
                setQuestions(qqr.data.items);
            } else {
                setQuestions([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load admin data');
        } finally {
            setDataLoading(false);
        }
    };

    useEffect(() => {
        if (!user || !isAdmin) return;
        loadAll();
    }, [user, isAdmin]);

    const courseModules = useMemo(
        () => modules.filter(m => selectedCourseId !== null && m.course_id === selectedCourseId)
            .sort((a, b) => a.order_index - b.order_index),
        [modules, selectedCourseId],
    );

    const startNewCourse = () => {
        setEditingCourseId('new');
        setCourseForm(blankCourse);
    };

    const startEditCourse = (c: Course) => {
        setEditingCourseId(c.id);
        setCourseForm({
            title: c.title,
            description: c.description || '',
            thumbnail_url: c.thumbnail_url || '',
            difficulty_level: c.difficulty_level || 'beginner',
            estimated_hours: c.estimated_hours != null ? String(c.estimated_hours) : '',
            is_published: c.is_published ?? true,
        });
    };

    const saveCourse = async () => {
        setBusy(true);
        setError(null);
        try {
            const payload = {
                title: courseForm.title,
                description: courseForm.description || undefined,
                thumbnail_url: courseForm.thumbnail_url || undefined,
                difficulty_level: courseForm.difficulty_level,
                estimated_hours: courseForm.estimated_hours ? Number(courseForm.estimated_hours) : undefined,
                is_published: courseForm.is_published,
            };
            if (editingCourseId === 'new') {
                await api.entities.courses.create(payload);
            } else if (typeof editingCourseId === 'number') {
                await api.entities.courses.update(editingCourseId, payload);
            }
            setEditingCourseId(null);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save course');
        } finally {
            setBusy(false);
        }
    };

    const deleteCourse = async (c: Course) => {
        if (!window.confirm(`Delete "${c.title}"? This cannot be undone.`)) return;
        setBusy(true);
        try {
            await api.entities.courses.remove(c.id);
            if (selectedCourseId === c.id) setSelectedCourseId(null);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete course');
        } finally {
            setBusy(false);
        }
    };

    const startNewModule = () => {
        if (selectedCourseId == null) return;
        setEditingModuleId('new');
        setModuleForm({
            ...blankModule,
            order_index: String(courseModules.length + 1),
        });
    };

    const startEditModule = (m: CourseModule) => {
        setEditingModuleId(m.id);
        setModuleForm({
            title: m.title,
            description: m.description || '',
            order_index: String(m.order_index),
            content_type: (m.content_type as ContentType) || 'text',
            content: m.content || '',
            video_url: m.video_url || '',
            duration_minutes: m.duration_minutes != null ? String(m.duration_minutes) : '',
        });
    };

    const saveModule = async () => {
        if (selectedCourseId == null) return;
        setBusy(true);
        setError(null);
        try {
            const payload = {
                course_id: selectedCourseId,
                title: moduleForm.title,
                description: moduleForm.description || undefined,
                order_index: Number(moduleForm.order_index) || 1,
                content_type: moduleForm.content_type,
                content: moduleForm.content || undefined,
                video_url: moduleForm.content_type === 'video' ? (moduleForm.video_url || undefined) : undefined,
                duration_minutes: moduleForm.duration_minutes ? Number(moduleForm.duration_minutes) : undefined,
            };
            if (editingModuleId === 'new') {
                const created = await api.entities.course_modules.create(payload);
                if (moduleForm.content_type === 'quiz') {
                    await api.entities.quizzes.create({
                        course_id: selectedCourseId,
                        module_id: created.data.id,
                        title: moduleForm.title,
                        description: moduleForm.description || undefined,
                        passing_score: 70,
                        max_attempts: 3,
                        is_published: true,
                    });
                }
            } else if (typeof editingModuleId === 'number') {
                await api.entities.course_modules.update(editingModuleId, payload);
                if (moduleForm.content_type === 'quiz') {
                    const existing = quizzes.find(q => q.module_id === editingModuleId);
                    if (!existing) {
                        await api.entities.quizzes.create({
                            course_id: selectedCourseId,
                            module_id: editingModuleId,
                            title: moduleForm.title,
                            description: moduleForm.description || undefined,
                            passing_score: 70,
                            max_attempts: 3,
                            is_published: true,
                        });
                    }
                }
            }
            setEditingModuleId(null);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save module');
        } finally {
            setBusy(false);
        }
    };

    const deleteModule = async (m: CourseModule) => {
        if (!window.confirm(`Delete module "${m.title}"?`)) return;
        setBusy(true);
        try {
            await api.entities.course_modules.remove(m.id);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete module');
        } finally {
            setBusy(false);
        }
    };

    const quizForModule = (moduleId: number) => quizzes.find(q => q.module_id === moduleId);

    const startNewQuestion = (quizId: number) => {
        const existing = questions.filter(q => q.quiz_id === quizId);
        setEditingQuestion({ quizId, questionId: 'new' });
        setQuestionForm({
            ...blankQuestion,
            order_index: String(existing.length + 1),
        });
    };

    const startEditQuestion = (q: QuizQuestion) => {
        let opts: string[] = ['', '', '', ''];
        try {
            const parsed = JSON.parse(q.options);
            if (Array.isArray(parsed)) opts = parsed.map(String);
        } catch {
            opts = q.options.split('|').map(s => s.trim());
        }
        while (opts.length < 2) opts.push('');
        setEditingQuestion({ quizId: q.quiz_id, questionId: q.id });
        setQuestionForm({
            question_text: q.question_text,
            options: opts,
            correct_answer: q.correct_answer ?? '',
            points: String(q.points),
            order_index: String(q.order_index),
        });
    };

    const saveQuestion = async () => {
        if (!editingQuestion) return;
        setBusy(true);
        setError(null);
        try {
            const trimmedOpts = questionForm.options.map(o => o.trim()).filter(Boolean);
            const payload = {
                quiz_id: editingQuestion.quizId,
                question_text: questionForm.question_text,
                question_type: 'multiple_choice',
                options: JSON.stringify(trimmedOpts),
                correct_answer: questionForm.correct_answer,
                points: Number(questionForm.points) || 10,
                order_index: Number(questionForm.order_index) || 1,
            };
            if (editingQuestion.questionId === 'new') {
                await api.entities.quiz_questions.create(payload);
            } else {
                await api.entities.quiz_questions.update(editingQuestion.questionId, payload);
            }
            setEditingQuestion(null);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save question');
        } finally {
            setBusy(false);
        }
    };

    const deleteQuestion = async (q: QuizQuestion) => {
        if (!window.confirm('Delete this question?')) return;
        setBusy(true);
        try {
            await api.entities.quiz_questions.remove(q.id);
            await loadAll();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete question');
        } finally {
            setBusy(false);
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

    if (!isAdmin) {
        return (
            <div className="flex min-h-screen bg-[#F6F0E1]">
                <LMSSidebar />
                <div className="flex-1 flex items-center justify-center mt-[52px] md:mt-0">
                    <div className="text-center">
                        <ShieldCheck className="w-12 h-12 text-[#A4372C] mx-auto mb-3" />
                        <p className="font-bold text-[#022512] text-sm">Admin access required</p>
                        <Link
                            to="/dashboard"
                            className="text-[#1B5E3B] text-xs font-semibold hover:underline mt-2 inline-block"
                        >
                            ← Back to dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const selectedCourse = courses.find(c => c.id === selectedCourseId) ?? null;

    return (
        <div className="flex min-h-screen bg-[#F6F0E1]">
            <LMSSidebar />

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-20 bg-[#F6F0E1]/95 backdrop-blur-sm border-b border-[#022512]/10 px-6 md:px-8 py-4 flex items-center gap-3 mt-[52px] md:mt-0">
                    <Link
                        to="/dashboard"
                        className="p-2 rounded-xl hover:bg-[#022512]/6 transition-colors shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-[#022512]" />
                    </Link>
                    <div>
                        <h1 className="text-lg font-black text-[#022512] flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-[#C8A046]" />
                            LMS Admin
                        </h1>
                        <p className="text-xs text-[#022512]/55">Manage courses, modules and quizzes</p>
                    </div>
                </header>

                <div className="px-6 md:px-8 py-7 max-w-6xl">
                    {error && (
                        <div className="mb-5 bg-[#A4372C]/10 border border-[#A4372C]/30 rounded-xl p-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-[#A4372C] shrink-0" />
                            <p className="text-xs text-[#A4372C] font-semibold">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto p-1 hover:bg-[#A4372C]/10 rounded"
                            >
                                <X className="w-3.5 h-3.5 text-[#A4372C]" />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Courses column */}
                        <section className="bg-white rounded-2xl p-5 border border-[#022512]/5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-black text-[#022512]">Courses</h2>
                                <button
                                    onClick={startNewCourse}
                                    className="flex items-center gap-1.5 bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] text-xs font-bold px-3 py-1.5 rounded-lg"
                                >
                                    <Plus className="w-3.5 h-3.5" /> New Course
                                </button>
                            </div>

                            {editingCourseId !== null && (
                                <CourseEditor
                                    form={courseForm}
                                    onChange={setCourseForm}
                                    onCancel={() => setEditingCourseId(null)}
                                    onSave={saveCourse}
                                    busy={busy}
                                    isNew={editingCourseId === 'new'}
                                />
                            )}

                            {courses.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen className="w-8 h-8 text-[#022512]/15 mx-auto mb-2" />
                                    <p className="text-xs text-[#022512]/50 font-semibold">No courses yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {courses.map(c => (
                                        <div
                                            key={c.id}
                                            className={`p-3 rounded-xl border transition-colors ${
                                                selectedCourseId === c.id
                                                    ? 'border-[#1B5E3B] bg-[#1B5E3B]/5'
                                                    : 'border-[#022512]/10 hover:border-[#022512]/25'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2">
                                                <button
                                                    onClick={() => setSelectedCourseId(c.id)}
                                                    className="flex-1 text-left min-w-0"
                                                >
                                                    <p className="text-xs font-bold text-[#022512] truncate">
                                                        {c.title}
                                                    </p>
                                                    <p className="text-[10px] text-[#022512]/55 capitalize mt-0.5">
                                                        {c.difficulty_level} · {modules.filter(m => m.course_id === c.id).length} modules
                                                        {c.is_published === false && ' · draft'}
                                                    </p>
                                                </button>
                                                <button
                                                    onClick={() => startEditCourse(c)}
                                                    className="p-1.5 hover:bg-[#022512]/8 rounded-lg shrink-0"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5 text-[#022512]/60" />
                                                </button>
                                                <button
                                                    onClick={() => deleteCourse(c)}
                                                    className="p-1.5 hover:bg-[#A4372C]/10 rounded-lg shrink-0"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 text-[#A4372C]" />
                                                </button>
                                                <ChevronRight className="w-4 h-4 text-[#022512]/30 mt-1.5 shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Modules + Quiz column */}
                        <section className="bg-white rounded-2xl p-5 border border-[#022512]/5">
                            <div className="flex items-center justify-between mb-4">
                                <div className="min-w-0">
                                    <h2 className="text-sm font-black text-[#022512] truncate">
                                        {selectedCourse ? `Modules: ${selectedCourse.title}` : 'Modules'}
                                    </h2>
                                    {!selectedCourse && (
                                        <p className="text-xs text-[#022512]/45 mt-0.5">
                                            Select a course on the left to manage its modules
                                        </p>
                                    )}
                                </div>
                                {selectedCourse && (
                                    <button
                                        onClick={startNewModule}
                                        className="flex items-center gap-1.5 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] text-xs font-bold px-3 py-1.5 rounded-lg shrink-0"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> New Module
                                    </button>
                                )}
                            </div>

                            {selectedCourse && editingModuleId !== null && (
                                <ModuleEditor
                                    form={moduleForm}
                                    onChange={setModuleForm}
                                    onCancel={() => setEditingModuleId(null)}
                                    onSave={saveModule}
                                    busy={busy}
                                    isNew={editingModuleId === 'new'}
                                />
                            )}

                            {!selectedCourse ? null : courseModules.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="w-8 h-8 text-[#022512]/15 mx-auto mb-2" />
                                    <p className="text-xs text-[#022512]/50 font-semibold">
                                        No modules yet — click "New Module" to add one
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {courseModules.map(m => {
                                        const Icon = moduleTypeIcon(m.content_type);
                                        const quiz = m.content_type === 'quiz' ? quizForModule(m.id) : null;
                                        const quizQs = quiz ? questions.filter(q => q.quiz_id === quiz.id) : [];
                                        return (
                                            <div key={m.id} className="border border-[#022512]/10 rounded-xl">
                                                <div className="p-3 flex items-start gap-2">
                                                    <Icon className="w-4 h-4 text-[#022512]/45 mt-0.5 shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-[#022512] truncate">
                                                            {m.order_index}. {m.title}
                                                        </p>
                                                        <p className="text-[10px] text-[#022512]/45 mt-0.5">
                                                            {m.content_type || 'text'}
                                                            {m.duration_minutes != null && ` · ${m.duration_minutes} min`}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => startEditModule(m)}
                                                        className="p-1.5 hover:bg-[#022512]/8 rounded-lg shrink-0"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5 text-[#022512]/60" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteModule(m)}
                                                        className="p-1.5 hover:bg-[#A4372C]/10 rounded-lg shrink-0"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 text-[#A4372C]" />
                                                    </button>
                                                </div>

                                                {quiz && (
                                                    <div className="border-t border-[#022512]/8 p-3 bg-[#022512]/3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[10px] font-black uppercase tracking-wider text-[#A4372C]">
                                                                Quiz Questions ({quizQs.length})
                                                            </p>
                                                            <button
                                                                onClick={() => startNewQuestion(quiz.id)}
                                                                className="flex items-center gap-1 text-[10px] font-bold text-[#1B5E3B] hover:underline"
                                                            >
                                                                <Plus className="w-3 h-3" /> Add question
                                                            </button>
                                                        </div>

                                                        {editingQuestion?.quizId === quiz.id && (
                                                            <QuestionEditor
                                                                form={questionForm}
                                                                onChange={setQuestionForm}
                                                                onCancel={() => setEditingQuestion(null)}
                                                                onSave={saveQuestion}
                                                                busy={busy}
                                                                isNew={editingQuestion.questionId === 'new'}
                                                            />
                                                        )}

                                                        <div className="space-y-1">
                                                            {quizQs.map(q => (
                                                                <div
                                                                    key={q.id}
                                                                    className="bg-white p-2 rounded-lg flex items-start gap-2"
                                                                >
                                                                    <p className="text-[11px] text-[#022512] flex-1 min-w-0">
                                                                        {q.order_index}. {q.question_text}
                                                                    </p>
                                                                    <button
                                                                        onClick={() => startEditQuestion(q)}
                                                                        className="p-1 hover:bg-[#022512]/8 rounded shrink-0"
                                                                    >
                                                                        <Edit2 className="w-3 h-3 text-[#022512]/60" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deleteQuestion(q)}
                                                                        className="p-1 hover:bg-[#A4372C]/10 rounded shrink-0"
                                                                    >
                                                                        <Trash2 className="w-3 h-3 text-[#A4372C]" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {quizQs.length === 0 && (
                                                                <p className="text-[10px] text-[#022512]/45 text-center py-2">
                                                                    No questions yet
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

interface CourseEditorProps {
    form: CourseFormState;
    onChange: (s: CourseFormState) => void;
    onCancel: () => void;
    onSave: () => void;
    busy: boolean;
    isNew: boolean;
}

function CourseEditor({ form, onChange, onCancel, onSave, busy, isNew }: CourseEditorProps) {
    return (
        <div className="bg-[#022512]/3 border border-[#022512]/15 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-black text-[#022512]">
                    {isNew ? 'New Course' : 'Edit Course'}
                </p>
                <button onClick={onCancel} className="p-1 hover:bg-[#022512]/8 rounded">
                    <X className="w-3.5 h-3.5 text-[#022512]/60" />
                </button>
            </div>
            <Field label="Title">
                <input
                    type="text"
                    value={form.title}
                    onChange={e => onChange({ ...form, title: e.target.value })}
                    className="adminput"
                />
            </Field>
            <Field label="Description">
                <textarea
                    value={form.description}
                    onChange={e => onChange({ ...form, description: e.target.value })}
                    rows={3}
                    className="adminput resize-y"
                />
            </Field>
            <Field label="Thumbnail URL">
                <input
                    type="url"
                    value={form.thumbnail_url}
                    onChange={e => onChange({ ...form, thumbnail_url: e.target.value })}
                    className="adminput"
                    placeholder="https://…"
                />
            </Field>
            <div className="grid grid-cols-2 gap-3">
                <Field label="Difficulty">
                    <select
                        value={form.difficulty_level}
                        onChange={e => onChange({ ...form, difficulty_level: e.target.value })}
                        className="adminput capitalize"
                    >
                        {DIFFICULTY_OPTIONS.map(d => (
                            <option key={d} value={d} className="capitalize">{d}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Estimated hours">
                    <input
                        type="number"
                        min="0"
                        value={form.estimated_hours}
                        onChange={e => onChange({ ...form, estimated_hours: e.target.value })}
                        className="adminput"
                    />
                </Field>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-[#022512]">
                <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={e => onChange({ ...form, is_published: e.target.checked })}
                    className="accent-[#1B5E3B]"
                />
                Published
            </label>
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onSave}
                    disabled={busy || !form.title.trim()}
                    className="flex items-center gap-1.5 bg-[#1B5E3B] hover:bg-[#0d301e] disabled:opacity-60 text-[#F6F0E1] text-xs font-bold px-4 py-2 rounded-lg"
                >
                    <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button
                    onClick={onCancel}
                    className="text-xs font-bold text-[#022512]/55 hover:text-[#022512] px-3"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

interface ModuleEditorProps {
    form: ModuleFormState;
    onChange: (s: ModuleFormState) => void;
    onCancel: () => void;
    onSave: () => void;
    busy: boolean;
    isNew: boolean;
}

function ModuleEditor({ form, onChange, onCancel, onSave, busy, isNew }: ModuleEditorProps) {
    return (
        <div className="bg-[#022512]/3 border border-[#022512]/15 rounded-xl p-4 mb-4 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-black text-[#022512]">
                    {isNew ? 'New Module' : 'Edit Module'}
                </p>
                <button onClick={onCancel} className="p-1 hover:bg-[#022512]/8 rounded">
                    <X className="w-3.5 h-3.5 text-[#022512]/60" />
                </button>
            </div>
            <Field label="Title">
                <input
                    type="text"
                    value={form.title}
                    onChange={e => onChange({ ...form, title: e.target.value })}
                    className="adminput"
                />
            </Field>
            <Field label="Description">
                <textarea
                    value={form.description}
                    onChange={e => onChange({ ...form, description: e.target.value })}
                    rows={2}
                    className="adminput resize-y"
                />
            </Field>
            <div className="grid grid-cols-3 gap-3">
                <Field label="Order">
                    <input
                        type="number"
                        min="1"
                        value={form.order_index}
                        onChange={e => onChange({ ...form, order_index: e.target.value })}
                        className="adminput"
                    />
                </Field>
                <Field label="Type">
                    <select
                        value={form.content_type}
                        onChange={e => onChange({ ...form, content_type: e.target.value as ContentType })}
                        className="adminput capitalize"
                    >
                        {CONTENT_TYPE_OPTIONS.map(t => (
                            <option key={t} value={t} className="capitalize">{t}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Duration (min)">
                    <input
                        type="number"
                        min="0"
                        value={form.duration_minutes}
                        onChange={e => onChange({ ...form, duration_minutes: e.target.value })}
                        className="adminput"
                    />
                </Field>
            </div>
            {form.content_type === 'video' && (
                <Field label="Video Embed URL">
                    <input
                        type="url"
                        value={form.video_url}
                        onChange={e => onChange({ ...form, video_url: e.target.value })}
                        className="adminput"
                        placeholder="https://www.youtube.com/embed/…"
                    />
                </Field>
            )}
            <Field label={form.content_type === 'quiz' ? 'Intro / Instructions (HTML)' : 'Content (HTML)'}>
                <textarea
                    value={form.content}
                    onChange={e => onChange({ ...form, content: e.target.value })}
                    rows={6}
                    className="adminput resize-y font-mono text-xs"
                    placeholder="<h2>Module Title</h2><p>Body text…</p>"
                />
            </Field>
            <div className="flex gap-2 pt-1">
                <button
                    onClick={onSave}
                    disabled={busy || !form.title.trim()}
                    className="flex items-center gap-1.5 bg-[#1B5E3B] hover:bg-[#0d301e] disabled:opacity-60 text-[#F6F0E1] text-xs font-bold px-4 py-2 rounded-lg"
                >
                    <Save className="w-3.5 h-3.5" /> Save
                </button>
                <button
                    onClick={onCancel}
                    className="text-xs font-bold text-[#022512]/55 hover:text-[#022512] px-3"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

interface QuestionEditorProps {
    form: QuestionFormState;
    onChange: (s: QuestionFormState) => void;
    onCancel: () => void;
    onSave: () => void;
    busy: boolean;
    isNew: boolean;
}

function QuestionEditor({ form, onChange, onCancel, onSave, busy, isNew }: QuestionEditorProps) {
    const setOption = (idx: number, val: string) => {
        const opts = [...form.options];
        opts[idx] = val;
        onChange({ ...form, options: opts });
    };
    const addOption = () => onChange({ ...form, options: [...form.options, ''] });
    const removeOption = (idx: number) => onChange({ ...form, options: form.options.filter((_, i) => i !== idx) });

    return (
        <div className="bg-white border border-[#022512]/15 rounded-lg p-3 mb-2 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-wider text-[#022512]">
                    {isNew ? 'New Question' : 'Edit Question'}
                </p>
                <button onClick={onCancel} className="p-1 hover:bg-[#022512]/8 rounded">
                    <X className="w-3 h-3 text-[#022512]/60" />
                </button>
            </div>
            <textarea
                value={form.question_text}
                onChange={e => onChange({ ...form, question_text: e.target.value })}
                rows={2}
                className="adminput resize-y"
                placeholder="Question text"
            />
            <div className="space-y-1.5">
                {form.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="correct"
                            checked={form.correct_answer === opt && !!opt}
                            onChange={() => onChange({ ...form, correct_answer: opt })}
                            disabled={!opt.trim()}
                            className="accent-[#1B5E3B]"
                            title="Mark as correct answer"
                        />
                        <input
                            type="text"
                            value={opt}
                            onChange={e => {
                                const newOpt = e.target.value;
                                setOption(idx, newOpt);
                                if (form.correct_answer === opt) {
                                    onChange({
                                        ...form,
                                        options: form.options.map((o, i) => (i === idx ? newOpt : o)),
                                        correct_answer: newOpt,
                                    });
                                }
                            }}
                            className="adminput flex-1"
                            placeholder={`Option ${idx + 1}`}
                        />
                        {form.options.length > 2 && (
                            <button
                                onClick={() => removeOption(idx)}
                                className="p-1 hover:bg-[#A4372C]/10 rounded"
                            >
                                <X className="w-3.5 h-3.5 text-[#A4372C]" />
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={addOption}
                    className="text-[10px] font-bold text-[#1B5E3B] hover:underline flex items-center gap-1"
                >
                    <Plus className="w-3 h-3" /> Add option
                </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Field label="Points">
                    <input
                        type="number"
                        min="1"
                        value={form.points}
                        onChange={e => onChange({ ...form, points: e.target.value })}
                        className="adminput"
                    />
                </Field>
                <Field label="Order">
                    <input
                        type="number"
                        min="1"
                        value={form.order_index}
                        onChange={e => onChange({ ...form, order_index: e.target.value })}
                        className="adminput"
                    />
                </Field>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={onSave}
                    disabled={busy || !form.question_text.trim() || !form.correct_answer}
                    className="flex items-center gap-1.5 bg-[#1B5E3B] hover:bg-[#0d301e] disabled:opacity-60 text-[#F6F0E1] text-[10px] font-bold px-3 py-1.5 rounded"
                >
                    <Save className="w-3 h-3" /> Save
                </button>
                <button
                    onClick={onCancel}
                    className="text-[10px] font-bold text-[#022512]/55 hover:text-[#022512] px-2"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <label className="block">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#022512]/55 mb-1">
                {label}
            </span>
            {children}
        </label>
    );
}
