import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';

export default function Speakers() {
    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Speakers"
                description="Featured speakers and panelists for PAUDC 2026. Inspiring minds and distinguished voices leading conversations on Africa's future."
                canonical="https://www.paudc2026.com/speakers"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="pt-24 md:pt-32 pb-12 md:pb-16 bg-gradient-to-br from-[#A4372C] to-[#8B2F2A]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                        Featured Speakers & Panelists
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl max-w-4xl mx-auto">
                        Inspiring minds and distinguished voices leading conversations on Africa's future
                    </p>
                </div>
            </section>

            {/* Coming Soon Section */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Speaker Lineup Coming Soon</h2>
                        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                            We are curating an exceptional lineup of speakers, panelists, and thought leaders from across Africa and beyond. Check back soon for announcements!
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
                        <Card className="border-2 border-[#C84B46]/20">
                            <CardContent className="p-6 md:p-8 text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-[#C84B46] to-[#8B8904] flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <div className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Keynote Speakers</h3>
                                <p className="text-sm md:text-base text-gray-600">
                                    Visionary leaders in African politics, academia, and civil society
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-gray-200">
                            <CardContent className="p-6 md:p-8 text-center">
                                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 md:mb-4">
                                    <div className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Panelists</h3>
                                <p className="text-sm md:text-base text-gray-600">
                                    Experts participating in thematic discussions during the tournament
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-12 md:py-20 bg-[#F6F6F6]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                        Interested in Speaking?
                    </h2>
                    <p className="text-sm md:text-lg text-gray-700 mb-6 md:mb-8">
                        We welcome proposals from thought leaders, academics, and practitioners who can contribute to meaningful dialogue on Africa's future.
                    </p>
                    <a href="/contact">
                        <button className="bg-[#C84B46] hover:bg-[#8B8904] text-white text-sm md:text-base font-semibold px-6 md:px-8 py-2.5 md:py-3 rounded-md transition-colors">
                            Submit Speaker Proposal
                        </button>
                    </a>
                </div>
            </section>

            <Footer />
        </div>
    );
}