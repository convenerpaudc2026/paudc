import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Award, MapPin, Globe, Target } from 'lucide-react';
import abjImage from '../assets/abj.jpg';
import veritas from '../assets/vuna.jpeg';
import ourHistory from '../assets/history.jpg'

export default function About() {
    const objectives = [
        'Bring together over 1,000 young people across all African nations in pursuit of truth and dialogue',
        'Equip participants with skills in critical analysis, civic reasoning, and collaborative problem-solving',
        'Strengthen academic and civic partnerships among African universities to advance intellectual diplomacy',
        'Institutionalize PAUDC as a sustainable model for civic participation through dialogue and debate',
    ];

    return (
        <div className="min-h-screen bg-white text-[#1B5E3B]">
            <SEO
                title="About PAUDC 2026"
                description="Learn about the Pan-African University Debating Championship. Africa's premier intellectual arena bringing together over 1,000 young people for dialogue and debate."
                canonical="https://www.paudc2026.com/about"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-24 bg-gradient-to-br from-[#A4372C] to-[#C8A046]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-6 drop-shadow-md">
                        About PAUDC 2026
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 max-w-3xl mx-auto font-medium">
                        Africa's most prestigious arena for youth dialogue and intellectual exchange
                    </p>
                </div>
            </section>

            {/* History Section */}
            <section className="py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-4 md:mb-6">
                                Our History
                            </h2>
                            <div className="space-y-3 md:space-y-4 text-sm md:text-lg text-[#1B5E3B]/80 leading-relaxed">
                                <p>
                                    The Pan-African Universities Debate Championship (PAUDC) was founded in 2008 through
                                    the joint efforts of the Open Society Foundations and the British Council. What began
                                    as a continental experiment in academic collaboration has since evolved into Africa's
                                    most prestigious arena for youth dialogue and intellectual exchange.
                                </p>
                                <p>
                                    Built upon the British Parliamentary format, the Championship is designed to cultivate
                                    intellectual agility and informed sportsmanship. With only minutes to prepare for each motion,
                                    participants must draw upon deep reasoning, broad knowledge, and civic awareness that mirror
                                    the demands of leadership in a fast-changing world.
                                </p>
                                <p>
                                    Nigeria last hosted the Championship thirteen years ago. Now, Veritas University, Abuja —
                                    the only Nigerian institution ever to have won the PAUDC title — returns it to the motherland.
                                </p>
                            </div>
                        </div>
                        <div>
                            <img
                                src={ourHistory}
                                alt="Debaters at podium"
                                className="rounded-xl md:rounded-2xl shadow-xl w-full object-cover h-[280px] md:h-[450px]"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Vision & Mission Section */}
            <section className="py-8 md:py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {/* Vision Card */}
                        <Card className="border border-[#C8A046]/30 bg-[#C8A046]/5 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6 md:p-10">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#C8A046]/20 flex items-center justify-center mb-4 md:mb-6">
                                    <Eye className="h-6 w-6 md:h-7 md:w-7 text-[#C8A046]" />
                                </div>
                                <h3 className="text-xl md:text-3xl font-bold text-[#1B5E3B] mb-3 md:mb-4">Our Vision</h3>
                                <p className="text-sm md:text-lg text-[#1B5E3B]/80 leading-relaxed">
                                    To cultivate a generation of Africans who govern with intellect, serve with integrity,
                                    and lead with reason.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Mission Card */}
                        <Card className="border border-[#1B5E3B]/30 bg-[#1B5E3B]/5 shadow-sm hover:shadow-md transition-all">
                            <CardContent className="p-6 md:p-10">
                                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#1B5E3B]/20 flex items-center justify-center mb-4 md:mb-6">
                                    <Target className="h-6 w-6 md:h-7 md:w-7 text-[#1B5E3B]" />
                                </div>
                                <h3 className="text-xl md:text-3xl font-bold text-[#1B5E3B] mb-3 md:mb-4">Our Mission</h3>
                                <p className="text-sm md:text-lg text-[#1B5E3B]/80 leading-relaxed">
                                    To convene Africa's brightest young minds in a shared space of debate and
                                    dialogue, building a living Republic of Reason where ideas shape understanding, and
                                    reasoning shapes the continent's future.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Objectives */}
            <section className="py-12 md:py-20 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-8 md:mb-12 text-center">Our Objectives</h2>
                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {objectives.map((objective, index) => (
                            <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white">
                                <CardContent className="p-4 md:p-6 flex gap-3 md:gap-4 items-start">
                                    <div className="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#C8A046] flex items-center justify-center text-[#F6F0E1] font-bold text-sm md:text-lg mt-1">
                                        {index + 1}
                                    </div>
                                    <p className="text-[#1B5E3B]/80 text-sm md:text-lg pt-1 leading-relaxed">{objective}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tournament Structure Section */}
            <section className="py-12 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-3 md:mb-4">Tournament Structure</h2>
                    <p className="text-base md:text-xl text-[#1B5E3B]/70 mb-10 md:mb-16 max-w-3xl mx-auto">
                        British Parliamentary Format - The Gold Standard of Competitive Debate
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto text-left">
                        <Card className="border border-[#1B5E3B]/20 shadow-lg hover:border-[#1B5E3B] transition-all bg-[#F6F0E1]/30">
                            <CardContent className="p-6 md:p-10">
                                <h3 className="text-lg md:text-2xl font-bold text-[#1B5E3B] mb-4 md:mb-6">Preliminary Rounds</h3>
                                <ul className="space-y-3 md:space-y-5 text-[#1B5E3B]/80 text-sm md:text-lg">
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>13+ Rounds</strong> of British Parliamentary debate</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Power-Pairing System:</strong> Teams matched based on performance</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Four-Team Rooms:</strong> Opening Government, Opening Opposition, Closing Government, Closing Opposition</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>15-minute Preparation:</strong> No electronic devices or materials allowed</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="border border-[#1B5E3B]/20 shadow-lg hover:border-[#A4372C] transition-all bg-[#F6F0E1]/30">
                            <CardContent className="p-6 md:p-10">
                                <h3 className="text-lg md:text-2xl font-bold text-[#A4372C] mb-4 md:mb-6">Elimination Rounds</h3>
                                <ul className="space-y-3 md:space-y-5 text-[#1B5E3B]/80 text-sm md:text-lg">
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Double-Octo Finals:</strong> Top 64 teams advance</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Octofinals:</strong> Top 32 teams advance</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Quarterfinals:</strong> Top 16 teams battle</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Semifinals:</strong> Top 8 teams battle for finals spot</span>
                                    </li>
                                    <li className="flex items-start gap-2 md:gap-3">
                                        <span className="text-[#C8A046] font-bold text-lg md:text-2xl leading-none">•</span>
                                        <span><strong>Grand Final:</strong> Top 4 teams battle for glory</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Host City - Abuja Section */}
            <section className="py-12 md:py-24 bg-[#1B5E3B] text-[#F6F0E1] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-stretch">

                        {/* Left Column: Text & Stats */}
                        <div className="flex flex-col justify-center">
                            <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                                <MapPin className="h-6 w-6 md:h-8 md:w-8 text-[#C8A046]" />
                                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold">Welcome to Abuja</h2>
                            </div>
                            <div className="space-y-4 md:space-y-5 text-sm md:text-lg text-[#F6F0E1]/90 leading-relaxed mb-8 md:mb-10">
                                <p>
                                    Nigeria's capital city and the heart of Africa's most populous nation, Abuja is a modern metropolis
                                    that embodies the spirit of Pan-African unity and progress. Purpose-built as Nigeria's capital in the 1980s,
                                    Abuja represents a vision of a united, forward-thinking Africa.
                                </p>
                                <p>
                                    The city is home to iconic landmarks including <strong className="text-white">Aso Rock</strong>, the presidential complex,
                                    and the magnificent <strong className="text-white">National Mosque</strong> and <strong className="text-white">National Christian Centre</strong>,
                                    standing side by side as symbols of religious harmony.
                                </p>
                                <p>
                                    With its world-class infrastructure, vibrant cultural scene, and strategic location at the geographic
                                    center of Nigeria, Abuja is the perfect host for Africa's premier debate championship.
                                </p>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/10 rounded-xl p-6">
                                    <h4 className="text-3xl font-bold text-[#C8A046] mb-2">25°C</h4>
                                    <p className="text-sm text-[#F6F0E1]/90">Average December Temperature</p>
                                </div>
                                <div className="bg-white/10 rounded-xl p-6">
                                    <h4 className="text-3xl font-bold text-[#C8A046] mb-2">3M+</h4>
                                    <p className="text-sm text-[#F6F0E1]/90">Metropolitan Population</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Image & Overlapping Card */}
                        <div className="relative mt-12 lg:mt-0">
                            <img
                                src={abjImage}
                                alt="Abuja Cityscape"
                                className="w-full h-[500px] lg:h-[650px] object-cover rounded-xl shadow-2xl"
                            />

                            {/* Why Abuja Docked Card */}
                            <div className="absolute -bottom-8 -left-4 lg:-left-12 bg-[#C8A046] text-[#1B5E3B] p-8 rounded-xl shadow-2xl max-w-sm w-11/12 sm:w-80">
                                <Globe className="h-8 w-8 mb-4 text-[#1B5E3B]" />
                                <h4 className="text-2xl font-bold mb-3">Why Abuja?</h4>
                                <p className="font-medium text-base">
                                    A symbol of African unity, progress, and the perfect backdrop for intellectual discourse
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Theme Section: The Republic of Reason */}
            <section className="py-24 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-[#1B5E3B] mb-4">The Republic of Reason</h2>
                        <p className="text-xl text-[#1B5E3B]/80 font-medium">Building Africa's Future Through Debate</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <Card className="border-none shadow-lg bg-white hover:-translate-y-1 transition-transform">
                            <CardContent className="p-10">
                                <h3 className="text-3xl font-bold text-[#1B5E3B] mb-6">What It Means</h3>
                                <div className="space-y-4 text-lg text-[#1B5E3B]/80 leading-relaxed">
                                    <p>
                                        Every era builds its own republic. For Africa, this republic is not defined by borders
                                        or flags but by ideas. The Republic of Reason imagines a continent where citizenship is
                                        measured not by origin but by understanding, and where every argument becomes a building
                                        block for progress.
                                    </p>
                                    <p>
                                        In this Republic, debate becomes democracy in motion — a rehearsal for the Africa we
                                        aspire to build. It teaches young Africans to question without hostility, to disagree
                                        without division, and to seek truth through evidence and empathy.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-lg bg-white hover:-translate-y-1 transition-transform">
                            <CardContent className="p-10">
                                <h3 className="text-3xl font-bold text-[#A4372C] mb-6">The Sound of Africa's Resolve</h3>
                                <div className="space-y-4 text-lg text-[#1B5E3B]/80 leading-relaxed">
                                    <p>
                                        At its heart lies The Sound of Africa's Resolve — the anthem that binds this vision together.
                                        Its symbol, the Kakaki (Northern Nigeria's royal trumpet), once announced kings and called
                                        communities to unity.
                                    </p>
                                    <p>
                                        In 2026, its sound will call a new generation to reason, to lead with intellect, and to
                                        build a continent anchored in truth.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Host University */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1">
                            <img
                                src={veritas}
                                alt="Veritas University Campus"
                                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
                            />
                        </div>

                        <div className="order-1 md:order-2">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#1B5E3B] mb-8">Veritas University, Abuja</h2>

                            <div className="space-y-6 text-lg text-[#1B5E3B]/80 leading-relaxed mb-10">
                                <p>
                                    Guided by its founding principle of truth, Veritas University seeks to reimagine the Championship
                                    as both an intellectual homecoming and a civic pilgrimage — a space where reason rises above rhetoric
                                    and Africa's brightest minds debate their way toward a shared future.
                                </p>
                                <p>
                                    As the only Nigerian institution ever to have won the PAUDC title, Veritas University brings
                                    unparalleled experience and commitment to hosting this prestigious event.
                                </p>
                            </div>

                            <div className="flex items-center gap-6 p-6 bg-[#F6F0E1] rounded-2xl border border-[#C8A046]/50 shadow-sm">
                                <div className="w-16 h-16 rounded-full bg-[#C8A046]/20 flex items-center justify-center shrink-0">
                                    <Award className="h-8 w-8 text-[#A4372C]" />
                                </div>
                                <div>
                                    <p className="font-bold text-xl text-[#1B5E3B] mb-1">PAUDC Champions</p>
                                    <p className="text-[#1B5E3B]/80 font-medium">The only Nigerian university to win the title</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}