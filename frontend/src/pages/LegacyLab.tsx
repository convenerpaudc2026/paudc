import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, Users, Rocket, Target, Heart, Globe } from 'lucide-react';

export default function LegacyLab() {
    const pillars = [
        {
            icon: <Lightbulb className="h-8 w-8 text-[#C84B46]" />,
            title: "Innovation & Creativity",
            description: "Fostering innovative thinking and creative problem-solving approaches."
        },
        {
            icon: <Users className="h-8 w-8 text-[#C84B46]" />,
            title: "Youth Leadership",
            description: "Empowering the next generation of African leaders with critical thinking skills."
        },
        {
            icon: <Globe className="h-8 w-8 text-[#C84B46]" />,
            title: "Continental Connection",
            description: "Building bridges across the continent by bringing together diverse perspectives."
        },
        {
            icon: <Target className="h-8 w-8 text-[#C84B46]" />,
            title: "Research & Publications",
            description: "Supporting academic research on debate pedagogy, African perspectives, and policy."
        },
        {
            icon: <Heart className="h-8 w-8 text-[#C84B46]" />,
            title: "Alumni Network",
            description: "Building a strong community of PAUDC alumni who continue to contribute to society."
        },
        {
            icon: <Rocket className="h-8 w-8 text-[#C84B46]" />,
            title: "Education & Training",
            description: "Providing world-class debate sessions and workshops focused on skill-building."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#185E3B] to-[##2E874F] text-white pt-24 md:pt-32 pb-12 md:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-4 md:mb-6">
                        <div className="p-3 md:p-4 bg-white/10 rounded-full">
                            <Lightbulb className="h-12 w-12 md:h-16 md:w-16 text-[#C84B46]" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">The Legacy Lab</h1>
                    <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto font-light">
                        A youth-led innovation space that transforms debate ideas into actionable projects.
                    </p>
                </div>
            </section>

            {/* Four Pillars */}
            <section className="py-10 md:py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 md:mb-4">Core Pillars</h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {pillars.map((pillar, index) => (
                            <Card key={index} className="border-2 border-gray-200 hover:border-[#C84B46] transition-all">
                                <CardContent className="p-5 md:p-8">
                                    <div className="flex items-center space-x-3 md:space-x-4 mb-3 md:mb-4">
                                        {pillar.icon}
                                        <h3 className="text-lg md:text-xl font-bold text-gray-900">{pillar.title}</h3>
                                    </div>
                                    <p className="text-sm md:text-base text-gray-700">{pillar.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-10 md:py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Join The Movement</h2>
                    <p className="text-sm md:text-lg text-gray-700 mb-6 md:mb-8">
                        Be part of Africa's largest youth-led innovation space. Whether you're a debater, an adjudicator, or an observer, there is a place for you in the Legacy Lab community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                        <a href="/invite" className="inline-block">
                            <button className="px-6 md:px-8 py-2.5 md:py-3 bg-[#C84B46] hover:bg-[#B84040] text-white text-sm md:text-base rounded-md font-medium transition-colors w-full sm:w-auto">
                                Register for PAUDC 2026
                            </button>
                        </a>
                        <a href="/contact" className="inline-block">
                            <button className="px-6 md:px-8 py-2.5 md:py-3 bg-[#185E3B] hover:bg-[#2A744F] text-white text-sm md:text-base rounded-md font-medium transition-colors w-full sm:w-auto">
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