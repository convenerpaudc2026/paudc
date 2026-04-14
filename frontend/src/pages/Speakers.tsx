import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Globe, Users, ArrowRight, Calendar, Clock } from 'lucide-react';

const PANELISTS = [
    {
        name: 'Prof. Thandika Mkandawire',
        title: 'Economist & Pan-African Scholar',
        country: 'Malawi',
        bio: 'Renowned development economist and former Director of UNRISD, Prof. Mkandawire has dedicated his career to theorising African development and social policy.',
        theme: 'Economic Sovereignty',
        initials: 'TM',
    },
    {
        name: 'Dr. Arikana Chihombori-Quao',
        title: 'Activist & Former AU Ambassador',
        country: 'Zimbabwe',
        bio: 'Former African Union Ambassador to the United States and a fierce advocate for African dignity, self-determination, and economic emancipation.',
        theme: 'Pan-African Identity',
        initials: 'AC',
    },
    {
        name: 'Dr. Nkosazana Dlamini-Zuma',
        title: 'Former Chairperson, African Union Commission',
        country: 'South Africa',
        bio: 'Former Chairperson of the African Union Commission and South African Cabinet Minister, driving Agenda 2063 and continental integration.',
        theme: 'Continental Governance',
        initials: 'ND',
    },
    {
        name: 'Prof. Ngozi Okonjo-Iweala',
        title: 'WTO Director-General',
        country: 'Nigeria',
        bio: 'Director-General of the World Trade Organization and former Nigerian Finance Minister. A leading voice on global trade, development, and African economic reform.',
        theme: 'Global Trade & Africa',
        initials: 'NO',
    },
    {
        name: 'Bindé Diabaté',
        title: 'Youth Activist & UN Youth Delegate',
        country: "Côte d'Ivoire",
        bio: "Prominent youth voice on climate, governance, and the role of young people in shaping Africa's political landscape.",
        theme: 'Youth & Democracy',
        initials: 'BD',
    },
    {
        name: 'Prof. Amina J. Mohammed',
        title: 'UN Deputy Secretary-General',
        country: 'Nigeria',
        bio: "Deputy Secretary-General of the United Nations and former Nigerian Environment Minister, championing sustainable development and women's leadership across Africa.",
        theme: 'Sustainable Development',
        initials: 'AM',
    },
];

const PANEL_SESSIONS = [
    {
        title: 'Opening Plenary: Rethinking Pan-Africanism',
        date: 'December 6, 2026',
        time: '09:00 – 11:00',
        location: 'Main Auditorium',
        description: 'What does Pan-Africanism mean in 2026? A gathering of thought leaders exploring the philosophy, contradictions, and renewed possibilities of continental unity.',
        color: '#A4372C',
    },
    {
        title: 'Africa\'s Economy: Independence or Interdependence?',
        date: 'December 8, 2026',
        time: '14:00 – 16:00',
        location: 'Senate Hall',
        description: 'African economies at a crossroads — between resource sovereignty, debt diplomacy, and the imperative of industrialisation. Panelists debate the path forward.',
        color: '#1B5E3B',
    },
    {
        title: 'Democracy, Youth & the Ballot Box',
        date: 'December 10, 2026',
        time: '10:00 – 12:00',
        location: 'Lecture Theatre A',
        description: 'With more than 60% of Africa under 25, youth are Africa\'s greatest asset — and its most disenfranchised constituency. What must change?',
        color: '#C8A046',
    },
    {
        title: 'Closing Dialogue: The Africa We Build',
        date: 'December 12, 2026',
        time: '11:00 – 13:00',
        location: 'Main Auditorium',
        description: 'A closing conversation synthesising the key ideas, debates, and resolutions that emerged across the championship — charting the next chapter of African progress.',
        color: '#022512',
    },
];

const COLOR_VARIANTS = [
    { bg: 'bg-[#A4372C]', light: 'bg-[#A4372C]/10', text: 'text-[#A4372C]' },
    { bg: 'bg-[#1B5E3B]', light: 'bg-[#1B5E3B]/10', text: 'text-[#1B5E3B]' },
    { bg: 'bg-[#C8A046]', light: 'bg-[#C8A046]/10', text: 'text-[#C8A046]' },
    { bg: 'bg-[#022512]', light: 'bg-[#022512]/10', text: 'text-[#022512]' },
    { bg: 'bg-[#A4372C]', light: 'bg-[#A4372C]/10', text: 'text-[#A4372C]' },
    { bg: 'bg-[#1B5E3B]', light: 'bg-[#1B5E3B]/10', text: 'text-[#1B5E3B]' },
];

export default function Speakers() {
    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#022512]">
            <Navbar />

            {/* ── Hero ── */}
            <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-[#022512] via-[#1B5E3B] to-[#022512] overflow-hidden">
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-[#C8A046] opacity-10 blur-[100px]" />
                    <div className="absolute bottom-[-5%] left-[10%] w-[500px] h-[500px] rounded-full bg-[#A4372C] opacity-10 blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <div className="inline-flex items-center gap-2 bg-[#C8A046]/20 border border-[#C8A046]/40 rounded-full px-5 py-2 mb-6 md:mb-8">
                        <Mic className="w-4 h-4 text-[#C8A046]" />
                        <span className="text-sm font-semibold text-[#C8A046] uppercase tracking-widest">Civic Panel 2026</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight">
                        Voices of a Continent
                    </h1>
                    <p className="text-lg md:text-2xl lg:text-3xl text-[#C8A046] font-semibold mb-4 md:mb-6 italic">
                        Rethinking Pan-Africanism for a New Generation
                    </p>
                    <p className="text-base md:text-xl text-[#F6F0E1]/80 max-w-3xl mx-auto leading-relaxed">
                        Four high-level panel discussions bringing together Africa's foremost thinkers, policymakers,
                        and youth advocates to wrestle with the defining questions of our era.
                    </p>
                </div>
            </section>

            {/* ── What is the Civic Panel ── */}
            <section className="py-14 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {[
                            {
                                icon: <Mic className="w-7 h-7 text-[#A4372C]" />,
                                bg: 'bg-[#A4372C]/10',
                                title: 'High-Level Dialogue',
                                desc: 'Structured panel discussions with Africa\'s leading voices on governance, economy, identity, and youth.',
                            },
                            {
                                icon: <Globe className="w-7 h-7 text-[#1B5E3B]" />,
                                bg: 'bg-[#1B5E3B]/10',
                                title: 'Continental Perspectives',
                                desc: 'Panelists drawn from across the continent and diaspora, representing the full breadth of African thought.',
                            },
                            {
                                icon: <Users className="w-7 h-7 text-[#C8A046]" />,
                                bg: 'bg-[#C8A046]/10',
                                title: 'Open to All Delegates',
                                desc: 'Every registered participant — debater, adjudicator, or observer — may attend all Civic Panel sessions.',
                            },
                        ].map((item, i) => (
                            <div key={i} className="flex flex-col items-start gap-4 p-6 md:p-8 rounded-3xl border border-[#022512]/10 hover:shadow-lg transition-shadow bg-[#F6F0E1]/50">
                                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center shrink-0`}>
                                    {item.icon}
                                </div>
                                <h3 className="text-xl font-bold text-[#022512]">{item.title}</h3>
                                <p className="text-[#022512]/70 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Panel Sessions ── */}
            <section className="py-14 md:py-20 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#022512] mb-4">Panel Sessions</h2>
                        <p className="text-base md:text-xl text-[#022512]/70 max-w-2xl mx-auto">
                            Four scheduled discussions across the championship week.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {PANEL_SESSIONS.map((session, i) => (
                            <Card key={i} className="border border-[#022512]/10 shadow-md hover:-translate-y-1 transition-transform duration-300 bg-white overflow-hidden">
                                <div className="h-2" style={{ backgroundColor: session.color }} />
                                <CardContent className="p-6 md:p-8">
                                    <h3 className="text-xl md:text-2xl font-bold text-[#022512] mb-3 leading-snug">
                                        {session.title}
                                    </h3>
                                    <p className="text-[#022512]/70 text-sm md:text-base leading-relaxed mb-5">
                                        {session.description}
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-xs md:text-sm text-[#022512]/60 font-semibold">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                                            {session.date}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 shrink-0" />
                                            {session.time}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Panelists ── */}
            <section className="py-14 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#022512] mb-4">Featured Panelists</h2>
                        <p className="text-base md:text-xl text-[#022512]/70 max-w-2xl mx-auto">
                            Distinguished thought leaders, policymakers, and advocates shaping Africa's future.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {PANELISTS.map((person, i) => {
                            const variant = COLOR_VARIANTS[i % COLOR_VARIANTS.length];
                            return (
                                <Card key={i} className="border border-[#022512]/10 shadow-md hover:-translate-y-2 transition-transform duration-300 overflow-hidden bg-[#F6F0E1]/60">
                                    <CardContent className="p-6 md:p-8 flex flex-col h-full">
                                        {/* Avatar */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`w-14 h-14 rounded-full ${variant.bg} flex items-center justify-center shrink-0`}>
                                                <span className="text-[#F6F0E1] font-black text-lg">{person.initials}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#022512] text-base leading-snug">{person.name}</h3>
                                                <p className="text-xs text-[#022512]/60 font-semibold">{person.country}</p>
                                            </div>
                                        </div>

                                        <p className={`text-xs font-bold uppercase tracking-wider ${variant.text} mb-3`}>
                                            {person.theme}
                                        </p>
                                        <p className="text-sm text-[#022512]/70 font-medium mb-2 leading-snug">{person.title}</p>
                                        <p className="text-sm text-[#022512]/60 leading-relaxed flex-1">{person.bio}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ── Quote band ── */}
            <section className="py-16 md:py-20 bg-[#1B5E3B] text-[#F6F0E1] text-center px-4">
                <div className="max-w-4xl mx-auto">
                    <blockquote className="text-2xl md:text-4xl font-black italic leading-snug mb-6">
                        "The continent will not be built by those who stay silent.{' '}
                        It will be built by those who dare to reason aloud."
                    </blockquote>
                    <p className="text-[#C8A046] font-semibold text-sm md:text-base uppercase tracking-widest">
                        — PAUDC 2026, Voices of a Continent
                    </p>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-14 md:py-20 bg-[#F6F0E1] text-center px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-black text-[#022512] mb-4">
                        Join the Conversation
                    </h2>
                    <p className="text-base md:text-xl text-[#022512]/70 mb-8 leading-relaxed">
                        Register as a delegate to attend all four Civic Panel sessions and be part of history as Africa's brightest minds chart the future of the continent.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <button className="px-8 py-3.5 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] rounded-full font-bold shadow-lg transition-colors text-base w-full sm:w-auto">
                                Request an Invite
                            </button>
                        </Link>
                        <Link to="/schedule">
                            <button className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-[#022512]/20 hover:bg-[#022512] hover:text-[#F6F0E1] text-[#022512] rounded-full font-bold transition-colors text-base w-full sm:w-auto">
                                View Full Schedule <ArrowRight className="w-4 h-4" />
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
