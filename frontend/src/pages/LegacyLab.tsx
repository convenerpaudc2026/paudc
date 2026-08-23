import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Landmark, HeartHandshake, GraduationCap, Leaf, Cpu, HelpCircle, ChevronDown, FileText, Search, Sparkles, Presentation, Award } from 'lucide-react';

export default function LegacyLab() {
    const thematicAreas = [
        {
            icon: <Landmark className="h-7 w-7 text-[#A4372C]" />,
            title: "Civic Leadership & Accountable Governance",
            description: "Ideas under this theme should help young people engage constructively with public life, strengthen civic education, improve accountability, or make governance more accessible to communities."
        },
        {
            icon: <HeartHandshake className="h-7 w-7 text-[#A4372C]" />,
            title: "Dialogue, Peacebuilding & Social Cohesion",
            description: "This theme welcomes ideas that use dialogue, education, storytelling or community engagement to reduce division, build trust and strengthen understanding across communities."
        },
        {
            icon: <GraduationCap className="h-7 w-7 text-[#A4372C]" />,
            title: "Education, Skills & Youth Opportunity",
            description: "Projects in this area should improve access to learning, build practical skills, support employability, or expand opportunities for young Africans."
        },
        {
            icon: <Leaf className="h-7 w-7 text-[#A4372C]" />,
            title: "Climate & Sustainable Communities",
            description: "This theme is for practical ideas that address climate, environmental or sustainability challenges at campus, community or local level."
        },
        {
            icon: <Cpu className="h-7 w-7 text-[#A4372C]" />,
            title: "Technology for Public Good",
            description: "Ideas in this category should use technology to solve real social problems, improve access, promote inclusion, or strengthen community systems."
        }
    ];

    const faqs = [
        {
            q: "What is the PAUDC 2026 Legacy Lab?",
            a: "The Legacy Lab is a civic and social innovation programme designed to help young Africans transform practical ideas into real community impact through mentorship, incubation, showcase opportunities and implementation support."
        },
        {
            q: "Who can apply?",
            a: "Young Africans, especially university students and recent graduates, may apply as individuals or teams with ideas that address a clear social or civic problem."
        },
        {
            q: "Do I need to be a debater to apply?",
            a: "No. While the Legacy Lab is part of PAUDC 2026, applicants do not need to be competitive debaters to apply. However, higher priority may be given to ideas submitted by members of the African debate community."
        },
        {
            q: "What kind of ideas are eligible?",
            a: "Eligible ideas should fit one of the five thematic areas, address a clear problem, have potential for real social or civic impact, and be capable of being tested through a realistic pilot."
        },
        {
            q: "Do I need to have started working on my idea already?",
            a: "No. You may apply with a new idea or an early-stage project. What matters most is that the problem is clear, the idea is practical, and you are willing to develop it further through incubation."
        },
        {
            q: "What will selected applicants receive?",
            a: "Selected applicants will receive mentorship, incubation support, project-refinement guidance, feedback from reviewers and mentors, and an opportunity to be considered for the PAUDC 2026 Legacy Lab Showcase."
        },
        {
            q: "Will selected applicants receive funding?",
            a: "Selection into the Legacy Lab does not automatically guarantee funding. However, top projects will be eligible for seed support of up to $5,000 and continued implementation guidance, subject to final selection and due diligence."
        },
        {
            q: "Will PAUDC own my idea?",
            a: "No. Applicants retain ownership of their ideas. PAUDC may request permission to feature selected projects in its communications, reports or showcase materials."
        }
    ];

    const steps = [
        {
            icon: FileText,
            title: "Submit your idea",
            description: "Complete the short application form with your idea and the problem it solves — about 15–20 minutes."
        },
        {
            icon: Search,
            title: "Applications are screened",
            description: "The Legacy Lab team reviews every submission after the deadline and shortlists the most promising ideas."
        },
        {
            icon: Sparkles,
            title: "Selected applicants join incubation",
            description: "Shortlisted applicants join virtual mentorship and incubation sessions between October and November 2026 to refine their ideas."
        },
        {
            icon: Presentation,
            title: "Finalists pitch during PAUDC 2026",
            description: "Finalists present their refined ideas at the Legacy Lab Showcase in Abuja in December 2026."
        },
        {
            icon: Award,
            title: "Top projects receive seed support",
            description: "Standout projects receive seed support of up to $5,000 plus continued implementation guidance."
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

            {/* How It Works */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-3 md:mb-4">How It Works</h2>
                        <p className="text-base md:text-lg text-[#1B5E3B]/70 max-w-2xl mx-auto">
                            From idea to impact in five steps.
                        </p>
                    </div>
                    <ol className="relative ml-3 md:ml-4 border-l-2 border-[#C8A046]/40 space-y-8 md:space-y-10">
                        {steps.map((step, index) => (
                            <li key={index} className="relative pl-8 md:pl-12">
                                <span className="absolute -left-[1.15rem] md:-left-[1.4rem] top-0 flex h-9 w-9 md:h-11 md:w-11 items-center justify-center rounded-full bg-[#1B5E3B] text-[#F6F0E1] ring-4 ring-white">
                                    <step.icon className="h-4 w-4 md:h-5 md:w-5" />
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wide text-[#C8A046]">Step {index + 1}</span>
                                <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mt-0.5 mb-1">{step.title}</h3>
                                <p className="text-sm md:text-base text-[#1B5E3B]/75 leading-relaxed">{step.description}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Year 1 Thematic Areas */}
            <section className="py-12 md:py-20 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-3 md:mb-4">Year 1 Thematic Areas</h2>
                        <p className="text-base md:text-lg text-[#1B5E3B]/70 max-w-3xl mx-auto leading-relaxed">
                            The inaugural Legacy Lab will focus on five thematic areas that reflect PAUDC&apos;s commitment
                            to debate, civic reasoning, youth leadership and practical social impact. Applicants are
                            encouraged to submit ideas that address a clear problem, can be refined through mentorship, and
                            have the potential to be tested through a realistic pilot.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {thematicAreas.map((area, index) => (
                            <Card
                                key={index}
                                className="border-none shadow-sm hover:shadow-md hover:-translate-y-1 transition-all bg-white"
                            >
                                <CardContent className="p-6 md:p-8">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#A4372C]/10 flex items-center justify-center mb-4 md:mb-6">
                                        {area.icon}
                                    </div>
                                    <h3 className="text-lg md:text-xl font-bold text-[#1B5E3B] mb-3">{area.title}</h3>
                                    <p className="text-sm md:text-base text-[#1B5E3B]/80 leading-relaxed">{area.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 mb-8 md:mb-12">
                        <HelpCircle className="w-8 h-8 md:w-10 md:h-10 text-[#A4372C]" />
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B]">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-3 md:space-y-4">
                        {faqs.map((faq, index) => (
                            <details
                                key={index}
                                className="group rounded-2xl border border-[#1B5E3B]/15 bg-[#F6F0E1]/40 p-5 md:p-6 [&_summary::-webkit-details-marker]:hidden"
                            >
                                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none text-base md:text-lg font-bold text-[#1B5E3B]">
                                    {faq.q}
                                    <ChevronDown className="w-5 h-5 text-[#C8A046] shrink-0 transition-transform group-open:rotate-180" />
                                </summary>
                                <p className="mt-3 text-sm md:text-base text-[#1B5E3B]/80 leading-relaxed">{faq.a}</p>
                            </details>
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
