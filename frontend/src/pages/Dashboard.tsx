import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Mic,
  Lightbulb,
  Globe,
  GraduationCap,
  MessageSquare,
  Palette,
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import continent from "../assets/continent.jpg";
import vunalogo from "../assets/vunalogo.jpg";
import vuef from "../assets/vuef.jpg";
import kakaki from "../assets/kakaki.png";
import FigmaCenteredHero from "@/components/FigmaCenteredHero";

/* ─── SVG trophy illustration ─── */
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

      {/* ─── NAVBAR ─── */}
      <Navbar />

      {/* ─── HERO ─── */}
      {/* Removed the extra pt-28 wrapper here to eliminate the massive gap */}
      <FigmaCenteredHero timeLeft={timeLeft} />

      {/* ─── FEATURES ─── */}
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

      {/* ─── CONTINENTAL HOMECOMING ─── */}
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
              captures the idea of an Africa governed by intellect rather than impulse — a place where dialogue shapes destiny.
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

      {/* ─── EVENT PILLARS ─── */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#022512]">Event Pillars</h2>
        <p className="text-lg text-[#022512]/70 mb-16">
          Ten days of intellectual excellence, cultural celebration, and Pan-African unity.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
          {[
            { icon: <Trophy className="w-7 h-7 text-[#A4372C]" />, bg: "bg-[#A4372C]/10", title: "Debate Championship", desc: "Ten days of British Parliamentary debate rounds testing reasoning, persuasion, and teamwork." },
            { icon: <MessageSquare className="w-7 h-7 text-[#C8A046]" />, bg: "bg-[#C8A046]/10", title: "Public Speaking", desc: "Celebrating clarity, persuasion, and thought leadership through speech." },
            { icon: <GraduationCap className="w-7 h-7 text-[#1B5E3B]" />, bg: "bg-[#1B5E3B]/10", title: "Adjudicators Academy", desc: "Training and certification program for over 200 judges." },
            { icon: <Mic className="w-7 h-7 text-[#A4372C]" />, bg: "bg-[#A4372C]/10", title: "Civic Panels", desc: "Voices of a Continent – Rethinking Pan-Africanism for a New Generation." },
            { icon: <Lightbulb className="w-7 h-7 text-[#1B5E3B]" />, bg: "bg-[#1B5E3B]/10", title: "The Legacy Lab", desc: "Youth-led innovation space transforming debate insights into actionable initiatives." },
            { icon: <Palette className="w-7 h-7 text-[#C8A046]" />, bg: "bg-[#C8A046]/10", title: "Cultural Exhibition", desc: "Celebrating Africa's artistic diversity and shared identity as One Africa." },
          ].map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-3xl shadow-lg border border-[#022512]/5 hover:-translate-y-2 transition-transform duration-300">
              <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}>
                {item.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-[#022512]">{item.title}</h3>
              <p className="text-[#022512]/70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── THE KAKAKI ─── */}
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

      {/* ─── PARTNERS ─── */}
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

      {/* ─── CTA ─── */}
      <section className="relative z-10 bg-white py-24 text-center px-6">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-[#022512]">Join the Republic of Reason</h2>
        <p className="text-lg text-[#022512]/70 max-w-2xl mx-auto mb-10">
          Be part of Africa&apos;s most prestigious intellectual gathering. Request an invite to secure your place in history as we build Africa&apos;s future through debate.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <a href="/register">
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