import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Users, Rocket, Target, Heart, Globe } from 'lucide-react';

export default function LegacyLab() {
    const pillars = [
        {
            icon: <Lightbulb className="h-7 w-7 text-[#A4372C]" />,
            title: "Innovation & Creativity",
            description: "Fostering innovative thinking and creative problem-solving approaches."
        },
        {
            icon: <Users className="h-7 w-7 text-[#A4372C]" />,
            title: "Youth Leadership",
            description: "Empowering the next generation of African leaders with critical thinking skills."
        },
        {
            icon: <Globe className="h-7 w-7 text-[#A4372C]" />,
            title: "Continental Connection",
            description: "Building bridges across the continent by bringing together diverse perspectives."
        },
        {
            icon: <Target className="h-7 w-7 text-[#A4372C]" />,
            title: "Research & Publications",
            description: "Supporting academic research on debate pedagogy, African perspectives, and policy."
        },
        {
            icon: <Heart className="h-7 w-7 text-[#A4372C]" />,
            title: "Alumni Network",
            description: "Building a strong community of PAUDC alumni who continue to contribute to society."
        },
        {
            icon: <Rocket className="h-7 w-7 text-[#A4372C]" />,
            title: "Education & Training",
            description: "Providing world-class debate sessions and workshops focused on skill-building."
        }
    ];

    return (
        <div className="min-h-screen bg-white text-[#1B5E3B]">
            <SEO
                title="Legacy Lab"
                description="PAUDC 2026 Legacy Lab - Building Africa's intellectual future through innovation, youth leadership, and continental connection."
                canonical="https://www.paudc2026.com/legacy-lab"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-[#A4372C] to-[#C8A046]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-[#F6F0E1]/15 rounded-full backdrop-blur-sm">
                            <Lightbulb className="h-12 w-12 md:h-14 md:w-14 text-[#F6F0E1]" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-6 drop-shadow-md">
                        The Legacy Lab
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 max-w-3xl mx-auto font-medium">
                        A youth-led innovation space that transforms debate ideas into actionable projects.
                    </p>
                </div>
            </section>

            {/* Core Pillars */}
            <section className="py-12 md:py-20 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-3 md:mb-4">Core Pillars</h2>
                        <p className="text-base md:text-lg text-[#1B5E3B]/70 max-w-2xl mx-auto">
                            Six guiding pillars shape the Legacy Lab's mission to turn dialogue into lasting impact.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {pillars.map((pillar, index) => (
                            <Card
                                key={index}
                                className="border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all bg-white"
                            >
                                <CardContent className="p-6 md:p-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#A4372C]/10 flex items-center justify-center mb-4 md:mb-6">
                                        {pillar.icon}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-3">{pillar.title}</h3>
                                    <p className="text-sm md:text-base text-[#1B5E3B]/80 leading-relaxed">{pillar.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Apply Call-out */}
            <section className="py-12 md:py-20 bg-[#F6F0E1] px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="rounded-3xl bg-[#1B5E3B] text-[#F6F0E1] p-8 md:p-14 shadow-2xl border-4 border-[#C8A046] text-center">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A046]/20 border border-[#C8A046]/40 text-xs md:text-sm font-semibold tracking-wide uppercase mb-6">
                            <Lightbulb className="w-4 h-4" /> Call for Applications
                        </span>
                        <h2 className="text-2xl md:text-4xl font-black mb-4">Have an idea worth building?</h2>
                        <p className="text-base md:text-lg text-[#F6F0E1]/90 max-w-2xl mx-auto mb-8 leading-relaxed">
                            Apply to the Legacy Lab to receive mentorship and incubation, refine your idea, and pitch
                            during PAUDC 2026 in Abuja. Top projects are eligible for seed support of up to
                            <strong className="text-[#C8A046]"> $5,000</strong>. It takes about 15–20 minutes.
                        </p>
                        <a href="/legacy-lab/apply">
                            <button className="px-10 py-4 bg-[#C8A046] text-[#022512] rounded-xl font-bold text-lg hover:bg-[#b08c3e] transition shadow-lg hover:-translate-y-1">
                                Apply to the Legacy Lab
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16 md:py-24 bg-white text-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-black text-[#1B5E3B] mb-4 md:mb-6">Join The Movement</h2>
                    <p className="text-base md:text-lg text-[#1B5E3B]/70 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed">
                        Be part of Africa's largest youth-led innovation space. Whether you're a debater, an
                        adjudicator, or an observer, there is a place for you in the Legacy Lab community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/invite">
                            <button className="px-8 py-3 bg-[#C8A046] text-[#022512] rounded-full font-bold hover:bg-[#b08c3e] transition shadow-lg w-full sm:w-auto">
                                Request an invite
                            </button>
                        </a>
                        <a href="/contact">
                            <button className="px-8 py-3 bg-[#1B5E3B] text-[#F6F0E1] rounded-full font-bold hover:bg-[#A4372C] transition shadow-lg w-full sm:w-auto">
                                Get Involved
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
