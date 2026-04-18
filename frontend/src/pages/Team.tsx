import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import michelle from '../assets/adjudicators/michelle.png';
import elisha from '../assets/adjudicators/elisha.jpeg';
import umar from '../assets/adjudicators/Umar Buckus.jpeg';
import feyisayo from '../assets/adjudicators/feyisayo.png';
import methembe from '../assets/adjudicators/methembe.jpeg';
import hyacinth from '../assets/advisory_panel/Prof Hyacinth Ichoku.jpg';
import kukah from '../assets/advisory_panel/Bishop Kukah.png';
import asemota from '../assets/advisory_panel/Chief Asemota.png';
import idornigie from '../assets/advisory_panel/Prof Idornigie.png';
import gokum from '../assets/advisory_panel/Fr Gokum.png';
import ladi from '../assets/loc/Ladi.jpeg';
import amos from '../assets/loc/Amos.jpeg';
import ayafa from '../assets/loc/Ayafa.jpeg';
import eddie from '../assets/loc/Eddie.jpeg';
import esther from '../assets/loc/Esther.jpeg';
import nzube from '../assets/loc/Nzube.jpeg';
import joan from '../assets/loc/Joan.jpeg';
import tacfeek from '../assets/loc/Tacfeek.jpeg';
import silas from '../assets/loc/Silas.jpeg';
import francis from '../assets/loc/Francis.jpeg';
import emmanuel from '../assets/loc/Emmanuel.png';
import kachi from '../assets/loc/Kachi.png';
import dsm from '../assets/loc/Dsm.png';

export default function Team() {
    const [capIndex, setCapIndex] = useState(0);
    const [advisoryIndex, setAdvisoryIndex] = useState(0);
    const [locIndex, setLocIndex] = useState(0);

    const advisoryLeadership = [
        {
            name: 'Rev. Fr. Prof. Hyacinth Ichoku',
            role: 'Vice-Chancellor',
            bio: 'Visionary academic leader and administrator, guiding the university and championship with integrity and excellence.',
            image: hyacinth
        },
        {
            name: 'Most Rev. Dr. Matthew Hassan Kukah',
            role: 'Chief Patron',
            bio: 'Renowned religious leader and advocate for education, serving as the Chief Patron of the tournament.',
            image: kukah
        },
        {
            name: 'Chief Solomon Asemota, SAN',
            role: 'Father of the Tournament',
            bio: 'Distinguished legal luminary and foundational supporter, celebrated as the Father of the Tournament.',
            image: asemota
        },
        {
            name: 'Prof. Paul Obo Idornigie, SAN',
            role: 'Senior Advisor, Adjudicators Academy',
            bio: 'Distinguished legal scholar and debate expert overseeing judge training and certification programs.',
            image: idornigie
        },
        {
            name: 'Rev. Fr. Gokum Richard',
            role: 'Advisor, Funding & Partnerships',
            bio: 'Advisor on funding and partnerships, supporting the championship’s growth and sustainability.',
            image: gokum
        }
    ];

    const capTeam = [
        {
            name: 'Michelle Adika',
            role: 'Chief Adjudicator',
            credentials: 'Michelle Adika is a Kenyan law student, two-term debate society president, and accomplished speaker and adjudicator who has earned continental and regional Best Speaker honours, reached major international finals, and plays a leading role in both BP and WSDC circuits across Africa.',
            image: michelle
        },
        {
            name: 'Elisha Owusu Akyaw',
            role: 'Chief Adjudicator',
            credentials: 'Elisha Owusu Akyaw is a Ghanaian debater, coach, and Web3 professional who reached the WUDC ESL Final and multiple PAUDC Finals, and remains deeply committed to growing the African debate space through coaching and mentorship.',
            image: elisha
        },
        {
            name: 'Umar Buckus',
            role: 'Chief Adjudicator',
            credentials: 'Umar Buckus is a South African debater, UCL alumnus, three-time WUDC Final Judge, and co-founder of Uhuru World Championships',
            image: umar
        },
        {
            name: 'Methembe Michael Mthimkhulu',
            role: 'Deputy Chief Adjudicator',
            credentials: 'Methembe Michael Mthimkhulu is a Zimbabwean lawyer-in-training and former national debater who has transitioned into coaching, administration, and adjudication, earning recognition as a continental-level Chief Adjudicator and outround judge at prestigious international tournaments.',
            image: methembe
        },
        {
            name: 'Feyisayo Ajayi-Abu',
            role: 'Tab Mistress',
            credentials: 'Feyisayo Ajayi-Abu is an experienced Tab Mistress who has managed tabulation for numerous major Nigerian debating tournaments since 2022, spanning both Debate and Public Speaking formats.',
            image: feyisayo
        }
    ];

    const locTeam = [
        {
            name: 'Joseph Amos',
            role: 'Convener',
            bio: 'Organizing and coordinating championship logistics, ensuring seamless execution across all tournament operations.',
            image: amos
        },
        {
            name: 'Edwin Ocheido',
            role: 'Convener',
            bio: 'Coordinating championship execution and logistics, supporting the convening team with operational excellence.',
            image: eddie
        },
        {
            name: 'Ayafa Tonye',
            role: 'Tournament Director',
            bio: 'Managing tournament schedule, rounds, and competitive framework to ensure fair and excellent adjudication.',
            image: ayafa
        },
        {
            name: 'Nzube Nwaokoro',
            role: 'Tournament Director',
            bio: 'Overseeing tournament administration, competitive integrity, and the smooth flow of debate rounds.',
            image: nzube
        },
        {
            name: 'MJ Ladi',
            role: 'Partner',
            bio: 'Strategic partner supporting the championship vision, partnerships, and overall organizational leadership.',
            image: ladi
        },
        {
            name: 'DSM',
            role: 'Chief of Staff',
            bio: 'Providing strategic leadership and coordination across all championship operations and committee functions.',
            image: dsm
        },
        {
            name: 'Esther Adakole',
            role: 'Welfare',
            bio: 'Ensuring all delegates receive outstanding care, comfort, and support throughout the championship.',
            image: esther
        },
        {
            name: 'Tacfeek Sarayi',
            role: 'Finance',
            bio: 'Managing championship finances, budgeting, and ensuring fiscal responsibility throughout operations.',
            image: tacfeek
        },
        {
            name: 'Emmanuel Oyinloye',
            role: 'Communication and Media',
            bio: 'Managing championship communications, media relations, and ensuring compelling narrative around PAUDC 2026.',
            image: emmanuel
        },
        {
            name: 'Silas Mac-iPah',
            role: 'Logistics',
            bio: 'Coordinating venue operations, accommodations, transportation, and all logistical arrangements.',
            image: silas
        },
        {
            name: 'Joan Hart',
            role: 'Socials and Enjoyment',
            bio: 'Coordinating social events and cultural celebrations that bring the Pan-African community together.',
            image: joan
        },
        {
            name: 'Kachi Dominic',
            role: 'Tech Lead',
            bio: 'Leading technology infrastructure and digital solutions to support seamless championship operations.',
            image: kachi
        },
        {
            name: 'Barr Francis',
            role: 'Visa Liaison',
            bio: 'Facilitating visa documentation and travel arrangements, enabling seamless international delegate participation.',
            image: francis
        }
    ];

    const handleAdvisoryPrev = () => setAdvisoryIndex(prev => (prev === 0 ? advisoryLeadership.length - 1 : prev - 1));
    const handleAdvisoryNext = () => setAdvisoryIndex(prev => (prev === advisoryLeadership.length - 1 ? 0 : prev + 1));

    const handleCapPrev = () => setCapIndex(prev => (prev === 0 ? capTeam.length - 1 : prev - 1));
    const handleCapNext = () => setCapIndex(prev => (prev === capTeam.length - 1 ? 0 : prev + 1));

    const handleLocPrev = () => setLocIndex(prev => (prev === 0 ? locTeam.length - 1 : prev - 1));
    const handleLocNext = () => setLocIndex(prev => (prev === locTeam.length - 1 ? 0 : prev + 1));

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B]">
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-[#1B5E3B] to-[#0d301e] text-[#F6F0E1] pt-24 md:pt-32 pb-16 md:pb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex justify-center mb-6 md:mb-8">
                        <div className="p-4 md:p-5 bg-[#F6F0E1]/10 rounded-full border border-[#C8A046]/30 backdrop-blur-sm">
                            <Shield className="h-10 w-10 md:h-14 md:w-14 text-[#C8A046]" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-4 md:mb-6">Meet the Team</h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/80 max-w-3xl mx-auto font-medium">
                        The dedicated professionals bringing PAUDC 2026 to life
                    </p>
                </div>
            </section>

            {/* Advisory Leadership Section (Gold Accent) */}
            <section className="py-12 md:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-4 md:mb-6">Advisory Leadership</h2>
                        <div className="w-16 md:w-24 h-1 md:h-1.5 bg-[#C8A046] mx-auto rounded-full"></div>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleAdvisoryPrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 h-14 w-14 rounded-full border-[#C8A046] text-[#C8A046] hover:bg-[#C8A046] hover:text-white bg-white shadow-md transition-all"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleAdvisoryNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 h-14 w-14 rounded-full border-[#C8A046] text-[#C8A046] hover:bg-[#C8A046] hover:text-white bg-white shadow-md transition-all"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>

                        <Card className="border border-[#C8A046]/30 shadow-xl max-w-2xl mx-auto bg-[#F6F0E1]/30 rounded-2xl md:rounded-3xl overflow-hidden">
                            <CardContent className="p-6 md:p-8 lg:p-12">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 md:gap-8">
                                    <img
                                        src={advisoryLeadership[advisoryIndex].image}
                                        alt={advisoryLeadership[advisoryIndex].name}
                                        className="w-28 h-28 md:w-36 md:h-36 shrink-0 rounded-full object-cover border-4 border-[#C8A046] shadow-lg"
                                    />
                                    <div>
                                        <h3 className="text-lg md:text-2xl font-bold text-[#1B5E3B] mb-2">{advisoryLeadership[advisoryIndex].name}</h3>
                                        <p className="text-sm md:text-lg text-[#A4372C] font-bold mb-3 md:mb-4">{advisoryLeadership[advisoryIndex].role}</p>
                                        <p className="text-[#1B5E3B]/80 text-sm md:text-lg leading-relaxed">{advisoryLeadership[advisoryIndex].bio}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center gap-3 mt-8">
                            {advisoryLeadership.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setAdvisoryIndex(idx)}
                                    className={`h-3 rounded-full transition-all duration-300 ${idx === advisoryIndex ? 'bg-[#C8A046] w-10' : 'bg-[#C8A046]/30 w-3 hover:bg-[#C8A046]/60'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Adjudication Panel Section (Green Accent) */}
            <section className="py-12 md:py-24 bg-[#F6F0E1]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B] mb-4 md:mb-6">Core Adjudication Panel (CAP)</h2>
                        <div className="w-16 md:w-24 h-1 md:h-1.5 bg-[#1B5E3B] mx-auto rounded-full mb-6 md:mb-8"></div>
                        <p className="text-base md:text-xl text-[#1B5E3B]/80 max-w-3xl mx-auto font-medium">
                            World-class adjudicators ensuring fairness, excellence, and educational value
                        </p>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCapPrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 h-14 w-14 rounded-full border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] bg-white shadow-md transition-all"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleCapNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 h-14 w-14 rounded-full border-[#1B5E3B] text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] bg-white shadow-md transition-all"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>

                        <Card className="border border-[#1B5E3B]/20 shadow-xl max-w-2xl mx-auto bg-white rounded-3xl overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                                    <img
                                        src={capTeam[capIndex].image}
                                        alt={capTeam[capIndex].name}
                                        className="w-36 h-36 shrink-0 rounded-full object-cover border-4 border-[#1B5E3B] shadow-lg"
                                    />
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1B5E3B] mb-2">{capTeam[capIndex].name}</h3>
                                        <p className="text-lg text-[#C8A046] font-bold mb-4">{capTeam[capIndex].role}</p>
                                        <p className="text-[#1B5E3B]/80 text-lg leading-relaxed">{capTeam[capIndex].credentials}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center gap-3 mt-8">
                            {capTeam.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCapIndex(idx)}
                                    className={`h-3 rounded-full transition-all duration-300 ${idx === capIndex ? 'bg-[#1B5E3B] w-10' : 'bg-[#1B5E3B]/20 w-3 hover:bg-[#1B5E3B]/50'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Local Organizing Committee (Red Accent) */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-[#1B5E3B] mb-6">Local Organizing Committee</h2>
                        <div className="w-24 h-1.5 bg-[#A4372C] mx-auto rounded-full mb-8"></div>
                        <p className="text-xl text-[#1B5E3B]/80 max-w-3xl mx-auto font-medium">
                            Experienced professionals dedicated to delivering Africa's premier debate championship
                        </p>
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleLocPrev}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 z-10 h-14 w-14 rounded-full border-[#A4372C] text-[#A4372C] hover:bg-[#A4372C] hover:text-white bg-[#F6F0E1] shadow-md transition-all"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </Button>

                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleLocNext}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 z-10 h-14 w-14 rounded-full border-[#A4372C] text-[#A4372C] hover:bg-[#A4372C] hover:text-white bg-[#F6F0E1] shadow-md transition-all"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </Button>

                        <Card className="border border-[#A4372C]/20 shadow-xl max-w-2xl mx-auto bg-[#F6F0E1]/30 rounded-3xl overflow-hidden">
                            <CardContent className="p-8 md:p-12">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
                                    {locTeam[locIndex].image && (
                                        <img
                                            src={locTeam[locIndex].image}
                                            alt={locTeam[locIndex].name}
                                            className="w-36 h-36 shrink-0 rounded-full object-cover border-4 border-[#A4372C] shadow-lg"
                                        />
                                    )}
                                    {!locTeam[locIndex].image && (
                                        <div className="w-36 h-36 shrink-0 rounded-full bg-[#A4372C]/20 border-4 border-[#A4372C] shadow-lg flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-[#A4372C] font-bold text-sm">Coming Soon</div>
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#1B5E3B] mb-2">{locTeam[locIndex].name}</h3>
                                        <p className="text-lg text-[#1B5E3B] font-bold mb-4">{locTeam[locIndex].role}</p>
                                        <p className="text-[#1B5E3B]/80 text-lg leading-relaxed">{locTeam[locIndex].bio}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-center gap-3 mt-8">
                            {locTeam.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setLocIndex(idx)}
                                    className={`h-3 rounded-full transition-all duration-300 ${idx === locIndex ? 'bg-[#A4372C] w-10' : 'bg-[#A4372C]/30 w-3 hover:bg-[#A4372C]/60'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 bg-[#1B5E3B] text-[#F6F0E1] text-center">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-black mb-6">Join us at PAUDC 2026</h2>
                    <p className="text-xl text-[#F6F0E1]/80 mb-10 leading-relaxed max-w-2xl mx-auto">
                        Be part of Africa's most prestigious debate championship. Updated tournament schedule will be shared soon.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <a href="/invite" className="inline-block">
                            <button className="px-10 py-4 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold rounded-full shadow-lg transition-transform hover:-translate-y-1">
                                Request an Invite
                            </button>
                        </a>
                        <a href="/contact" className="inline-block">
                            <button className="px-10 py-4 bg-transparent border-2 border-[#C8A046] hover:bg-[#C8A046] text-[#C8A046] hover:text-[#022512] font-bold rounded-full transition-all hover:-translate-y-1">
                                Contact Us
                            </button>
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}