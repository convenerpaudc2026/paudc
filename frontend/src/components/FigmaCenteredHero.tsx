import { Building, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import patternImg from "@/assets/gold-pattern.png";
import { useEffect } from "react";

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

type FigmaCenteredHeroProps = {
    timeLeft: TimeLeft;
};

export default function FigmaCenteredHero({ timeLeft }: FigmaCenteredHeroProps) {

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Anton&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
    }, []);

    const countdownItems = [
        { label: "Days", value: timeLeft.days },
        { label: "Hours", value: timeLeft.hours },
        { label: "Minutes", value: timeLeft.minutes },
        { label: "Seconds", value: timeLeft.seconds },
    ];

    return (
        <section className="
            relative overflow-hidden bg-[#FAF9F6] w-full
            flex flex-col
            min-h-[100dvh]
            justify-center 
            items-center
        ">
            {/* Pattern background */}
            <div className="pointer-events-none absolute inset-y-0 -right-[7%] w-[80%] md:w-[45%] lg:w-[38%] opacity-[0.10]">
                <img
                    src={patternImg}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-right"
                />
            </div>

            {/* Soft ambient left glow */}
            <div className="pointer-events-none absolute left-[-140px] top-[28%] h-[360px] w-[360px] rounded-full bg-[#FFDCBD] mix-blend-multiply opacity-20 blur-[60px]" />

            {/* ── Main content (Strictly left-aligned) ── */}
            <div className="
                relative z-10 w-full max-w-7xl mx-auto flex flex-col
                px-6 md:px-10 lg:px-14 py-12
                items-start text-left
            ">

                {/* ── Meta info: Mobile (Bare text) ── */}
                <div className="mb-6 flex md:hidden flex-row items-center justify-start gap-2 w-full">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5 text-[#C8A046] shrink-0" />
                        <span className="text-[7px] font-semibold uppercase tracking-[0.1px] text-[#1A1C1A]">
                            December 5-13, 2026
                        </span>
                    </div>
                    <span className="text-[7px] text-[#1A1C1A]/40">•</span>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-2.5 w-2.5 text-[#C8A046] shrink-0" />
                        <span className="text-[7px] font-semibold uppercase tracking-[0.1px] text-[#1A1C1A]">
                            Abuja, Nigeria
                        </span>
                    </div>
                    <span className="text-[7px] text-[#1A1C1A]/40">•</span>
                    <div className="flex items-center gap-1">
                        <Building className="h-2.5 w-2.5 text-[#C8A046] shrink-0" />
                        <span className="text-[7px] font-semibold uppercase tracking-[0.1px] text-[#1A1C1A]">
                            Veritas University
                        </span>
                    </div>
                </div>

                {/* ── Meta info: Desktop Pills ── */}
                <div className="mb-6 hidden md:flex flex-wrap items-center justify-start gap-3 w-full">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-4 py-2">
                        <Calendar className="h-3.5 w-3.5 text-[#C8A046] shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            December 5-13, 2026
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-4 py-2">
                        <MapPin className="h-3.5 w-3.5 text-[#C8A046] shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            Abuja, Nigeria
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-4 py-2">
                        <Building className="h-3.5 w-3.5 text-[#C8A046] shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            Hosted by Veritas University
                        </span>
                    </div>
                </div>

                {/* ── Giant title ── */}
                <h1
                    style={{ fontFamily: "'Anton', sans-serif", lineHeight: 1 }}
                    className="
                        uppercase text-[#1A1C1A] font-normal
                        text-[clamp(5.5rem,18vw,180px)]
                        tracking-[-0.04em] md:tracking-[-0.06em]
                        mb-4 w-full
                    "
                >
                    PAUDC 2026
                </h1>

                {/* ── Desktop: Tagline + Buttons ── */}
                <div className="hidden md:flex flex-row items-center justify-start w-full mb-10 gap-8">
                    <p className="text-[22px] text-[#544434B3] shrink-0">
                        The Sound of Africa&apos;s Resolve
                    </p>
                    <div className="flex flex-row items-center gap-4">
                        <Link
                            to="/invite"
                            className="rounded-full border border-[#C8A046] px-6 py-2 text-sm font-bold text-[#544434] transition-colors hover:bg-[#C8A046] hover:text-[#FAF9F6] text-center"
                        >
                            Request An Invite
                        </Link>
                        <Link
                            to="/about"
                            className="rounded-full bg-[#C8A046] px-6 py-2 text-sm font-bold text-[#3B2000] transition-colors hover:bg-[#B08C3E] text-center"
                        >
                            Explore Vision
                        </Link>
                    </div>
                </div>

                {/* ── Mobile: Tagline Only ── */}
                <p className="md:hidden text-lg text-[#544434B3] mb-8 w-full text-left">
                    The Sound of Africa&apos;s Resolve
                </p>

                {/* ── Countdown ── */}
                <div className="mb-10 flex items-end justify-start gap-6 md:gap-12 w-full">
                    {countdownItems.map((item) => (
                        <div key={item.label} className="flex flex-col items-start">
                            <span
                                style={{ fontFamily: "'Anton', sans-serif" }}
                                className={`text-4xl md:text-6xl leading-none ${item.label === 'Seconds' ? 'text-[#1B5E3B] md:text-[#1A1C1A]' : 'text-[#1A1C1A]'}`}
                            >
                                {String(item.value).padStart(2, "0")}
                            </span>
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#54443480] md:text-[11px]">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Description ── */}
                <p className="max-w-[280px] md:max-w-[450px] text-sm md:text-base leading-relaxed text-[#1A1C1A60] mb-8 w-full text-left">
                    The Pan-African University Debating Championship is the continent&apos;s premier intellectual arena.
                </p>

                {/* ── Mobile: Buttons (Stacked at bottom) ── */}
                <div className="flex md:hidden flex-col items-start gap-4 w-full">
                    <Link
                        to="/invite"
                        className="w-[220px] rounded-full border border-[#C8A046] px-6 py-3.5 text-sm font-bold text-[#544434] transition-colors hover:bg-[#C8A046] hover:text-[#FAF9F6] text-center"
                    >
                        Request An Invite
                    </Link>
                    <Link
                        to="/about"
                        className="w-[180px] rounded-full bg-[#C8A046] px-2 py-3.5 text-sm font-bold text-[#3B2000] transition-colors hover:bg-[#B08C3E] text-center"
                    >
                        Explore Vision
                    </Link>
                </div>

            </div>
        </section>
    );
}