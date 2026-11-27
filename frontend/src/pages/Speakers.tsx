import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, MapPin } from 'lucide-react';

interface Speaker {
    name: string;
    role: string;
    bio: string[];
    /** Optional headshot in /public (e.g. '/speakers/baba-aye.jpg'); initials show until one is added. */
    photo?: string;
    /** Required for openly licensed photos (e.g. CC BY-SA); omit for headshots supplied by the speaker. */
    photoCredit?: { author: string; source: string; license: string; licenseUrl: string };
}

const PANEL_QUESTIONS = [
    'What does meaningful African solidarity look like today?',
    'How do we reconcile national sovereignty with continental integration?',
    'What place should the African diaspora occupy in the continent’s political, cultural, and economic future?',
    'How can young Africans translate Pan-African consciousness into institutions, policies, and collective action?',
];

// Alphabetical by surname.
const SPEAKERS: Speaker[] = [
    {
        name: 'Bàbá Ayé',
        role: 'Trade unionist & Pan-Africanist',
        bio: [
            'Bàbá Ayé is a trade unionist, revolutionary Pan-Africanist and chair of the editorial board of the Socialist Workers League. Over the last forty years, he has served at different times as PRO of the National Association of Nigerian Students, President of the League of Black Nationalists (LBN), Lagos State Secretary of the Pan-African Youth Congress (PAYCO), Deputy National Secretary of the Labour Party, National Convener of the United Action for Democracy (UAD) and is currently a leading member of the African Action Congress.',
            'Bàbá is a founding member of the Global African Workers’ Institute (GAWI) and a contributing editor of the Review of African Political Economy (ROAPE). He is a senior policy officer of a global trade union federation based in Geneva, where he is also co-president of the Geneva Global Health Hub (G2H2).',
        ],
    },
    {
        name: 'Siphiwe Ka Baleka',
        role: 'Pan-African scholar, author & activist',
        bio: [
            'Siphiwe Ka Baleka is a Pan-African scholar, author and activist whose work engages African identity, ancestral reconnection, diaspora relations and historical justice — bringing to the panel the relationship between Africa and its diaspora, the importance of historical consciousness, and the possibilities of a genuinely connected global African community.',
        ],
    },
    {
        name: 'Dike Chukwumerije',
        role: 'Author, spoken word & performance poet',
        photo: '/speakers/dike-chukwumerije.jpg',
        photoCredit: {
            author: 'Hassanabdul',
            source: 'https://commons.wikimedia.org/wiki/File:Dike_Chukwumerije.jpg',
            license: 'CC BY-SA 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        },
        bio: [
            'Dike Chukwumerije is a Nigerian author and spoken word poet whose work calls for national rebirth and a reawakening of social consciousness. Trained as a lawyer, he has published eight books, including the novel Urichindere, winner of the 2013 Association of Nigerian Authors (ANA) Prize for Prose Fiction. He won the maiden edition of The African Poet (Nigeria) Grand Slam, has hosted and directed the annual Night of the Spoken Word since 2013, and has toured his poetry-theatre production Made in Nigeria to cities across the country since 2016.',
            'His rendition of “The Wall and The Bridge” at the 23rd Nigerian Economic Summit in 2017 drew national attention, and in 2018 Vice President Yemi Osinbajo recited his poem “The Revolution Has No Tribe” in a speech on young Nigerians shaping the country’s future. In 2022 he sat on the judging panel of the Nigeria Prize for Literature. He is based in Abuja, where he is a long-standing member of the Abuja Literary Society.',
        ],
    },
    {
        name: 'Prof. Joomay Ndongo Faye',
        role: 'Secretary-General, Pan-African Federalist Movement (PAFM)',
        bio: [
            'Professor Joomay Ndongo Faye is Secretary-General of the Pan-African Federalist Movement (PAFM), with a focus on African political unity, federalism and institutional integration — bringing to the panel the practical possibilities of African federalism, the relationship between national sovereignty and continental cooperation, and the institutional reforms needed to advance meaningful integration.',
        ],
    },
];

/** First and last initials, ignoring honorifics such as "Prof." */
function initials(name: string): string {
    const parts = name.split(/\s+/).filter(part => !part.endsWith('.'));
    const first = parts[0]?.charAt(0) ?? '';
    const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
}

export default function Speakers() {
    return (
        <div className="min-h-screen bg-white">
            <SEO
                title="Speakers"
                description="Voices of a Continent: Rethinking Pan-Africanism for a New Generation — the PAUDC 2026 Civic Panel on 15 December 2026 at Veritas University, Abuja, with Bàbá Ayé, Siphiwe Ka Baleka, Dike Chukwumerije and Prof. Joomay Ndongo Faye."
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

            {/* Civic Panel */}
            <section className="pt-12 md:pt-20 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border-2 border-[#C8A046]/40 bg-[#F6F0E1]/60 p-6 md:p-10">
                        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-[#A4372C] mb-2 md:mb-3">
                            PAUDC 2026 Civic Panel
                        </p>
                        <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-5">
                            Voices of a Continent: Rethinking Pan-Africanism for a New Generation
                        </h2>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-6 text-sm md:text-base font-semibold text-[#1B5E3B] mb-5 md:mb-6">
                            <span className="flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                Tuesday, 15 December 2026
                            </span>
                            <span className="flex items-center gap-2">
                                <MapPin className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                Veritas University, Abuja
                            </span>
                        </div>
                        <p className="text-sm md:text-lg text-gray-700 leading-relaxed mb-4 md:mb-5">
                            Conceived as an intergenerational dialogue, <em>Voices of a Continent</em> examines the meaning, relevance, and future of Pan-Africanism in a rapidly changing world, moving beyond the historical aspirations of African unity to the practical questions facing a new generation:
                        </p>
                        <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                            {PANEL_QUESTIONS.map(question => (
                                <li key={question} className="flex items-start gap-3">
                                    <span className="mt-2 w-2 h-2 rounded-full bg-[#C8A046] flex-shrink-0" aria-hidden="true" />
                                    <span>{question}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Speakers */}
            <section className="py-12 md:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Meet the Speakers</h2>
                        <p className="text-base md:text-xl text-gray-600 max-w-3xl mx-auto">
                            Thought leaders from across Africa and its diaspora joining the conversation at PAUDC 2026.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
                        {SPEAKERS.map(speaker => (
                            <Card key={speaker.name} className="border-2 border-[#C84B46]/20 h-full">
                                <CardContent className="p-6 md:p-8">
                                    <div className="flex items-center gap-4 mb-5 md:mb-6">
                                        {speaker.photo ? (
                                            <img
                                                src={speaker.photo}
                                                alt={speaker.name}
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div
                                                aria-hidden="true"
                                                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#A4372C] to-[#C8A046] flex items-center justify-center flex-shrink-0 text-white text-xl md:text-2xl font-bold"
                                            >
                                                {initials(speaker.name)}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{speaker.name}</h3>
                                            <p className="text-sm md:text-base font-semibold text-[#A4372C]">{speaker.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:space-y-4 text-sm md:text-base text-gray-700 leading-relaxed">
                                        {speaker.bio.map((paragraph, i) => (
                                            <p key={i}>{paragraph}</p>
                                        ))}
                                    </div>
                                    {speaker.photoCredit && (
                                        <p className="mt-4 text-xs text-gray-500">
                                            Photo:{' '}
                                            <a href={speaker.photoCredit.source} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                                                {speaker.photoCredit.author}, Wikimedia Commons
                                            </a>
                                            {' · '}
                                            <a href={speaker.photoCredit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700">
                                                {speaker.photoCredit.license}
                                            </a>
                                            {' · cropped'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <p className="text-center text-sm md:text-base text-gray-500 mt-10 md:mt-12">
                        More speakers and panelists will be announced soon.
                    </p>
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
