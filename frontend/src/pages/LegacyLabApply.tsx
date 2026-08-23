import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Lightbulb,
    User,
    Users,
    ShieldCheck,
    Rocket,
    Target,
    Heart,
    Paperclip,
    CheckCircle2,
    ArrowLeft,
    ArrowRight,
    Send,
    X,
} from 'lucide-react';
import { COUNTRY_OPTIONS } from '@/lib/countries';
import { isValidEmail, FormError } from '@/lib/googleForms';
import {
    submitLegacyLabApplication,
    type LegacyLabApplication,
    type LegacyLabAttachment,
} from '@/lib/legacyLab';

// ── Programme details (SET THESE before launch) ──────────────────────
const APPLICATION_DEADLINE = '26 September 2026'; // Empty renders "To be announced".
const SUPPORT_CONTACT = ''; // TODO: support email or WhatsApp. Empty hides the support line.

// Files are embedded in the JSON submission, which the backend caps at 2 MB.
// Keep well under that after base64 (~+33%). Larger files → use the link field.
const MAX_FILE_BYTES = 1_300_000;
const ACCEPTED_FILE_TYPES = '.pdf,.doc,.docx,.ppt,.pptx';

// ── Option sets ──────────────────────────────────────────────────────
const LEVEL_OPTIONS = [
    'Current undergraduate',
    'Current postgraduate',
    'Recent graduate',
    'Other',
];
const STUDENT_STATUS_OPTIONS = [
    'Yes - current student',
    'Yes - recent graduate',
    'No',
    'Other',
];
const YES_NO_UNSURE = ['Yes', 'No', 'Not sure'];
const THEMATIC_AREAS = [
    'Civic Leadership & Accountable Governance',
    'Dialogue, Peacebuilding & Social Cohesion',
    'Education, Skills & Youth Opportunity',
    'Climate & Sustainable Communities',
    'Technology for Public Good',
];
const STARTED_OPTIONS = ['Yes', 'No', 'Partly'];
const SUPPORT_OPTIONS = [
    'Mentorship',
    'Funding',
    'Research support',
    'Technical support',
    'Partnership access',
    'Media/storytelling support',
    'Other',
];
const BUDGET_OPTIONS = [
    'Less than $500',
    '$500-$1,000',
    '$1,000-$2,500',
    '$2,500-$5,000',
    'Above $5,000',
];
const REACH_OPTIONS = ['1-25', '26-50', '51-100', '101-250', '251-500', '500+'];

type StepId =
    | 'applicant'
    | 'team'
    | 'eligibility'
    | 'idea'
    | 'pilot'
    | 'impact'
    | 'supporting'
    | 'declarations';

const STEP_META: { id: StepId; title: string; icon: typeof User }[] = [
    { id: 'applicant', title: 'Applicant', icon: User },
    { id: 'team', title: 'Team', icon: Users },
    { id: 'eligibility', title: 'Eligibility', icon: ShieldCheck },
    { id: 'idea', title: 'Project Idea', icon: Lightbulb },
    { id: 'pilot', title: 'Pilot & Support', icon: Rocket },
    { id: 'impact', title: 'Impact', icon: Target },
    { id: 'supporting', title: 'Supporting', icon: Paperclip },
    { id: 'declarations', title: 'Declarations', icon: Heart },
];

type FormState = {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    institution: string;
    courseOfStudy: string;
    levelOfStudy: string;
    applicantType: '' | 'Individual' | 'Team';
    teamName: string;
    teamLead: string;
    teamMembers: string;
    teamInstitutions: string;
    studentStatus: string;
    availableIncubation: string;
    availableShowcase: string;
    understandNoGuarantee: boolean;
    projectTitle: string;
    thematicArea: string;
    ideaOneSentence: string;
    problem: string;
    affected: string;
    solution: string;
    whyItMatters: string;
    alreadyStarted: string;
    progressSoFar: string;
    pilotDescription: string;
    pilotLocation: string;
    supportNeeded: string[];
    supportOther: string;
    pilotBudget: string;
    changeHoped: string;
    beneficiaryReach: string;
    personalMotivation: string;
    links: string;
    declarationAccurate: boolean;
    declarationOriginal: boolean;
    declarationConsent: boolean;
    declarationParticipate: boolean;
};

const INITIAL_STATE: FormState = {
    fullName: '', email: '', phone: '', country: '', city: '', institution: '',
    courseOfStudy: '', levelOfStudy: '', applicantType: '',
    teamName: '', teamLead: '', teamMembers: '', teamInstitutions: '',
    studentStatus: '', availableIncubation: '', availableShowcase: '',
    understandNoGuarantee: false,
    projectTitle: '', thematicArea: '', ideaOneSentence: '', problem: '',
    affected: '', solution: '', whyItMatters: '', alreadyStarted: '', progressSoFar: '',
    pilotDescription: '', pilotLocation: '', supportNeeded: [], supportOther: '',
    pilotBudget: '', changeHoped: '', beneficiaryReach: '', personalMotivation: '',
    links: '', declarationAccurate: false, declarationOriginal: false,
    declarationConsent: false, declarationParticipate: false,
};

type Errors = Partial<Record<keyof FormState | 'attachment', string>>;

const countWords = (text: string): number =>
    text.trim() ? text.trim().split(/\s+/).length : 0;

// ── Shared styling ───────────────────────────────────────────────────
const inputBase =
    'bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] text-[#1B5E3B] placeholder:text-[#1B5E3B]/50 transition-colors';
const errorRing = 'border-[#A4372C] focus-visible:ring-[#A4372C] focus-visible:border-[#A4372C]';

// ── Presentational field primitives ──────────────────────────────────
function FieldShell({
    label, required, hint, error, children,
}: {
    label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-sm font-bold text-[#1B5E3B] mb-1.5">
                {label} {required && <span className="text-[#A4372C]">*</span>}
            </label>
            {hint && <p className="text-xs text-[#1B5E3B]/60 mb-2">{hint}</p>}
            {children}
            {error && <p className="text-sm text-[#A4372C] mt-1.5 font-medium">{error}</p>}
        </div>
    );
}

function SelectInput({
    value, onChange, options, placeholder, error,
}: {
    value: string; onChange: (v: string) => void; options: string[]; placeholder: string; error?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            className={`${inputBase} h-12 w-full rounded-md px-3 border ${value ? 'text-[#1B5E3B]' : 'text-[#1B5E3B]/50'} focus-visible:outline-none focus-visible:ring-2 appearance-none cursor-pointer ${error ? errorRing : ''}`}
        >
            <option value="" disabled>{placeholder}</option>
            {options.map((opt) => (
                <option key={opt} value={opt} className="text-[#1B5E3B]">{opt}</option>
            ))}
        </select>
    );
}

function RadioGroup({
    name, value, onChange, options, error,
}: {
    name: string; value: string; onChange: (v: string) => void; options: string[]; error?: string;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt) => {
                const selected = value === opt;
                return (
                    <label
                        key={opt}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${selected ? 'border-[#C8A046] bg-[#C8A046]/10' : `border-[#1B5E3B]/15 hover:border-[#C8A046]/50 ${error ? 'border-[#A4372C]/40' : ''}`}`}
                    >
                        <input
                            type="radio" name={name} value={opt} checked={selected}
                            onChange={() => onChange(opt)}
                            className="h-4 w-4 accent-[#1B5E3B]"
                        />
                        <span className="text-sm font-medium text-[#1B5E3B]">{opt}</span>
                    </label>
                );
            })}
        </div>
    );
}

function CheckboxGroup({
    values, onToggle, options, error,
}: {
    values: string[]; onToggle: (v: string) => void; options: string[]; error?: string;
}) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {options.map((opt) => {
                const selected = values.includes(opt);
                return (
                    <label
                        key={opt}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${selected ? 'border-[#C8A046] bg-[#C8A046]/10' : `border-[#1B5E3B]/15 hover:border-[#C8A046]/50 ${error ? 'border-[#A4372C]/40' : ''}`}`}
                    >
                        <input
                            type="checkbox" checked={selected} onChange={() => onToggle(opt)}
                            className="h-4 w-4 accent-[#1B5E3B]"
                        />
                        <span className="text-sm font-medium text-[#1B5E3B]">{opt}</span>
                    </label>
                );
            })}
        </div>
    );
}

function DeclarationCheckbox({
    checked, onChange, label, error,
}: {
    checked: boolean; onChange: (v: boolean) => void; label: string; error?: string;
}) {
    return (
        <label className={`flex items-start gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${checked ? 'border-[#C8A046] bg-[#C8A046]/10' : `border-[#1B5E3B]/15 hover:border-[#C8A046]/50 ${error ? 'border-[#A4372C]/50' : ''}`}`}>
            <input
                type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
                className="h-4 w-4 mt-0.5 accent-[#1B5E3B] shrink-0"
            />
            <span className="text-sm text-[#1B5E3B]/90">{label}</span>
        </label>
    );
}

function readFileAsBase64(file: File): Promise<LegacyLabAttachment> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result);
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve({ filename: file.name, mimeType: file.type || 'application/octet-stream', dataBase64: base64 });
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

export default function LegacyLabApply() {
    const { toast } = useToast();
    const [form, setForm] = useState<FormState>(INITIAL_STATE);
    const [attachment, setAttachment] = useState<LegacyLabAttachment | null>(null);
    const [errors, setErrors] = useState<Errors>({});
    const [stepIndex, setStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Steps shown depend on individual vs team.
    const steps = useMemo(
        () => STEP_META.filter((s) => s.id !== 'team' || form.applicantType === 'Team'),
        [form.applicantType],
    );
    const activeStep = steps[Math.min(stepIndex, steps.length - 1)];

    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    };

    const toggleSupport = (opt: string) => {
        setForm((prev) => ({
            ...prev,
            supportNeeded: prev.supportNeeded.includes(opt)
                ? prev.supportNeeded.filter((s) => s !== opt)
                : [...prev.supportNeeded, opt],
        }));
        if (errors.supportNeeded) setErrors((prev) => { const n = { ...prev }; delete n.supportNeeded; return n; });
    };

    const validateStep = (id: StepId): Errors => {
        const e: Errors = {};
        const req = (k: keyof FormState, msg: string) => {
            const v = form[k];
            if (typeof v === 'string' && !v.trim()) e[k] = msg;
        };
        if (id === 'applicant') {
            req('fullName', 'Full name is required.');
            if (!form.email.trim()) e.email = 'Email address is required.';
            else if (!isValidEmail(form.email)) e.email = 'Please enter a valid email address.';
            req('phone', 'Phone / WhatsApp number is required.');
            req('country', 'Please select your country.');
            req('city', 'City is required.');
            req('institution', 'Institution / university is required.');
            req('levelOfStudy', 'Please select your level.');
            if (!form.applicantType) e.applicantType = 'Please choose individual or team.';
        }
        if (id === 'team') {
            req('teamName', 'Team name is required.');
            req('teamLead', 'Team lead name is required.');
            req('teamMembers', 'Please list your other team members.');
        }
        if (id === 'eligibility') {
            req('studentStatus', 'Please select an option.');
            req('availableIncubation', 'Please select an option.');
            req('availableShowcase', 'Please select an option.');
            if (!form.understandNoGuarantee) e.understandNoGuarantee = 'Please confirm you understand.';
        }
        if (id === 'idea') {
            req('projectTitle', 'Project title is required.');
            req('thematicArea', 'Please select a thematic area.');
            req('ideaOneSentence', 'Please describe your idea in one sentence.');
            req('problem', 'Please describe the problem.');
            req('affected', 'Please describe who is affected.');
            req('solution', 'Please describe your proposed solution.');
            req('whyItMatters', 'Please tell us why this idea matters.');
            req('alreadyStarted', 'Please select an option.');
            if ((form.alreadyStarted === 'Yes' || form.alreadyStarted === 'Partly') && !form.progressSoFar.trim())
                e.progressSoFar = 'Please tell us what you have done so far.';
        }
        if (id === 'pilot') {
            req('pilotDescription', 'Please describe what a small pilot would look like.');
            req('pilotLocation', 'Please tell us where you would implement the pilot.');
            if (form.supportNeeded.length === 0) e.supportNeeded = 'Please select at least one type of support.';
            if (form.supportNeeded.includes('Other') && !form.supportOther.trim())
                e.supportOther = 'Please specify the other support you need.';
            req('pilotBudget', 'Please select an estimated budget.');
        }
        if (id === 'impact') {
            req('changeHoped', 'Please describe the change you hope to create.');
            req('beneficiaryReach', 'Please select an estimated reach.');
            req('personalMotivation', 'Please tell us why this matters to you.');
        }
        if (id === 'declarations') {
            if (!form.declarationAccurate) e.declarationAccurate = 'Required.';
            if (!form.declarationOriginal) e.declarationOriginal = 'Required.';
            if (!form.declarationConsent) e.declarationConsent = 'Required.';
            if (!form.declarationParticipate) e.declarationParticipate = 'Required.';
        }
        return e;
    };

    const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleNext = () => {
        const stepErrors = validateStep(activeStep.id);
        if (Object.keys(stepErrors).length > 0) {
            setErrors(stepErrors);
            toast({ variant: 'destructive', title: 'Please complete this step', description: 'Some required fields need your attention.' });
            return;
        }
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
        scrollTop();
    };

    const handleBack = () => {
        setStepIndex((i) => Math.max(i - 1, 0));
        scrollTop();
    };

    const handleFile = async (file: File | undefined) => {
        setErrors((prev) => { const n = { ...prev }; delete n.attachment; return n; });
        if (!file) { setAttachment(null); return; }
        if (file.size > MAX_FILE_BYTES) {
            setAttachment(null);
            setErrors((prev) => ({ ...prev, attachment: 'File is larger than 1.3 MB. Please attach a smaller file or share a link below instead.' }));
            return;
        }
        try {
            setAttachment(await readFileAsBase64(file));
        } catch {
            setErrors((prev) => ({ ...prev, attachment: "Couldn't read that file. Please try another." }));
        }
    };

    const handleSubmit = async () => {
        // Validate every step (guards against jumping around).
        const allErrors = steps.reduce<Errors>((acc, s) => ({ ...acc, ...validateStep(s.id) }), {});
        if (Object.keys(allErrors).length > 0) {
            setErrors(allErrors);
            const firstBadStep = steps.findIndex((s) => Object.keys(validateStep(s.id)).length > 0);
            if (firstBadStep >= 0) setStepIndex(firstBadStep);
            scrollTop();
            toast({ variant: 'destructive', title: 'Some answers are missing', description: 'We’ve highlighted what still needs completing.' });
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: LegacyLabApplication = {
                fullName: form.fullName, email: form.email, phone: form.phone,
                country: form.country, city: form.city, institution: form.institution,
                courseOfStudy: form.courseOfStudy || undefined,
                levelOfStudy: form.levelOfStudy,
                applicantType: form.applicantType as 'Individual' | 'Team',
                teamName: form.applicantType === 'Team' ? form.teamName : undefined,
                teamLead: form.applicantType === 'Team' ? form.teamLead : undefined,
                teamMembers: form.applicantType === 'Team' ? form.teamMembers : undefined,
                teamInstitutions: form.applicantType === 'Team' ? (form.teamInstitutions || undefined) : undefined,
                studentStatus: form.studentStatus,
                availableIncubation: form.availableIncubation,
                availableShowcase: form.availableShowcase,
                understandNoGuarantee: form.understandNoGuarantee,
                projectTitle: form.projectTitle, thematicArea: form.thematicArea,
                ideaOneSentence: form.ideaOneSentence, problem: form.problem,
                affected: form.affected, solution: form.solution, whyItMatters: form.whyItMatters,
                alreadyStarted: form.alreadyStarted,
                progressSoFar: form.progressSoFar || undefined,
                pilotDescription: form.pilotDescription, pilotLocation: form.pilotLocation,
                supportNeeded: form.supportNeeded,
                supportOther: form.supportNeeded.includes('Other') ? (form.supportOther || undefined) : undefined,
                pilotBudget: form.pilotBudget, changeHoped: form.changeHoped,
                beneficiaryReach: form.beneficiaryReach, personalMotivation: form.personalMotivation,
                links: form.links || undefined,
                attachment: attachment ?? undefined,
                declarationAccurate: form.declarationAccurate,
                declarationOriginal: form.declarationOriginal,
                declarationConsent: form.declarationConsent,
                declarationParticipate: form.declarationParticipate,
            };
            await submitLegacyLabApplication(payload);
            setSubmitted(true);
            scrollTop();
        } catch (error) {
            const message = error instanceof FormError ? error.message : 'Something unexpected happened. Please try again.';
            toast({ variant: 'destructive', title: 'Submission failed', description: message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const wordHint = (text: string, range: string) => `${countWords(text)} words · suggested ${range}`;

    // ── Confirmation screen ──────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B]">
                <SEO title="Application Received" description="Your PAUDC 2026 Legacy Lab application has been received." canonical="https://www.paudc2026.com/legacy-lab/apply" />
                <Navbar />
                <section className="pt-32 pb-24 px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-[#1B5E3B]/10 rounded-full">
                                <CheckCircle2 className="w-14 h-14 text-[#1B5E3B]" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-[#1B5E3B] mb-4">Application received</h1>
                        <p className="text-base md:text-lg text-[#1B5E3B]/80 leading-relaxed mb-6">
                            Thank you for applying to the PAUDC 2026 Legacy Lab. Your application has been received
                            successfully. The PAUDC Legacy Lab team will review all submissions after the application
                            deadline. Shortlisted applicants may be contacted for follow-up questions or interviews.
                        </p>
                        <p className="text-sm md:text-base text-[#1B5E3B]/70 mb-10">
                            Please monitor the email address and phone number you provided in this application. We
                            appreciate your interest in transforming ideas into practical impact across Africa.
                        </p>
                        <Link to="/legacy-lab">
                            <Button className="h-12 px-8 bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold rounded-xl">
                                Back to the Legacy Lab
                            </Button>
                        </Link>
                    </div>
                </section>
                <Footer />
            </div>
        );
    }

    const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B] relative overflow-hidden">
            <SEO
                title="Apply to the Legacy Lab"
                description="Apply to the PAUDC 2026 Legacy Lab — a civic and social innovation programme helping young Africans turn practical ideas into real community impact. Top projects are eligible for seed support of up to $5,000."
                canonical="https://www.paudc2026.com/legacy-lab/apply"
            />
            <Navbar />

            {/* Hero */}
            <section className="pt-24 md:pt-32 pb-12 md:pb-16 bg-[#1B5E3B] border-b-4 border-[#C8A046] relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A046]/20 border border-[#C8A046]/40 text-xs md:text-sm font-semibold tracking-wide uppercase mb-6">
                        <Lightbulb className="w-4 h-4" /> Call for Applications
                    </span>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-4 drop-shadow-sm">
                        PAUDC 2026 Legacy Lab
                    </h1>
                    <p className="text-base md:text-lg text-[#F6F0E1]/90 max-w-2xl mx-auto leading-relaxed">
                        The Legacy Lab helps young Africans transform practical ideas into real community impact.
                        Selected applicants receive mentorship and incubation, refine their ideas, and can pitch
                        during PAUDC 2026 in Abuja. Top projects are eligible for seed support of up to $5,000.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#F6F0E1]/80">
                        <span><strong className="text-[#C8A046]">Deadline:</strong> {APPLICATION_DEADLINE || 'To be announced'}</span>
                        <span><strong className="text-[#C8A046]">Time to complete:</strong> 15–20 minutes</span>
                        {SUPPORT_CONTACT && (
                            <span><strong className="text-[#C8A046]">Support:</strong> {SUPPORT_CONTACT}</span>
                        )}
                    </div>
                </div>
            </section>

            {/* Form */}
            <section className="py-10 md:py-16 relative z-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Progress */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-bold text-[#1B5E3B]">
                                Step {stepIndex + 1} of {steps.length}
                                <span className="text-[#1B5E3B]/60 font-medium"> · {activeStep.title}</span>
                            </p>
                            <p className="text-sm font-bold text-[#C8A046]">{progress}%</p>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#1B5E3B]/10 overflow-hidden">
                            <div className="h-full bg-[#C8A046] transition-all duration-300" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="mt-3 hidden sm:flex flex-wrap gap-1.5">
                            {steps.map((s, i) => (
                                <span
                                    key={s.id}
                                    className={`text-[11px] px-2.5 py-1 rounded-full border ${i === stepIndex ? 'bg-[#1B5E3B] text-[#F6F0E1] border-[#1B5E3B]' : i < stepIndex ? 'bg-[#1B5E3B]/10 text-[#1B5E3B] border-[#1B5E3B]/15' : 'text-[#1B5E3B]/50 border-[#1B5E3B]/15'}`}
                                >
                                    {s.title}
                                </span>
                            ))}
                        </div>
                    </div>

                    <Card className="border border-[#1B5E3B]/10 shadow-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-6 md:p-10 space-y-6">
                            <div className="flex items-center gap-3 border-b border-[#1B5E3B]/10 pb-4">
                                <activeStep.icon className="w-6 h-6 text-[#C8A046]" />
                                <h2 className="text-xl md:text-2xl font-bold text-[#1B5E3B]">{activeStep.title}</h2>
                            </div>

                            {/* ── Step 1: Applicant ── */}
                            {activeStep.id === 'applicant' && (
                                <div className="space-y-5">
                                    <FieldShell label="Full name" required error={errors.fullName}>
                                        <Input value={form.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Applicant or team lead full name" className={`${inputBase} h-12 ${errors.fullName ? errorRing : ''}`} />
                                    </FieldShell>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldShell label="Email address" required error={errors.email}>
                                            <Input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className={`${inputBase} h-12 ${errors.email ? errorRing : ''}`} />
                                        </FieldShell>
                                        <FieldShell label="Phone / WhatsApp number" required error={errors.phone}>
                                            <Input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234..." className={`${inputBase} h-12 ${errors.phone ? errorRing : ''}`} />
                                        </FieldShell>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldShell label="Country" required error={errors.country}>
                                            <SelectInput value={form.country} onChange={(v) => set('country', v)} options={COUNTRY_OPTIONS} placeholder="Select your country…" error={errors.country} />
                                        </FieldShell>
                                        <FieldShell label="City" required error={errors.city}>
                                            <Input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Current city of residence" className={`${inputBase} h-12 ${errors.city ? errorRing : ''}`} />
                                        </FieldShell>
                                    </div>
                                    <FieldShell label="Institution / University" required error={errors.institution}>
                                        <Input value={form.institution} onChange={(e) => set('institution', e.target.value)} placeholder="Current or most recent institution" className={`${inputBase} h-12 ${errors.institution ? errorRing : ''}`} />
                                    </FieldShell>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FieldShell label="Course / field of study" hint="Optional but useful." error={errors.courseOfStudy}>
                                            <Input value={form.courseOfStudy} onChange={(e) => set('courseOfStudy', e.target.value)} placeholder="e.g. Political Science" className={`${inputBase} h-12`} />
                                        </FieldShell>
                                        <FieldShell label="Level / year of study" required error={errors.levelOfStudy}>
                                            <SelectInput value={form.levelOfStudy} onChange={(v) => set('levelOfStudy', v)} options={LEVEL_OPTIONS} placeholder="Select your level…" error={errors.levelOfStudy} />
                                        </FieldShell>
                                    </div>
                                    <FieldShell label="Are you applying as an individual or as a team?" required error={errors.applicantType}>
                                        <RadioGroup name="applicantType" value={form.applicantType} onChange={(v) => set('applicantType', v as FormState['applicantType'])} options={['Individual', 'Team']} error={errors.applicantType} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 2: Team ── */}
                            {activeStep.id === 'team' && (
                                <div className="space-y-5">
                                    <FieldShell label="Team name" required hint="A working name is fine if you don't have a formal one." error={errors.teamName}>
                                        <Input value={form.teamName} onChange={(e) => set('teamName', e.target.value)} placeholder="Your team name" className={`${inputBase} h-12 ${errors.teamName ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Name of team lead" required error={errors.teamLead}>
                                        <div className="flex flex-col gap-1.5">
                                            <Input value={form.teamLead} onChange={(e) => set('teamLead', e.target.value)} placeholder="Team lead full name" className={`${inputBase} h-12 ${errors.teamLead ? errorRing : ''}`} />
                                            {form.fullName && form.teamLead !== form.fullName && (
                                                <button type="button" onClick={() => set('teamLead', form.fullName)} className="self-start text-xs font-semibold text-[#C8A046] hover:underline">
                                                    Use my name ({form.fullName})
                                                </button>
                                            )}
                                        </div>
                                    </FieldShell>
                                    <FieldShell label="Names of other team members" required hint="One name per line." error={errors.teamMembers}>
                                        <Textarea value={form.teamMembers} onChange={(e) => set('teamMembers', e.target.value)} placeholder={'Jane Doe\nJohn Smith'} className={`${inputBase} min-h-[110px] ${errors.teamMembers ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Institutions / countries represented" hint="Optional — helps us understand your team's diversity." error={errors.teamInstitutions}>
                                        <Textarea value={form.teamInstitutions} onChange={(e) => set('teamInstitutions', e.target.value)} placeholder="e.g. University of Lagos, Nigeria; University of Nairobi, Kenya" className={`${inputBase} min-h-[90px]`} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 3: Eligibility ── */}
                            {activeStep.id === 'eligibility' && (
                                <div className="space-y-6">
                                    <FieldShell label="Are you currently a university student or recent graduate?" required error={errors.studentStatus}>
                                        <RadioGroup name="studentStatus" value={form.studentStatus} onChange={(v) => set('studentStatus', v)} options={STUDENT_STATUS_OPTIONS} error={errors.studentStatus} />
                                    </FieldShell>
                                    <FieldShell label="Are you available for virtual incubation sessions between October and November 2026?" required error={errors.availableIncubation}>
                                        <RadioGroup name="availableIncubation" value={form.availableIncubation} onChange={(v) => set('availableIncubation', v)} options={YES_NO_UNSURE} error={errors.availableIncubation} />
                                    </FieldShell>
                                    <FieldShell label="If selected as a finalist, are you available for the Legacy Lab Showcase in Abuja in December 2026?" required hint="Final logistics will be communicated to finalists." error={errors.availableShowcase}>
                                        <RadioGroup name="availableShowcase" value={form.availableShowcase} onChange={(v) => set('availableShowcase', v)} options={YES_NO_UNSURE} error={errors.availableShowcase} />
                                    </FieldShell>
                                    <FieldShell label="Please confirm your understanding" required error={errors.understandNoGuarantee}>
                                        <DeclarationCheckbox checked={form.understandNoGuarantee} onChange={(v) => set('understandNoGuarantee', v)} label="I understand that selection into the Legacy Lab does not automatically guarantee seed funding." error={errors.understandNoGuarantee} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 4: Project idea ── */}
                            {activeStep.id === 'idea' && (
                                <div className="space-y-5">
                                    <FieldShell label="Project title" required hint="A working title is acceptable." error={errors.projectTitle}>
                                        <Input value={form.projectTitle} onChange={(e) => set('projectTitle', e.target.value)} placeholder="Your project title" className={`${inputBase} h-12 ${errors.projectTitle ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Which thematic area best fits your idea?" required error={errors.thematicArea}>
                                        <SelectInput value={form.thematicArea} onChange={(v) => set('thematicArea', v)} options={THEMATIC_AREAS} placeholder="Select a thematic area…" error={errors.thematicArea} />
                                    </FieldShell>
                                    <FieldShell label="Describe your idea in one sentence" required hint={wordHint(form.ideaOneSentence, '35–50 words')} error={errors.ideaOneSentence}>
                                        <Textarea value={form.ideaOneSentence} onChange={(e) => set('ideaOneSentence', e.target.value)} placeholder="One clear sentence summarising your idea." className={`${inputBase} min-h-[70px] ${errors.ideaOneSentence ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="What problem are you trying to solve?" required hint={wordHint(form.problem, '150–200 words')} error={errors.problem}>
                                        <Textarea value={form.problem} onChange={(e) => set('problem', e.target.value)} className={`${inputBase} min-h-[120px] ${errors.problem ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Who is affected by this problem?" required hint="Describe the target group or community." error={errors.affected}>
                                        <Textarea value={form.affected} onChange={(e) => set('affected', e.target.value)} className={`${inputBase} min-h-[100px] ${errors.affected ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="What is your proposed solution?" required hint={wordHint(form.solution, '200–250 words')} error={errors.solution}>
                                        <Textarea value={form.solution} onChange={(e) => set('solution', e.target.value)} className={`${inputBase} min-h-[130px] ${errors.solution ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Why does this idea matter?" required hint={wordHint(form.whyItMatters, '150–200 words')} error={errors.whyItMatters}>
                                        <Textarea value={form.whyItMatters} onChange={(e) => set('whyItMatters', e.target.value)} className={`${inputBase} min-h-[120px] ${errors.whyItMatters ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Have you already started working on this idea?" required error={errors.alreadyStarted}>
                                        <RadioGroup name="alreadyStarted" value={form.alreadyStarted} onChange={(v) => set('alreadyStarted', v)} options={STARTED_OPTIONS} error={errors.alreadyStarted} />
                                    </FieldShell>
                                    {(form.alreadyStarted === 'Yes' || form.alreadyStarted === 'Partly') && (
                                        <FieldShell label="What have you done so far?" required hint={wordHint(form.progressSoFar, '150–200 words')} error={errors.progressSoFar}>
                                            <Textarea value={form.progressSoFar} onChange={(e) => set('progressSoFar', e.target.value)} className={`${inputBase} min-h-[110px] ${errors.progressSoFar ? errorRing : ''}`} />
                                        </FieldShell>
                                    )}
                                </div>
                            )}

                            {/* ── Step 5: Pilot & support ── */}
                            {activeStep.id === 'pilot' && (
                                <div className="space-y-5">
                                    <FieldShell label="What would a small pilot of this idea look like?" required hint="Describe a realistic first version — not a large-scale rollout." error={errors.pilotDescription}>
                                        <Textarea value={form.pilotDescription} onChange={(e) => set('pilotDescription', e.target.value)} className={`${inputBase} min-h-[120px] ${errors.pilotDescription ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Where would you implement the pilot?" required hint="Campus, city, community, organisation or online community." error={errors.pilotLocation}>
                                        <Input value={form.pilotLocation} onChange={(e) => set('pilotLocation', e.target.value)} className={`${inputBase} h-12 ${errors.pilotLocation ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="What support would you need?" required hint="Select all that apply." error={errors.supportNeeded}>
                                        <CheckboxGroup values={form.supportNeeded} onToggle={toggleSupport} options={SUPPORT_OPTIONS} error={errors.supportNeeded} />
                                    </FieldShell>
                                    {form.supportNeeded.includes('Other') && (
                                        <FieldShell label="Please specify the other support you need" required error={errors.supportOther}>
                                            <Input value={form.supportOther} onChange={(e) => set('supportOther', e.target.value)} className={`${inputBase} h-12 ${errors.supportOther ? errorRing : ''}`} />
                                        </FieldShell>
                                    )}
                                    <FieldShell label="What is your estimated pilot budget?" required error={errors.pilotBudget}>
                                        <SelectInput value={form.pilotBudget} onChange={(v) => set('pilotBudget', v)} options={BUDGET_OPTIONS} placeholder="Select an estimated budget…" error={errors.pilotBudget} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 6: Impact ── */}
                            {activeStep.id === 'impact' && (
                                <div className="space-y-5">
                                    <FieldShell label="What change do you hope this project will create?" required hint={wordHint(form.changeHoped, '150–200 words')} error={errors.changeHoped}>
                                        <Textarea value={form.changeHoped} onChange={(e) => set('changeHoped', e.target.value)} className={`${inputBase} min-h-[120px] ${errors.changeHoped ? errorRing : ''}`} />
                                    </FieldShell>
                                    <FieldShell label="Approximately how many people could benefit from the first pilot?" required error={errors.beneficiaryReach}>
                                        <SelectInput value={form.beneficiaryReach} onChange={(v) => set('beneficiaryReach', v)} options={REACH_OPTIONS} placeholder="Select an estimated reach…" error={errors.beneficiaryReach} />
                                    </FieldShell>
                                    <FieldShell label="In one short paragraph, tell us why this idea matters to you personally." required hint={wordHint(form.personalMotivation, '150–200 words')} error={errors.personalMotivation}>
                                        <Textarea value={form.personalMotivation} onChange={(e) => set('personalMotivation', e.target.value)} className={`${inputBase} min-h-[120px] ${errors.personalMotivation ? errorRing : ''}`} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 7: Supporting material ── */}
                            {activeStep.id === 'supporting' && (
                                <div className="space-y-5">
                                    <p className="text-sm text-[#1B5E3B]/70">
                                        Supporting material is optional — a first-stage application does not require a full
                                        proposal. Share anything that helps us understand your idea.
                                    </p>
                                    <FieldShell label="Concept note, pitch deck or supporting document" hint="Optional. PDF, DOC, DOCX, PPT or PPTX, up to 1.3 MB. For larger files, share a link below." error={errors.attachment}>
                                        {attachment ? (
                                            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F0E1]/70 border border-[#1B5E3B]/15 px-4 py-3">
                                                <span className="flex items-center gap-2 text-sm font-medium text-[#1B5E3B] truncate">
                                                    <Paperclip className="w-4 h-4 shrink-0" /> {attachment.filename}
                                                </span>
                                                <button type="button" onClick={() => handleFile(undefined)} aria-label="Remove file" className="text-[#A4372C] hover:bg-[#A4372C]/10 rounded-lg p-1.5 shrink-0">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 cursor-pointer transition-colors ${errors.attachment ? 'border-[#A4372C]/50' : 'border-[#1B5E3B]/20 hover:border-[#C8A046]'}`}>
                                                <Paperclip className="w-6 h-6 text-[#C8A046]" />
                                                <span className="text-sm font-semibold text-[#1B5E3B]">Click to attach a file</span>
                                                <span className="text-xs text-[#1B5E3B]/50">PDF, DOC, DOCX, PPT, PPTX</span>
                                                <input type="file" accept={ACCEPTED_FILE_TYPES} className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
                                            </label>
                                        )}
                                    </FieldShell>
                                    <FieldShell label="Links to previous work, prototype, website, video or social media" hint="Optional. Add one link per line if you have several.">
                                        <Textarea value={form.links} onChange={(e) => set('links', e.target.value)} placeholder={'https://...\nhttps://...'} className={`${inputBase} min-h-[100px]`} />
                                    </FieldShell>
                                </div>
                            )}

                            {/* ── Step 8: Declarations ── */}
                            {activeStep.id === 'declarations' && (
                                <div className="space-y-3">
                                    <p className="text-sm text-[#1B5E3B]/70 mb-2">Please confirm each of the following to submit your application.</p>
                                    <DeclarationCheckbox checked={form.declarationAccurate} onChange={(v) => set('declarationAccurate', v)} label="I confirm that the information provided is accurate." error={errors.declarationAccurate} />
                                    <DeclarationCheckbox checked={form.declarationOriginal} onChange={(v) => set('declarationOriginal', v)} label="I confirm that this idea is my/our original work, or that I/we have the right to submit it." error={errors.declarationOriginal} />
                                    <DeclarationCheckbox checked={form.declarationConsent} onChange={(v) => set('declarationConsent', v)} label="I consent to PAUDC contacting me about my application." error={errors.declarationConsent} />
                                    <DeclarationCheckbox checked={form.declarationParticipate} onChange={(v) => set('declarationParticipate', v)} label="I understand that selected applicants will be expected to participate actively in the incubation process." error={errors.declarationParticipate} />
                                </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-[#1B5E3B]/10">
                                <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0}
                                    className="h-12 px-6 border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] font-bold rounded-xl disabled:opacity-40">
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                </Button>
                                {stepIndex < steps.length - 1 ? (
                                    <Button type="button" onClick={handleNext}
                                        className="h-12 px-8 bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold rounded-xl">
                                        Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button type="button" onClick={handleSubmit} disabled={isSubmitting}
                                        className="h-12 px-8 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold rounded-xl">
                                        {isSubmitting ? 'Submitting…' : <>Submit application <Send className="w-4 h-4 ml-2" /></>}
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <p className="text-center text-xs text-[#1B5E3B]/50 mt-6">
                        Fields marked with <span className="text-[#A4372C]">*</span> are required. Your progress is kept
                        on this page until you submit.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}
