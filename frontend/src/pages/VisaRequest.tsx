import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    Plane,
    FileText,
    Stamp,
    Mail,
    ShieldCheck,
    Clock,
    User,
    Globe,
    BadgeCheck,
    CalendarDays,
    Download,
} from 'lucide-react';
import { submitForm, isValidEmail, FormError } from '@/lib/googleForms';
import visaPolicyDoc from '@/assets/docs/PAUDC Abuja Visa Policy Document.pdf?url';

const ROLE_OPTIONS = [
    'Speaker / Debater',
    'Adjudicator',
    'Team Coach / Manager',
    'Observer',
    'Guest / Official',
] as const;

const STEPS = [
    {
        icon: FileText,
        title: 'Submit your details',
        body: 'Complete the form below with your passport and travel information exactly as it appears on your documents.',
    },
    {
        icon: Stamp,
        title: 'We prepare your letter',
        body: 'Our secretariat drafts an official visa invitation letter on Veritas University letterhead to support your application.',
    },
    {
        icon: Mail,
        title: 'Receive it by email',
        body: 'You will receive a signed, stamped PDF invitation letter — typically within 5–7 working days.',
    },
    {
        icon: Plane,
        title: 'Apply for your visa',
        body: 'Present the letter, alongside your other documents, at your nearest Nigerian embassy or consulate.',
    },
] as const;

export default function VisaRequest() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        nationality: '',
        passport_number: '',
        institution: '',
        role: '',
        arrival_date: '',
        departure_date: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const uniformInputClasses =
        'bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] text-[#1B5E3B] placeholder:text-[#1B5E3B]/50 transition-colors';
    const errorInputClasses =
        'border-[#A4372C] focus-visible:ring-[#A4372C] focus-visible:border-[#A4372C]';

    const fieldClass = (field: string) =>
        `${uniformInputClasses} h-12 ${errors[field] ? errorInputClasses : ''}`;

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        clearError(e.target.name);
    };

    const validate = (): Record<string, string> => {
        const errs: Record<string, string> = {};
        if (!formData.full_name.trim()) errs.full_name = 'Full name (as on passport) is required.';
        if (!formData.email.trim()) errs.email = 'Email address is required.';
        else if (!isValidEmail(formData.email)) errs.email = 'Please enter a valid email address.';
        if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
        if (!formData.nationality.trim()) errs.nationality = 'Nationality is required.';
        if (!formData.passport_number.trim()) errs.passport_number = 'Passport number is required.';
        if (!formData.institution.trim()) errs.institution = 'Institution / university is required.';
        if (!formData.role.trim()) errs.role = 'Please select your role at PAUDC 2026.';
        return errs;
    };

    const buildMessage = (): string => {
        const lines = [
            `Passport number: ${formData.passport_number}`,
            formData.arrival_date ? `Expected arrival: ${formData.arrival_date}` : '',
            formData.departure_date ? `Expected departure: ${formData.departure_date}` : '',
            formData.notes ? `\nAdditional notes:\n${formData.notes}` : '',
        ];
        return lines.filter(Boolean).join('\n');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast({
                variant: 'destructive',
                title: 'Please fix the highlighted fields',
                description: 'Some required information is missing or invalid.',
            });
            return;
        }
        setErrors({});
        setIsSubmitting(true);

        try {
            await submitForm({
                type: 'visa',
                email: formData.email,
                name: formData.full_name,
                phone: formData.phone,
                country: formData.nationality,
                institution: formData.institution,
                team: formData.role,
                message: buildMessage(),
            });

            toast({
                title: 'Visa Letter Requested',
                description:
                    "We've received your request. Your invitation letter will be emailed within 5–7 working days.",
            });
            setTimeout(() => navigate('/'), 2500);
        } catch (error) {
            const isFormError = error instanceof FormError;
            const titleByCode: Record<string, string> = {
                offline: "You're offline",
                network: "Couldn't reach our servers",
                timeout: 'Request timed out',
                unknown: 'Submission failed',
            };
            toast({
                variant: 'destructive',
                title: isFormError ? titleByCode[error.code] : 'Submission failed',
                description: isFormError
                    ? error.message
                    : 'Something unexpected happened. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B] relative overflow-hidden">
            <SEO
                title="Request a Visa Letter"
                description="Request an official visa invitation letter for PAUDC 2026. International participants can obtain a signed invitation letter to support their visa application to Nigeria."
                canonical="https://www.paudc2026.com/visa"
            />
            <Navbar />

            {/* Decorative Blur Blobs */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[10%] -right-32 w-[500px] h-[500px] rounded-full bg-[#C8A046] opacity-30 blur-[120px]" />
                <div className="absolute top-[55%] -left-32 w-[600px] h-[600px] rounded-full bg-[#1B5E3B] opacity-20 blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-[#1B5E3B] border-b-4 border-[#C8A046] relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A046]/20 border border-[#C8A046]/40 text-[#F6F0E1] text-xs md:text-sm font-semibold tracking-wide uppercase mb-6">
                        <Plane className="w-4 h-4" /> International Participants
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 drop-shadow-sm">
                        Request a Visa Letter
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 max-w-3xl mx-auto font-medium">
                        Travelling to Abuja for PAUDC 2026? Request your official invitation letter to
                        support your Nigerian visa application.
                    </p>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 md:py-24 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-14">
                        <BadgeCheck className="w-8 h-8 md:w-10 md:h-10 text-[#A4372C]" />
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B]">How It Works</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {STEPS.map((step, index) => (
                            <Card
                                key={step.title}
                                className="relative border border-[#1B5E3B]/15 shadow-lg bg-white/80 backdrop-blur-sm hover:border-[#C8A046] hover:-translate-y-1 transition-all"
                            >
                                <CardContent className="p-6 md:p-7">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="p-3 bg-[#1B5E3B]/10 rounded-xl">
                                            <step.icon className="w-6 h-6 md:w-7 md:h-7 text-[#1B5E3B]" />
                                        </div>
                                        <span className="text-4xl font-black text-[#C8A046]/30 leading-none">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1B5E3B] mb-2">{step.title}</h3>
                                    <p className="text-sm text-[#1B5E3B]/70 leading-relaxed">{step.body}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Important notice */}
                    <Card className="mt-8 md:mt-10 border border-[#A4372C]/25 shadow-lg bg-[#A4372C]/[0.04]">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-[#A4372C]/10 rounded-lg shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-[#A4372C]" />
                                </div>
                                <div className="space-y-3 text-sm md:text-base text-[#1B5E3B]/80">
                                    <p className="font-bold text-[#A4372C] text-base md:text-lg">
                                        Before you request
                                    </p>
                                    <ul className="space-y-2 list-disc list-inside marker:text-[#C8A046]">
                                        <li>
                                            An invitation letter supports — but does not guarantee — the issuance of a
                                            visa. All decisions rest with the relevant embassy or consulate.
                                        </li>
                                        <li>
                                            Enter every detail <strong>exactly</strong> as it appears on your passport.
                                        </li>
                                        <li>
                                            Your passport should be valid for at least six months beyond your intended
                                            travel dates.
                                        </li>
                                        <li className="flex items-center gap-2 pt-1 text-[#1B5E3B]/70">
                                            <Clock className="w-4 h-4 text-[#C8A046]" /> Please allow 5–7 working days for
                                            processing.
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visa policy download */}
                    <Card className="mt-6 md:mt-8 border border-[#1B5E3B]/15 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-[#1B5E3B]/10 rounded-xl shrink-0">
                                        <FileText className="w-6 h-6 md:w-7 md:h-7 text-[#1B5E3B]" />
                                    </div>
                                    <div>
                                        <p className="text-base md:text-lg font-bold text-[#1B5E3B]">
                                            PAUDC Abuja Visa Policy Document
                                        </p>
                                        <p className="text-sm text-[#1B5E3B]/70">
                                            Read the full visa policy and requirements before you apply (PDF).
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={visaPolicyDoc}
                                    download="PAUDC Abuja Visa Policy Document.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto shrink-0"
                                >
                                    <Button className="w-full sm:w-auto h-12 px-6 bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold rounded-xl whitespace-nowrap">
                                        <Download className="w-5 h-5 mr-2" /> Download Policy
                                    </Button>
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-16 md:py-24 bg-white relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-[#1B5E3B]/10 shadow-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl md:text-3xl font-black text-[#1B5E3B] mb-3">
                                    Visa Invitation Letter Request
                                </h2>
                                <p className="text-base md:text-lg text-[#1B5E3B]/70">
                                    Fields marked with <span className="text-[#A4372C] font-bold">*</span> are required.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-10" noValidate>
                                {/* Personal & Passport */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-3 text-xl font-bold text-[#1B5E3B] border-b border-[#1B5E3B]/10 pb-4">
                                        <User className="w-5 h-5 text-[#C8A046]" /> Personal &amp; Passport Details
                                    </h3>

                                    <div>
                                        <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                            Full Name (as is on your international passport) *
                                        </label>
                                        <Input
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="e.g. Amara Nwosu Okeke"
                                            className={fieldClass('full_name')}
                                            aria-invalid={!!errors.full_name}
                                        />
                                        {errors.full_name && (
                                            <p className="text-sm text-[#A4372C] mt-1.5 font-medium">{errors.full_name}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Email Address *
                                            </label>
                                            <Input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="your.email@example.com"
                                                className={fieldClass('email')}
                                                aria-invalid={!!errors.email}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">{errors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Phone (WhatsApp preferred) *
                                            </label>
                                            <Input
                                                name="phone"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+xxx xxx xxx xxxx"
                                                className={fieldClass('phone')}
                                                aria-invalid={!!errors.phone}
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">{errors.phone}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Nationality *
                                            </label>
                                            <Input
                                                name="nationality"
                                                value={formData.nationality}
                                                onChange={handleChange}
                                                placeholder="Country of citizenship"
                                                className={fieldClass('nationality')}
                                                aria-invalid={!!errors.nationality}
                                            />
                                            {errors.nationality && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">
                                                    {errors.nationality}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Passport Number *
                                            </label>
                                            <Input
                                                name="passport_number"
                                                value={formData.passport_number}
                                                onChange={handleChange}
                                                placeholder="e.g. A01234567"
                                                className={fieldClass('passport_number')}
                                                aria-invalid={!!errors.passport_number}
                                            />
                                            {errors.passport_number && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">
                                                    {errors.passport_number}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Role & Institution */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-3 text-xl font-bold text-[#1B5E3B] border-b border-[#1B5E3B]/10 pb-4">
                                        <Globe className="w-5 h-5 text-[#C8A046]" /> Your Role &amp; Institution
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Institution / University *
                                            </label>
                                            <Input
                                                name="institution"
                                                value={formData.institution}
                                                onChange={handleChange}
                                                placeholder="Your university or organisation"
                                                className={fieldClass('institution')}
                                                aria-invalid={!!errors.institution}
                                            />
                                            {errors.institution && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">
                                                    {errors.institution}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Role at PAUDC 2026 *
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                aria-invalid={!!errors.role}
                                                className={`${fieldClass('role')} w-full rounded-md px-3 border ${
                                                    formData.role ? 'text-[#1B5E3B]' : 'text-[#1B5E3B]/50'
                                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A046] appearance-none cursor-pointer`}
                                            >
                                                <option value="" disabled>
                                                    Select your role…
                                                </option>
                                                {ROLE_OPTIONS.map((role) => (
                                                    <option key={role} value={role} className="text-[#1B5E3B]">
                                                        {role}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.role && (
                                                <p className="text-sm text-[#A4372C] mt-1.5 font-medium">{errors.role}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Travel & Embassy */}
                                <div className="space-y-6">
                                    <h3 className="flex items-center gap-3 text-xl font-bold text-[#1B5E3B] border-b border-[#1B5E3B]/10 pb-4">
                                        <CalendarDays className="w-5 h-5 text-[#C8A046]" /> Travel Details
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Expected Arrival Date
                                            </label>
                                            <Input
                                                name="arrival_date"
                                                type="date"
                                                value={formData.arrival_date}
                                                onChange={handleChange}
                                                className={`${uniformInputClasses} h-12`}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Expected Departure Date
                                            </label>
                                            <Input
                                                name="departure_date"
                                                type="date"
                                                value={formData.departure_date}
                                                onChange={handleChange}
                                                className={`${uniformInputClasses} h-12`}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                            Additional Notes
                                        </label>
                                        <Textarea
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Anything else the secretariat should know (optional)"
                                            className={`${uniformInputClasses} min-h-[90px]`}
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate('/invite')}
                                        className="w-full sm:w-auto h-14 px-8 border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] text-lg font-bold rounded-xl"
                                    >
                                        Back to Registration
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="w-full sm:w-auto h-14 px-10 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] text-lg font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Submitting…' : 'Request Visa Letter'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}
