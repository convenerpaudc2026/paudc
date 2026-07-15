/* ─────────────────────────────────────────────────────────────────────────
 * Blog data layer
 *
 * Swap `BLOG_POSTS` for an API call (`api.entities.content_pages.query()`)
 * once the backend content-pages endpoint is wired up.
 * ───────────────────────────────────────────────────────────────────────── */

import championshipNewsImg from '@/assets/blog/championship_news.png';
import civicEngagementImg from '@/assets/blog/civic_engagement.png';
import debateTipsImg from '@/assets/blog/debate_tips.png';
import preparationImg from '@/assets/blog/preparation.png';
import abujaImg from '@/assets/blog/abuja.png';

export const CATEGORY_IMAGES: Record<string, string> = {
    'Debate Tips': debateTipsImg,
    'Championship News': championshipNewsImg,
    'Civic Engagement': civicEngagementImg,
    'Preparation': preparationImg,
};

export function getCategoryImage(category: string): string {
    return CATEGORY_IMAGES[category] || championshipNewsImg;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string; // HTML string rendered with dangerouslySetInnerHTML
    category: string;
    author: string;
    authorRole: string;
    date: string;       // ISO date string
    readTime: number;   // minutes
    thumbnail: string;  // URL or empty string for gradient fallback
    tags: string[];
    featured?: boolean;
}

export const CATEGORIES = ['All', 'Debate Tips', 'Championship News', 'Civic Engagement', 'Preparation'];

export const BLOG_POSTS: BlogPost[] = [
    {
        id: '1',
        slug: 'mastering-the-point-of-information',
        title: 'Mastering the Point of Information',
        excerpt:
            'The POI is one of the most underrated weapons in the British Parliamentary format. Learn how top PAUDC competitors use it to shift the narrative — without derailing their own speech.',
        content: `
<h2>What is a Point of Information?</h2>
<p>A <strong>Point of Information (POI)</strong> is an interruption offered by the opposition bench during any speech in British Parliamentary debate. Offered between the first and last minutes of a seven-minute speech, a well-placed POI can expose a logical gap, introduce a damaging concession, or simply unsettle a nervous speaker.</p>
<p>Yet most debaters treat POIs as an afterthought — a box to tick rather than a strategic tool. The best competitors at PAUDC treat them as a second speech embedded inside the opponent's own.</p>

<h2>The Two Purposes of a POI</h2>
<h3>1. Disruption</h3>
<p>A POI offered at the exact moment a speaker reaches their key claim forces them to defend it immediately, before they have built the surrounding context. Even if they decline or answer well, you have flagged the vulnerability to the judge.</p>
<h3>2. Information-gathering</h3>
<p>A clever question can extract a concession your bench can exploit in later speeches. Ask <em>"Would the government accept that X leads to Y?"</em> and a yes locks them into a position you can weaponise; a no creates an inconsistency you can attack.</p>

<h2>The Three Rules of a Good POI</h2>
<ul>
<li><strong>Short.</strong> The POI must be completable in under fifteen seconds. A long POI is simply ignored — or worse, accepted and then buried by a confident speaker.</li>
<li><strong>Specific.</strong> Vague challenges ("But what about the poor?") are easily deflected. Pin it to something the speaker said three sentences ago.</li>
<li><strong>Strategic.</strong> Every POI you offer should connect to a line of argument your bench is developing. Random interruptions signal that you are grasping, not executing a plan.</li>
</ul>

<blockquote>"The mark of a great debater is not how many POIs they offer, but how few perfectly timed ones they deliver."</blockquote>

<h2>Accepting POIs: the Art of Control</h2>
<p>Accepting a POI is a sign of confidence — but only if you handle it cleanly. Practice one-sentence responses that acknowledge the question and redirect to your own argument. Never spend more than 20 seconds on a POI response. If the POI exposes a genuine gap in your case, acknowledge it briefly and move on; judges respect intellectual honesty.</p>

<h2>Practising at PAUDC 2026</h2>
<p>During the practice rounds at PAUDC 2026, make a deliberate decision: in each speech, offer exactly two POIs. Evaluate them afterwards. This constraint forces quality over quantity and will sharpen your strategic thinking faster than any other single drill.</p>
        `,
        category: 'Debate Tips',
        author: 'Fatima Aliyu',
        authorRole: 'Chief Adjudicator, PAUDC 2026',
        date: '2026-04-10',
        readTime: 6,
        thumbnail: '',
        tags: ['British Parliamentary', 'POI', 'Strategy', 'Adjudication'],
        featured: true,
    },
    {
        id: '2',
        slug: 'paudc-2026-abuja-host-city-guide',
        title: 'Your Guide to Abuja: PAUDC 2026 Host City',
        excerpt:
            "From Aso Rock to the National Mosque, Abuja is one of Africa's most planned and visually striking capitals. Here is everything delegates need to know before arriving in December.",
        content: `
<h2>Why Abuja?</h2>
<p>The Federal Capital Territory was purpose-built as Nigeria's seat of government, replacing Lagos in 1991. Unlike many African capitals that grew organically over centuries, Abuja was designed from scratch — wide boulevards, zoned districts, and green spaces that make it feel unlike any other city on the continent.</p>
<p>Hosting PAUDC 2026 here is a deliberate signal: the championship returns to the heart of Africa's largest democracy, at a moment when youth civic engagement has never been more important.</p>

<h2>Getting There</h2>
<p>Nnamdi Azikiwe International Airport (ABV) receives direct flights from Addis Ababa, Cairo, Dubai, London, and Johannesburg, among others. Most delegates will clear immigration in under an hour; the PAUDC 2026 team will have a designated welcome desk airside from December 11th.</p>

<h2>Where You'll Be Staying</h2>
<p>All official accommodation is clustered in the Maitama and Wuse II districts, within a short shuttle ride of Veritas University, the tournament venue. Delegates will receive their specific hotel assignments in the November confirmation package.</p>

<h2>Climate in December</h2>
<p>December in Abuja is the peak of the dry season. Expect sunny days between <strong>28–34°C</strong> and cool nights around 18°C. Harmattan winds — carrying fine dust from the Sahara — begin in late November, so pack a light layer and eye drops if you wear contacts.</p>

<h2>Must-See Sights</h2>
<ul>
<li><strong>Aso Rock</strong> — the iconic granite outcrop that defines the city's skyline</li>
<li><strong>Nigerian National Mosque</strong> — one of the largest mosques in sub-Saharan Africa</li>
<li><strong>National Christian Centre</strong> — a striking architectural counterpoint nearby</li>
<li><strong>Millennium Park</strong> — perfect for a morning run or evening wind-down</li>
<li><strong>Wuse Market</strong> — the best place to find traditional fabrics, spices, and souvenirs</li>
</ul>

<h2>Currency & Connectivity</h2>
<p>The Nigerian Naira (NGN) is the local currency. ATMs accepting Visa and Mastercard are plentiful in the main districts. Mobile data is excellent — Airtel and MTN sell tourist SIMs at the airport for under $5.</p>
        `,
        category: 'Championship News',
        author: 'PAUDC 2026 Secretariat',
        authorRole: 'Organising Committee',
        date: '2026-03-28',
        readTime: 5,
        thumbnail: abujaImg,
        tags: ['Abuja', 'Nigeria', 'Travel', 'Host City', 'PAUDC 2026'],
        featured: false,
    },
    {
        id: '3',
        slug: 'the-legacy-lab-civic-innovation-at-paudc',
        title: 'The Legacy Lab: Why We Build Beyond the Tournament',
        excerpt:
            "PAUDC 2026 introduces the Legacy Lab — a structured civic innovation programme running alongside the championship. Here's the thinking behind it and how to get involved.",
        content: `
<h2>Debate Is a Tool, Not the Goal</h2>
<p>Every edition of PAUDC brings together some of the sharpest young minds on the continent. For one week they argue, persuade, and refute with extraordinary skill. Then the tournament ends, and that intellectual energy disperses back into universities across 54 nations.</p>
<p>The Legacy Lab is our answer to a simple question: what if some of that energy stayed?</p>

<h2>What Is the Legacy Lab?</h2>
<p>Running in parallel to the main tournament, the Legacy Lab is a structured programme in which teams of delegates work on real civic problems identified by Nigerian and pan-African stakeholders. Think hackathon, policy sprint, and design thinking workshop rolled into one — with competitive debaters as the participants.</p>
<p>The output is not a debate round. It is a policy brief, a prototype, or a community intervention plan that teams present to a panel of civic leaders, academics, and NGO representatives on the final day of the championship.</p>

<h2>The Problem Tracks</h2>
<ul>
<li><strong>Youth Political Participation</strong> — how do we close the gap between youth civic enthusiasm and formal political engagement in post-colonial contexts?</li>
<li><strong>University Debate Infrastructure</strong> — what institutional models can sustain competitive debate programmes without external donor dependency?</li>
<li><strong>Misinformation and Democratic Discourse</strong> — what practical interventions can university communities deploy against the spread of political disinformation?</li>
</ul>

<h2>How to Participate</h2>
<p>Legacy Lab participation is opt-in and limited to 12 teams of three delegates each. Applications open with tournament registration and close on October 31st, 2026. Applicants are selected based on their written statement of interest, not their debate record — this is explicitly a space for people who want to build, not just argue.</p>

<blockquote>"We want debaters who are exhausted by describing problems and hungry to design solutions."</blockquote>
        `,
        category: 'Civic Engagement',
        author: 'Dr. Amara Diallo',
        authorRole: 'Legacy Lab Director',
        date: '2026-03-15',
        readTime: 7,
        thumbnail: '',
        tags: ['Legacy Lab', 'Civic Innovation', 'Policy', 'Youth'],
        featured: false,
    },
    {
        id: '4',
        slug: '30-day-preparation-plan-for-paudc-delegates',
        title: '30-Day Preparation Plan for PAUDC Delegates',
        excerpt:
            'Whether you are a first-time participant or a returning champion, a structured 30-day prep plan is the single most effective thing you can do before arriving in Abuja.',
        content: `
<h2>Why a Structured Plan?</h2>
<p>The most common mistake delegates make is treating preparation as a series of disconnected activities — reading a few motion cards here, watching a YouTube debate there. A structured plan compounds your progress: each week builds on the last, and the skills you develop in week one become automatic by week four.</p>

<h2>Week 1: Foundations</h2>
<ul>
<li>Read the three most recent PAUDC final round transcripts. Focus on how speakers structure their extensions, not just what arguments they make.</li>
<li>Practice one-minute impromptu speeches every day on random topics. The goal is fluency under pressure, not rhetorical polish.</li>
<li>Review the British Parliamentary format rules in full. Many experienced debaters carry subtle misunderstandings about the Whip speech role that cost them marks.</li>
</ul>

<h2>Week 2: Argument Architecture</h2>
<ul>
<li>Study three policy areas likely to appear as motions: climate justice, digital governance, and pan-African trade integration. Build a mental model of the strongest arguments on each side.</li>
<li>Drill claim-warrant-impact structures until they feel unnatural NOT to use.</li>
<li>Run two full practice rounds with your partner. Record them.</li>
</ul>

<h2>Week 3: Refinement</h2>
<ul>
<li>Watch the recordings from Week 2 with your eyes closed. Voice quality, pacing, and filler words are much more apparent when you remove the visual channel.</li>
<li>Identify your three most common logical fallacies. Debaters who can name their own weaknesses fix them twice as fast.</li>
<li>Research the specific context of Nigeria and West Africa — expect at least one motion with a direct African application.</li>
</ul>

<h2>Week 4: Competition Readiness</h2>
<ul>
<li>Reduce the volume of new material. Your brain needs consolidation time, not more input.</li>
<li>Run full-speed practice rounds against unfamiliar opponents if possible.</li>
<li>Finalise travel logistics so they do not distract you in the final days.</li>
<li>Get eight hours of sleep every night. Fatigue is the most underrated performance variable in debate.</li>
</ul>

<blockquote>"Talent gets you to the elimination rounds. Preparation wins them."</blockquote>
        `,
        category: 'Preparation',
        author: 'Kwame Asante',
        authorRole: 'PAUDC 2024 Champion',
        date: '2026-02-20',
        readTime: 8,
        thumbnail: '',
        tags: ['Preparation', 'Training', 'Strategy', 'British Parliamentary'],
        featured: false,
    },
    {
        id: '5',
        slug: 'the-state-of-university-debate-in-africa-2026',
        title: 'The State of University Debate in Africa: 2026 Report',
        excerpt:
            'From Nairobi to Lagos, Cape Town to Accra — the African university debate circuit has never been larger. But growth brings new challenges. Our 2026 landscape report.',
        content: `
<h2>The Numbers</h2>
<p>Over 200 universities from 38 African countries have registered delegates for PAUDC 2026 — a 23% increase on the 2024 edition. In raw terms, the African university debate community has more than doubled in size since 2016. By any measure, this is a success story.</p>

<h2>The Geographic Spread</h2>
<p>Growth has not been uniform. East Africa — led by Kenya, Uganda, and Tanzania — continues to produce a disproportionate share of the top-ranked teams. West Africa has surged in the past two cycles, with Nigerian and Ghanaian institutions winning four of the last eight individual speaker awards. Southern Africa remains competitive at the top but struggles with institutional depth beyond a handful of flagship universities.</p>
<p>The most exciting development in the current cycle has been the emergence of Francophone African institutions. Teams from Senegal, Côte d'Ivoire, and the DRC are entering the circuit in growing numbers, adding both linguistic and intellectual diversity to the competition.</p>

<h2>The Infrastructure Gap</h2>
<p>Behind the headline numbers lies a harder story. The majority of university debate societies operate without dedicated budgets, trained coaches, or institutional recognition. Most preparation happens through WhatsApp groups and informal peer feedback. When the university administration changes, the society often collapses with it.</p>
<p>The Legacy Lab's University Debate Infrastructure track (see our previous post) is a direct response to this challenge. Sustainable structures, not individual talent, are what will take African university debate from a sport to a civic institution.</p>

<h2>What to Watch at PAUDC 2026</h2>
<ul>
<li>The performance of first-time participating nations, several of which have invested heavily in preparation programmes supported by the British Council.</li>
<li>The inaugural PAUDC Novice Cup — a separate competition stream for universities attending their first or second PAUDC.</li>
<li>The Legacy Lab final presentations, which may well be the most intellectually substantive part of the entire championship.</li>
</ul>
        `,
        category: 'Championship News',
        author: 'PAUDC Research Team',
        authorRole: 'Championship Secretariat',
        date: '2026-01-30',
        readTime: 9,
        thumbnail: '',
        tags: ['Africa', 'University Debate', 'Report', 'PAUDC 2026'],
        featured: false,
    },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
    return BLOG_POSTS.find(p => p.slug === slug);
}

export function getPostsByCategory(category: string): BlogPost[] {
    if (category === 'All') return BLOG_POSTS;
    return BLOG_POSTS.filter(p => p.category === category);
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}
