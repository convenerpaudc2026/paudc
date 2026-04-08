import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default function Contact() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/contact/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSubmitStatus({ type: 'success', message: data.message });
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                setSubmitStatus({
                    type: 'error',
                    message: data.detail || 'Failed to send message. Please try again.'
                });
            }
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: 'Network error. Please check your connection and try again.'
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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 drop-shadow-md">
                        Contact Us
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 font-medium max-w-2xl mx-auto">
                        Get in touch with the PAUDC 2026 organizing team
                    </p>
                </div>
            </section>

            {/* Contact Content */}
            <section className="py-12 md:py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-10 md:gap-16">

                        {/* Contact Information */}
                        <div className="flex flex-col justify-center">
                            <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-6 md:mb-8">
                                Get in Touch
                            </h2>
                            <p className="text-sm md:text-lg text-[#1B5E3B]/80 mb-8 md:mb-10 leading-relaxed">
                                Whether you have questions about registration, scheduling, or sponsorship opportunities, our team is here to help. Reach out to us through any of the channels below.
                            </p>

                            <div className="space-y-6 md:space-y-8">
                                <div className="flex items-start gap-4 md:gap-5 group">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#1B5E3B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1B5E3B] transition-colors duration-300">
                                        <Mail className="h-6 w-6 md:h-7 md:w-7 text-[#1B5E3B] group-hover:text-[#F6F0E1] transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-1">Email</h3>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg">info@paudc2026.com</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 md:gap-5 group">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#A4372C]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#A4372C] transition-colors duration-300">
                                        <Phone className="h-6 w-6 md:h-7 md:w-7 text-[#A4372C] group-hover:text-[#F6F0E1] transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-1">Phone</h3>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg">+234 901 199 6325</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 md:gap-5 group">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-[#C8A046]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C8A046] transition-colors duration-300">
                                        <MapPin className="h-6 w-6 md:h-7 md:w-7 text-[#C8A046] group-hover:text-[#1B5E3B] transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-1">Location</h3>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg leading-relaxed">
                                            Veritas University<br />
                                            Bwari<br />
                                            Abuja, Nigeria
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <Card className="border border-[#1B5E3B]/10 shadow-xl rounded-3xl bg-white overflow-hidden">
                                <CardContent className="p-8 md:p-10">
                                    {submitStatus && (
                                        <div className={`mb-6 p-4 rounded-xl ${
                                            submitStatus.type === 'success' 
                                                ? 'bg-green-50 border border-green-200 text-green-800' 
                                                : 'bg-red-50 border border-red-200 text-red-800'
                                        }`}>
                                            {submitStatus.message}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                    Name
                                                </label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                    className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] h-12"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                    Email
                                                </label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                    className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] h-12"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Subject
                                            </label>
                                            <Input
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                required
                                                className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] h-12"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="block text-sm font-bold text-[#1B5E3B] mb-2">
                                                Message
                                            </label>
                                            <Textarea
                                                id="message"
                                                rows={5}
                                                value={formData.message}
                                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                required
                                                className="bg-[#F6F0E1]/50 border-[#1B5E3B]/20 focus-visible:ring-[#C8A046] focus-visible:border-[#C8A046] resize-none"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-[#1B5E3B] hover:bg-[#0d301e] text-[#F6F0E1] font-bold h-14 rounded-xl text-lg transition-transform hover:-translate-y-1 shadow-md"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                'Sending...'
                                            ) : (
                                                <>
                                                    <Send className="h-5 w-5 mr-2" />
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-24 bg-[#1B5E3B] text-[#F6F0E1] relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold mb-4">
                            Find Us
                        </h2>
                        <p className="text-xl text-[#F6F0E1]/80 flex items-center justify-center gap-2">
                            <MapPin className="text-[#C8A046]" />
                            Veritas University, Abuja, Nigeria
                        </p>
                    </div>
                    <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] border-4 border-[#F6F0E1]/10 bg-[#F6F0E1]">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3937.531278278783!2d7.411649075841029!3d9.286161484643034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104dde3a48e77a25%3A0xc31b0fc2512f6236!2sVeritas%20University!5e0!3m2!1sen!2sng!4v1700000000000!5m2!1sen!2sng"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}