import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Building,
  Trophy,
  Mic,
  Lightbulb,
  Globe,
  GraduationCap,
  MessageSquare,
  Palette,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import paudcLogo from "../assets/paudc-logo.png";
import debaters from "../assets/debaters.jpg";
import continent from "../assets/continent.jpg";
import heroThree from "../assets/hero-three.jpg";
import heroFour from "../assets/hero-four.jpg";
import LOGO_URL from "../assets/paudc.png";
import vunalogo from "../assets/vunalogo.jpg";
import vuef from "../assets/vuef.jpg";
import kakaki from "../assets/kakaki.png";

/* ─── simple SVG trophy illustration ─── */
function TrophyIllustration({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M28 35C12 35 6 50 10 65C14 78 25 80 30 75"
        stroke="#A4372C"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M92 35C108 35 114 50 110 65C106 78 95 80 90 75"
        stroke="#A4372C"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 20H90V60C90 85 75 100 60 100C45 100 30 85 30 60V20Z"
        fill="#A4372C"
      />
      <rect x="25" y="15" width="70" height="10" rx="3" fill="#C45A4C" />
      <path
        d="M45 30V55C45 65 50 72 55 75"
        stroke="#D4817A"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
      />
      <rect x="52" y="100" width="16" height="15" rx="2" fill="#A4372C" />
      <rect x="38" y="115" width="44" height="8" rx="4" fill="#A4372C" />
      <ellipse cx="60" cy="128" rx="30" ry="4" fill="#A4372C" opacity="0.15" />
    </svg>
  );
}

/* ─── Animated Number Helper ─── */
function AnimatedNumber({
  end,
  prefix = "",
  suffix = "",
  duration = 2000,
}: {
  end: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const numberRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    if (numberRef.current) observer.observe(numberRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    };
    requestAnimationFrame(animate);
  }, [end, duration, isVisible]);

  return (
    <span ref={numberRef}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function Dashboard() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const heroImages = [debaters, continent, heroThree, heroFour];
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const targetDate = new Date("December 5, 2026 00:00:00").getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    };
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Team", path: "/team" },
    { name: "Schedule", path: "/schedule" },
    { name: "Civic Panel", path: "/speakers" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <div className="bg-[#f6f0e1] w-full min-h-screen relative overflow-x-hidden text-[#022512]">
      {/* ─── HEADER / NAVBAR ─── */}
      <nav className="fixed top-0 left-0 w-full bg-[#F6F0E1]/95 backdrop-blur-md border-b border-[#022512]/10 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 shrink-0">
              <img
                src={LOGO_URL}
                alt="PAUDC Logo"
                className="h-12 md:h-16 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-sm text-[#022512] font-semibold transition-colors hover:text-[#1B5E3B]"
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex gap-3 ml-4">
                <a href="/login">
                  <Button
                    variant="outline"
                    className="border-[#022512] text-[#022512] hover:bg-[#022512] hover:text-[#F6F0E1] rounded-xl px-4"
                  >
                    LMS Portal
                  </Button>
                </a>
                <a href="/register">
                  <Button className="bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold rounded-xl px-4">
                    Request an Invite
                  </Button>
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-[#022512]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[#F6F0E1] border-b border-[#022512]/10 px-4 pt-2 pb-6 flex flex-col space-y-4 shadow-xl">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="text-lg font-bold py-2 border-b border-black/5"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full border-[#022512] rounded-xl"
              >
                LMS Portal
              </Button>
              <Button className="w-full bg-[#C8A046] text-[#022512] rounded-xl">
                Request an Invite
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Dynamic background images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[3000ms] ease-in-out ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image}
                alt="Background"
                className="w-full h-full object-cover scale-105 animate-[pulse_12s_ease-in-out_infinite]"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-[#022512]/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f6f0e1]" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 md:h-[120vh] w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-30 pb-12 md:pt-16 flex flex-col">
          <div className="flex-[0.5] flex flex-col items-center text-center justify-between md:justify-center gap-6 md:gap-10">
            {/* PAUDC PILL - Proper top spacing via pt-24 on parent */}
            <div className="bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-4 md:px-6 py-2">
              <span className="text-white/90 text-[10px] md:text-sm tracking-widest font-bold uppercase">
                PAUDC 2026
              </span>
            </div>

            {/* LOGO & SLOGAN */}
            <div className="flex flex-col items-center gap-2">
              <img
                src={paudcLogo}
                alt="PAUDC 2026"
                className="h-20 sm:h-28 md:h-32 lg:h-44 w-auto object-contain drop-shadow-2xl"
              />
              <p className="text-xl md:text-3xl text-[#F6F0E1] italic font-serif">
                The Sound of{" "}
                <span className="font-bold text-[#A4372C]">
                  Africa&apos;s Resolve
                </span>
              </p>
            </div>

            {/* EVENT DETAILS - Spaced for mobile row */}
            <div className="w-full max-w-4xl md:bg-white/10 md:backdrop-blur-xl md:border md:border-white/20 rounded-2xl md:rounded-3xl md:p-6">
              {/* Increased gap from 6 to 10 for better mobile separation */}
              <div className="flex flex-row items-center justify-center gap-10 md:gap-16">
                {/* Date Item */}
                <div className="flex items-center justify-center gap-2.5">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[#C8A046]" />
                  <span className="text-[11px] md:text-base text-white font-bold whitespace-nowrap uppercase tracking-[0.15em]">
                    Dec 5–12, 2026
                  </span>
                </div>

                {/* Location Item */}
                <div className="flex items-center justify-center gap-2.5">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[#C8A046]" />
                  <span className="text-[11px] md:text-base text-white font-bold whitespace-nowrap uppercase tracking-[0.15em]">
                    Abuja, Nigeria
                  </span>
                </div>

                {/* University Item (Desktop Only) */}
                <div className="hidden md:flex items-center justify-center gap-2.5">
                  <Building className="w-5 h-5 text-[#C8A046]" />
                  <span className="text-sm md:text-base text-white font-bold whitespace-nowrap uppercase tracking-[0.15em]">
                    Veritas University
                  </span>
                </div>
              </div>
            </div>

            {/* COUNTDOWN - Clean mobile spacing */}
            <div className="flex mt-8 md:mt-0 items-center justify-between md:justify-center w-full max-w-[340px] md:max-w-xl mx-auto md:bg-white/10 md:backdrop-blur-xl md:border md:border-white/20 md:rounded-3xl md:shadow-xl md:divide-x md:divide-white/20">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex flex-1 items-center justify-center"
                >
                  <div className="flex flex-col items-center px-2 md:px-8 py-2 md:py-6">
                    <div className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter">
                      {String(t.value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-white/60 mt-1">
                      {t.label}
                    </div>
                  </div>

                  {/* Mobile Separator - Hidden on MD+ because of desktop divide-x */}
                  {i < 3 && (
                    <span className="text-2xl font-extralight text-white/30 mb-6 md:hidden">
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
            {/* CTA - Fixed at bottom of the hero height on mobile */}
            <div className="mt-20 flex flex-row gap-4 w-full justify-center px-4 mb-4 md:mb-0">
              <Link to="/register" className="flex-1 max-w-[200px]">
                <button className="w-full h-14 bg-[#C8A046] text-[#022512] rounded-full text-sm font-bold shadow-xl uppercase tracking-wider">
                  Request invite
                </button>
              </Link>
              <Link to="/about" className="flex-1 max-w-[200px]">
                <button className="w-full h-14 bg-white/10 backdrop-blur-md border border-white/25 text-white rounded-full text-sm font-bold shadow-xl uppercase tracking-wider">
                  Explore Vision
                </button>
              </Link>
            </div>

            {/* Stats Strip - Hidden on mobile */}
            <div className="sm:block hidden w-full px-4 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl mx-auto bg-[#022512] border border-white/10 rounded-3xl p-8 shadow-2xl">
                {[
                  { label: "Delegates", val: 1000, suffix: "+" },
                  { label: "Nations", val: 50, suffix: "+" },
                  { label: "Days", val: 9, suffix: " Days" },
                  { label: "Prize", val: 20, prefix: "$", suffix: "k" },
                ].map((stat, i) => (
                  <div key={i} className="text-center md:text-left">
                    <div className="text-2xl md:text-4xl font-black text-white">
                      <AnimatedNumber
                        end={stat.val}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-white/50 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-6 max-w-5xl mx-auto text-center">
        <TrophyIllustration className="w-20 md:w-24 h-auto mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
          Compete for Glory
        </h2>
        <p className="text-[#022512]/70 mb-12">
          Life-changing opportunities for Africa&apos;s brightest minds.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#C8A046] p-8 md:p-12 rounded-3xl shadow-xl">
            <h3 className="text-3xl font-black mb-2">$20,000 USD</h3>
            <p className="text-sm font-bold uppercase tracking-widest opacity-80">
              Total Prize Pool
            </p>
          </div>
          <div className="bg-[#1B5E3B] text-[#f6f0e1] p-8 md:p-12 rounded-3xl shadow-xl">
            <Globe className="w-10 h-10 mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-black mb-2">WUDC Sponsorship</h3>
            <p className="text-sm opacity-80">
              Represent Africa on the world stage.
            </p>
          </div>
        </div>
      </section>

      {/* ─── HOMECOMING (Responsive Split) ─── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              A Continental Homecoming of Thought
            </h2>
            <p className="text-lg opacity-80 leading-relaxed">
              PAUDC 2026 represents a revival of Africa&apos;s intellectual
              identity, where youth gather to define the civic fabric of the
              continent.
            </p>
            <Link to="/about">
              <Button className="bg-[#1B5E3B] text-white px-8 py-6 rounded-full font-bold">
                Discover Our Vision
              </Button>
            </Link>
          </div>
          <div className="lg:w-1/2 w-full">
            <img
              src={continent}
              alt="Vision"
              className="rounded-3xl shadow-2xl w-full h-64 md:h-[400px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* ─── PILLARS (Responsive Grid) ─── */}
      <section className="py-20 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-black mb-12">Event Pillars</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: <Trophy className="text-[#A4372C]" />,
              title: "Championship",
              desc: "British Parliamentary rounds testing reasoning.",
            },
            {
              icon: <MessageSquare className="text-[#C8A046]" />,
              title: "Public Speaking",
              desc: "Celebrating persuasion and leadership.",
            },
            {
              icon: <GraduationCap className="text-[#1B5E3B]" />,
              title: "Adjudicators",
              desc: "Certification for over 200 judges.",
            },
            {
              icon: <Mic className="text-[#A4372C]" />,
              title: "Civic Panels",
              desc: "Rethinking Pan-Africanism.",
            },
            {
              icon: <Lightbulb className="text-[#1B5E3B]" />,
              title: "Legacy Lab",
              desc: "Turning insights into actionable initiatives.",
            },
            {
              icon: <Palette className="text-[#C8A046]" />,
              title: "Exhibition",
              desc: "Celebrating artistic diversity.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-3xl shadow-lg hover:-translate-y-2 transition-transform"
            >
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-black/60">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── KAKAKI (Responsive Reverse Split) ─── */}
      <section className="bg-[#1B5E3B] text-[#F6F0E1] py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="lg:w-5/12 w-full">
            <img
              src={kakaki}
              alt="Kakaki"
              className="rounded-3xl shadow-2xl w-full h-[300px] md:h-[450px] object-cover"
            />
          </div>
          <div className="lg:w-7/12 space-y-6">
            <h2 className="text-3xl md:text-5xl font-black uppercase">
              The Kakaki: Our Symbol
            </h2>
            <p className="text-lg opacity-90 leading-relaxed">
              The long royal trumpet of Northern Nigeria, used to herald kings
              and summon communities. It carries grace and power.
            </p>
            <blockquote className="border-l-4 border-[#C8A046] pl-6 py-2 text-xl md:text-2xl font-serif italic text-[#C8A046]">
              "When the Kakaki sounds in Abuja, it will awaken a generation."
            </blockquote>
          </div>
        </div>
      </section>

      {/* ─── PARTNERS ─── */}
      <section className="py-20 text-center px-4">
        <h2 className="text-2xl font-black mb-8">Our Partners</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="flex items-center gap-3 font-bold text-base md:text-xl">
            <img src={vuef} className="w-8 h-8 object-contain" alt="Logo" />
            <span>Veritas University Endowment Fund</span>
          </div>
          <div className="flex items-center gap-3 font-bold text-base md:text-xl">
            <img src={vunalogo} className="w-8 h-8 object-contain" alt="Logo" />
            <span>Veritas University</span>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-white py-24 text-center px-6 border-t border-black/5">
        <h2 className="text-3xl md:text-5xl font-black mb-4">
          Join the Republic of Reason
        </h2>
        <p className="max-w-xl mx-auto opacity-70 mb-10 text-lg">
          Secure your place in history as we build Africa&apos;s future.
        </p>
        <Link to="/register">
          <button className="px-10 py-4 bg-[#C8A046] text-[#022512] rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
            Request an Invite
          </button>
        </Link>
      </section>

      <Footer />
    </div>
  );
}
