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
import { User, Building, FileText, CheckCircle2, Calendar } from 'lucide-react';
import { EmailPillInput } from '@/components/EmailPillInput';
import { submitForm } from '@/lib/googleForms';

export default function Register() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [step, setStep] = useState(1);
    const [registrationType, setRegistrationType] = useState<'institution' | 'individual'>('institution');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        participant_role: '',
        // Institution fields
        institution_name: '',
        institution_country: '',
        contact_phone: '',
        your_contact_email: '',
        addressed_to: '',
        comments: '',
        // Individual fields
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        country: '',
        university: '',
    });

    // Unified styling variable for all text fields
    const uniformInputClasses = "bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] text-[#1B5E3B] placeholder:text-[#1B5E3B]/50 transition-colors";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const email = registrationType === 'institution' ? formData.your_contact_email : formData.email;
            const name = registrationType === 'institution'
                ? formData.institution_name
                : `${formData.first_name} ${formData.last_name}`;
            const phone = registrationType === 'institution' ? formData.contact_phone : formData.phone;
            const institution = registrationType === 'individual' ? formData.university : formData.institution_name;

            const success = await submitForm({
                type: 'registration',
                email,
                name,
                phone,
                institution,
                team: formData.participant_role,
                message: formData.comments
            });

            if (success) {
                toast({
                    title: "Registration Submitted",
                    description: "We've sent a confirmation email with further instructions.",
                });
                setTimeout(() => navigate('/'), 2000);
            } else {
                throw new Error('Failed to submit registration');
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: "Please check your details and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B] relative overflow-hidden">
            <SEO
                title="Request An Invite"
                description="Request an invitation to PAUDC 2026. Register your institution or apply as an individual participant for Africa's premier debating championship."
                canonical="https://www.paudc2026.com/invite"
            />
            <Navbar />

            {/* Decorative Blur Blobs */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[10%] -right-32 w-[500px] h-[500px] rounded-full bg-[#C8A046] opacity-30 blur-[120px]" />
                <div className="absolute top-[50%] -left-32 w-[600px] h-[600px] rounded-full bg-[#1B5E3B] opacity-20 blur-[150px]" />
            </div>

            {/* Hero Section */}
            <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-[#1B5E3B] border-b-4 border-[#C8A046] relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 drop-shadow-sm">
                        Registration
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 max-w-3xl mx-auto font-medium">
                        Join Africa's most prestigious debate championship
                    </p>
                </div>
            </section>

            {/* Policy Section */}
            <section className="py-12 md:py-24 relative z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12">
                        <FileText className="w-8 h-8 md:w-10 md:h-10 text-[#A4372C]" />
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B]">Registration Policy</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        <Card className="border border-[#1B5E3B]/20 shadow-lg bg-white/80 backdrop-blur-sm hover:border-[#1B5E3B] transition-colors">
                            <CardContent className="p-6 md:p-8">
                                <h3 className="text-lg md:text-2xl font-bold text-[#1B5E3B] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-[#1B5E3B]/10 rounded-lg"><Building className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    Team Eligibility
                                </h3>
                                <ul className="space-y-3 md:space-y-4 text-[#1B5E3B]/80 text-sm md:text-lg">
                                    <li className="flex items-start gap-3 md:gap-4">
                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#1B5E3B] flex-shrink-0 mt-0.5" />
                                        <span><strong>Composition:</strong> Each team must consist of exactly two speakers.</span>
                                    </li>
                                    <li className="flex items-start gap-3 md:gap-4">
                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[#1B5E3B] flex-shrink-0 mt-0.5" />
                                        <span><strong>Institution:</strong> Both speakers must be registered students of the same university.</span>
                                    </li>

                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border border-[#A4372C]/20 shadow-lg bg-white/80 backdrop-blur-sm hover:border-[#A4372C] transition-colors">
                            <CardContent className="p-6 md:p-8">
                                <h3 className="text-lg md:text-2xl font-bold text-[#A4372C] mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-[#A4372C]/10 rounded-lg"><Calendar className="w-5 h-5 md:w-6 md:h-6" /></div>
                                    Registration Timeline
                                </h3>
                                <div className="space-y-4 md:space-y-6">
                                    <div className="border-l-4 border-[#A4372C] pl-4 md:pl-6">
                                        <p className="text-sm md:text-base font-bold text-[#A4372C] mb-1">Phase 1</p>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg">April 20, 2026 - June 13, 2026</p>
                                    </div>
                                    <div className="border-l-4 border-[#A4372C] pl-4 md:pl-6">
                                        <p className="text-sm md:text-base font-bold text-[#A4372C] mb-1">Phase 2</p>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg">July 1, 2026 - August 31, 2026</p>
                                    </div>
                                    <div className="border-l-4 border-[#C8A046] pl-4 md:pl-6 pt-2">
                                        <p className="text-sm md:text-base font-bold text-[#C8A046] mb-1">Payment Deadline</p>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg">October 1, 2026</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Form Section */}
            <section className="py-24 bg-white relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-[#1B5E3B]/10 shadow-2xl rounded-3xl overflow-hidden">
                        <CardContent className="p-8 md:p-12">

                            {/* Registration Type Selector (Step 1) */}
                            {step === 1 && (
                                <div className="space-y-10">
                                    <div className="text-center">
                                        <h2 className="text-3xl font-black text-[#1B5E3B] mb-3">Select Registration Type</h2>
                                        <p className="text-lg text-[#1B5E3B]/70">Are you registering on behalf of an institution or as an individual?</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div
                                            className={`cursor-pointer p-8 rounded-2xl border-2 transition-all ${registrationType === 'institution' ? 'border-[#C8A046] bg-[#C8A046]/10 shadow-md transform -translate-y-1' : 'border-[#1B5E3B]/10 hover:border-[#C8A046]/50'}`}
                                            onClick={() => { setRegistrationType('institution'); setFormData(f => ({ ...f, participant_role: '' })); }}
                                        >
                                            <Building className={`w-14 h-14 mb-6 ${registrationType === 'institution' ? 'text-[#C8A046]' : 'text-[#1B5E3B]/40'}`} />
                                            <h3 className="text-2xl font-bold text-[#1B5E3B] mb-3">Institution Registration</h3>
                                            <p className="text-base text-[#1B5E3B]/70 font-medium">Register as a university or organization bringing multiple participants.</p>
                                        </div>

                                        <div
                                            className={`cursor-pointer p-8 rounded-2xl border-2 transition-all ${registrationType === 'individual' ? 'border-[#C8A046] bg-[#C8A046]/10 shadow-md transform -translate-y-1' : 'border-[#1B5E3B]/10 hover:border-[#C8A046]/50'}`}
                                            onClick={() => { setRegistrationType('individual'); setFormData(f => ({ ...f, participant_role: '' })); }}
                                        >
                                            <User className={`w-14 h-14 mb-6 ${registrationType === 'individual' ? 'text-[#C8A046]' : 'text-[#1B5E3B]/40'}`} />
                                            <h3 className="text-2xl font-bold text-[#1B5E3B] mb-3">Individual Registration</h3>
                                            <p className="text-base text-[#1B5E3B]/70 font-medium">Register as an independent adjudicator or observer.</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={() => setStep(2)} className="bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold px-10 h-14 text-lg rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                                            Continue
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Detail Form (Step 2) */}
                            {step === 2 && (
                                <form onSubmit={handleSubmit} className="space-y-8">

                                    {registrationType === 'institution' && (
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-bold text-[#1B5E3B] border-b border-[#1B5E3B]/10 pb-4">Institution Registration Form</h3>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Institution Name *</label>
                                                <Input name="institution_name" value={formData.institution_name} onChange={handleChange} required placeholder="Name of your institution" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Country *</label>
                                                <Input name="institution_country" value={formData.institution_country} onChange={handleChange} required placeholder="Country" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Contact Emails *</label>
                                                <EmailPillInput
                                                    value={formData.your_contact_email}
                                                    onChange={(value) => setFormData({ ...formData, your_contact_email: value })}
                                                    placeholder="Enter email and press Enter..."
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Contact Phone (Preferably Whatsapp) *</label>
                                                <Input name="contact_phone" type="tel" value={formData.contact_phone} onChange={handleChange} required placeholder="+234 xxx xxx xxxx" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">To Whom Should It Be Addressed *</label>
                                                <Textarea name="addressed_to" value={formData.addressed_to} onChange={handleTextareaChange} required placeholder={"The Vice Chancellor,\nVeritas University.\nBwari, Abuja"} className={`${uniformInputClasses} min-h-[80px] resize-none`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Any Other Comment</label>
                                                <Textarea name="comments" value={formData.comments} onChange={handleTextareaChange} placeholder="Any additional information or comments" className={`${uniformInputClasses} min-h-[80px]`} />
                                            </div>
                                        </div>
                                    )}

                                    {registrationType === 'individual' && (
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-bold text-[#1B5E3B] border-b border-[#1B5E3B]/10 pb-4">Individual Registration Form</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-bold text-[#1B5E3B] mb-2">First Name *</label>
                                                    <Input name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="First name" className={`${uniformInputClasses} h-12`} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Last Name *</label>
                                                    <Input name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="Last name" className={`${uniformInputClasses} h-12`} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Email Address *</label>
                                                <Input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="your.email@example.com" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Phone Number *</label>
                                                <Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+234 xxx xxx xxxx" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">Country *</label>
                                                <Input name="country" value={formData.country} onChange={handleChange} required placeholder="Country" className={`${uniformInputClasses} h-12`} />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-[#1B5E3B] mb-2">University</label>
                                                <Input name="university" value={formData.university} onChange={handleChange} placeholder="University name (optional)" className={`${uniformInputClasses} h-12`} />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10">
                                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full sm:w-auto h-14 px-8 border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] text-lg font-bold rounded-xl">
                                            Back
                                        </Button>
                                        <Button type="submit" className="w-full sm:w-auto h-14 px-10 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] text-lg font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1" disabled={isSubmitting}>
                                            {isSubmitting ? 'Submitting...' : 'Complete Registration'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}