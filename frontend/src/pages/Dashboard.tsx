import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { EventStructuredData } from "@/components/StructuredData";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import continent from "../assets/continent.jpg";
import vunalogo from "../assets/vunalogo.jpg";
import vuef from "../assets/vuef.jpg";
import kakaki from "../assets/kakaki.png";
import FigmaCenteredHero from "@/components/FigmaCenteredHero";
import debateChampionshipIcon from "../assets/event-pillars/debate-championship.svg";
import publicSpeakingIcon from "../assets/event-pillars/public-speaking.svg";
import civicPanelIcon from "../assets/event-pillars/civic-panel-sessions.svg";
import legacyLabIcon from "../assets/event-pillars/legacy-lab.svg";
import culturalExhibitionIcon from "../assets/event-pillars/cultural-exhibition.svg";

function TrophyIllustration({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 35C12 35 6 50 10 65C14 78 25 80 30 75" stroke="#A4372C" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M92 35C108 35 114 50 110 65C106 78 95 80 90 75" stroke="#A4372C" strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M30 20H90V60C90 85 75 100 60 100C45 100 30 85 30 60V20Z" fill="#A4372C" />
      <rect x="25" y="15" width="70" height="10" rx="3" fill="#C45A4C" />
      <path d="M45 30V55C45 65 50 72 55 75" stroke="#D4817A" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <rect x="52" y="100" width="16" height="15" rx="2" fill="#A4372C" />
      <rect x="38" y="115" width="44" height="8" rx="4" fill="#A4372C" />
      <ellipse cx="60" cy="128" rx="30" ry="4" fill="#A4372C" opacity="0.15" />
    </svg>
  );
}

export default function Dashboard() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const targetDate = new Date("December 5, 2026 00:00:00").getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="bg-[#f6f0e1] w-full min-h-screen relative overflow-x-hidden text-[#022512]">
      <SEO
        title="Pan-African University Debating Championship 2026"
        description="PAUDC 2026 - Africa's premier intellectual arena. December 5-13, 2026 in Abuja, Nigeria. The Sound of Africa's Resolve."
        canonical="https://www.paudc2026.com/"
      />
      <EventStructuredData />

      <div className="relative md:h-[100dvh] lg:h-auto 2xl:h-[100dvh]">
        <div className="md:absolute md:top-0 md:left-0 md:right-0 md:z-50 lg:relative lg:top-auto lg:left-auto lg:right-auto lg:z-auto 2xl:absolute 2xl:top-0 2xl:left-0 2xl:right-0 2xl:z-50">
          <Navbar />
        </div>

        <FigmaCenteredHero timeLeft={timeLeft} />
      </div>

      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:pb-24 text-center">
        <TrophyIllustration className="w-24 h-28 mx-auto mb-6" />
        <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-4 text-[#022512]">
          Compete for Glory &amp; Global Recognition
        </h2>
        <p className="text-base md:text-lg text-[#022512]/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          PAUDC 2026 offers not just prestige,
          <br className="hidden md:inline" />
          but life-changing opportunities for Africa&apos;s brightest minds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#C8A046] text-[#022512] rounded-3xl p-10 flex flex-col justify-center items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
            <h3 className="text-3xl font-extrabold mb-2">$20,000 USD</h3>
            <p className="text-sm font-semibold opacity-90 mb-6 uppercase tracking-wider">Total Prize Money</p>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs font-medium">
              Substantial cash prizes distributed among top-performing teams, recognizing excellence in debate and argumentation.
            </p>
          </div>
          <div className="bg-[#1B5E3B] text-[#f6f0e1] rounded-3xl p-10 flex flex-col justify-center items-center shadow-xl hover:-translate-y-1 transition-transform duration-300">
            <Globe className="w-12 h-12 mb-4 opacity-80" />
            <h3 className="text-3xl font-extrabold mb-2">WUDC Sponsorship</h3>
            <p className="text-sm font-semibold opacity-90 mb-6 uppercase tracking-wider">Full Tournament Package</p>
            <p className="text-sm opacity-80 leading-relaxed max-w-xs">
              Winning team and top judge receive complete sponsorship to represent Africa at the World Universities Debating Championship.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 text-left">
            <h2 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-[#022512]">
              A Continental Homecoming of Thought
            </h2>
            <p className="text-lg text-[#022512]/80 mb-6 leading-relaxed">
              PAUDC 2026 is more than a tournament, it is a continental homecoming of thought. It represents a revival of Africa&apos;s intellectual identity, where youth gather not only to debate but to define the moral and civic fabric of the continent.
            </p>
            <p className="text-lg text-[#022512]/80 mb-8 leading-relaxed">
              At its heart,{" "}
              <span className="font-bold text-[#A4372C]">The Republic of Reason</span>{" "}
            </p>
            <Link to="/about">
              <button className="px-5 py-2 md:px-8 md:py-3 bg-[#1B5E3B] text-[#F6F0E1] rounded-full font-bold hover:bg-[#A4372C] transition-colors shadow-lg">
                Discover Our Vision
              </button>
            </Link>
          </div>
          <div className="w-full md:w-1/2">
            <img src={continent} alt="Students gathering" className="rounded-3xl shadow-2xl w-full object-cover h-[400px]" />
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#022512]">Event Pillars</h2>
          <p className="text-lg text-[#022512]/70">
            Ten days of intellectual excellence, cultural celebration, and Pan-African unity.
          </p>
        </div>

        {/* Top row: 2/3 wide white card + 1/3 dark card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Debate Championship — large */}
          <div className="md:col-span-2 bg-white rounded-[12px] p-8 md:p-10 shadow-md border border-[#022512]/5 flex flex-col min-h-[380px]">
            <div className="w-14 h-14 bg-[#022512] rounded-[10px] flex items-center justify-center mb-7">
              <img
                src={debateChampionshipIcon}
                alt=""
                aria-hidden="true"
                className="w-7 h-6"
              />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[#022512] mb-4 leading-tight">
              Debate Championship
            </h3>
            <p className="text-[#022512]/65 text-base leading-relaxed max-w-md">
              Ten days of British Parliamentary debate rounds testing reasoning,
              persuasion and teamwork
            </p>
            <Link
              to="/about"
              className="mt-auto inline-flex items-center gap-2 text-[#022512] font-semibold text-sm hover:gap-3 transition-all pt-8"
            >
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Public Speaking — dark card */}
          <div className="bg-[#022512] text-[#F6F0E1] rounded-[12px] p-8 md:p-10 shadow-md flex flex-col min-h-[380px]">
            <div className="w-14 h-14 bg-[#0A3320] rounded-[10px] flex items-center justify-center mb-7">
              <img
                src={publicSpeakingIcon}
                alt=""
                aria-hidden="true"
                className="w-5 h-4"
              />
            </div>
            <h3 className="text-2xl font-black mb-4 leading-tight">Public Speaking</h3>
            <p className="text-[#F6F0E1]/75 text-sm leading-relaxed">
              Celebrating clarity, persuasion and thought leadership through speech
            </p>
            <div className="mt-auto pt-7 border-t border-[#F6F0E1]/15 space-y-3">
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#F6F0E1]/65" />
                <span>Keynote Mastery</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#F6F0E1]/65" />
                <span>Impromptu Logic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row: 3 equal white cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: civicPanelIcon,
              title: "Civic Panel Sessions",
              desc: "Voices of a Continent: Rethininking Pan Africanism for a New Generation.",
              cta: "Learn More",
              href: "/civic-panels",
            },
            {
              icon: legacyLabIcon,
              title: "Legacy Lab",
              desc: "Youth led innovation spaces transforming debate insights into actionable initiatives.",
              cta: "Learn More",
              href: "/legacy-lab",
            },
            {
              icon: culturalExhibitionIcon,
              title: "Cultural Exhibition",
              desc: "Celebrating Africa's artistic diversity and shared identity as One Africa.",
              cta: "Learn More",
              href: "/schedule",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-[12px] p-7 md:p-8 shadow-md border border-[#022512]/5 flex flex-col min-h-[280px]"
            >
              <div className="w-12 h-12 bg-[#F6F0E1] rounded-[8px] flex items-center justify-center mb-6">
                <img
                  src={item.icon}
                  alt=""
                  aria-hidden="true"
                  className="w-[18px] h-[18px] object-contain"
                />
              </div>
              <h3 className="text-xl font-black text-[#022512] mb-3 leading-tight">
                {item.title}
              </h3>
              <p className="text-[#022512]/60 text-sm leading-relaxed mb-7">
                {item.desc}
              </p>
              <Link
                to={item.href}
                className="mt-auto text-[#C8A046] hover:text-[#b08c3e] font-semibold text-sm transition-colors"
              >
                {item.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-[#1B5E3B] text-[#F6F0E1] py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-5/12">
            <img src={kakaki} alt="Kakaki trumpet" className="rounded-3xl shadow-2xl w-full object-cover h-[450px]" />
          </div>
          <div className="w-full md:w-7/12 text-left">
            <h2 className="text-4xl md:text-5xl font-black mb-6">The Kakaki: Our Symbol</h2>
            <p className="text-lg opacity-90 mb-6 leading-relaxed">
              The Kakaki, the long royal trumpet of Northern Nigeria, has historically been used to herald kings, announce victories, and summon communities. It is both sound and statement, a call that commands attention and conveys dignity.
            </p>
            <p className="text-lg opacity-90 mb-8 leading-relaxed">
              Its place as the central emblem of PAUDC 2026 connects deeply with the spirit of debate itself. The Kakaki does not whisper; it declares. It carries both grace and power, its voice traveling across distance to gather people, unite them, and remind them that something meaningful is unfolding.
            </p>
            <blockquote className="border-l-4 border-[#C8A046] pl-6 py-2 text-2xl font-semibold italic text-[#C8A046]">
              "When the Kakaki sounds in Abuja, it will awaken a generation."
            </blockquote>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-24 text-center overflow-hidden">
        <h2 className="text-3xl font-black mb-2 text-[#022512]">Our Partners</h2>
        <p className="text-[#022512]/70 mb-12">Proudly supported by leading institutions and organizations</p>
        <div className="relative w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f6f0e1] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f6f0e1] to-transparent z-10 pointer-events-none" />
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 px-8">
            <div className="flex items-center gap-3 font-bold text-lg text-[#022512]">
              <img src={vuef} alt="VUEF Logo" className="w-10 h-auto object-contain" />
              Veritas University Endowment Fund
            </div>
            <div className="flex items-center gap-3 font-bold text-lg text-[#022512]">
              <img src={vunalogo} alt="Veritas Logo" className="w-10 h-auto object-contain" />
              Veritas University
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 bg-white py-24 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#022512]">Join the Republic of Reason</h2>
        <p className="text-lg text-[#022512]/70 max-w-2xl mx-auto mb-10">
          Be part of Africa&apos;s most prestigious intellectual gathering. Request an invite to secure your place in history as we build Africa&apos;s future through debate.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <a href="/invite">
            <button className="px-8 py-3 bg-[#C8A046] text-[#022512] rounded-full font-bold hover:bg-[#b08c3e] transition shadow-lg">
              Request an Invite
            </button>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
