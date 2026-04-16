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
    emblemSrc: string;
};

export default function FigmaCenteredHero({ timeLeft, emblemSrc }: FigmaCenteredHeroProps) {

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
        <section className="relative min-h-screen overflow-hidden bg-[#FAF9F6]">

            {/* Pattern background */}
            <div className="pointer-events-none absolute inset-y-0 -right-[7%] w-[65%] md:w-[38%] opacity-[0.10]">
                <img
                    src={patternImg}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover object-right"
                />
            </div>

            {/* Soft ambient left glow */}
            <div className="pointer-events-none absolute left-[-140px] top-[28%] h-[360px] w-[360px] rounded-full bg-[rgba(255,220,189,0.22)] blur-[60px]" />

            {/* ── Main content ── */}
            <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col px-5 md:px-10 lg:px-14 pt-24 pb-20">

                {/* ── Meta info — bare text on mobile, pills on desktop ── */}
                {/* Mobile: bare text */}
                <div className="mb-5 flex md:hidden flex-row flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.2px] text-[#1A1C1A]">
                            December 5-12, 2026
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.2px] text-[#1A1C1A]">
                            Abuja, Nigeria
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Building className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[8px] font-semibold uppercase tracking-[0.2px] text-[#1A1C1A]">
                            Hosted by Veritas University
                        </span>
                    </div>
                </div>

                {/* Desktop: pills */}
                <div className="mb-5 hidden md:flex flex-row flex-wrap items-center gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-3 py-1.5 w-fit">
                        <Calendar className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            December 5-12, 2026
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-3 py-1.5 w-fit">
                        <MapPin className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            Abuja, Nigeria
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-3 py-1.5 w-fit">
                        <Building className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            Hosted by Veritas University
                        </span>
                    </div>
                </div>

                {/* ── Giant title ── */}
                <h1
                    style={{
                        fontFamily: "'Anton', sans-serif",
                        lineHeight: 1,
                        fontWeight: 400,
                    }}
                    className="
                        text-left uppercase text-[#1A1C1A]
                        text-[clamp(6rem,25vw,180px)]
                        [letter-spacing:-5px]
                        md:[letter-spacing:-10px]
                        md:text-[clamp(6rem,18vw,180px)]
                        max-w-[820px]
                        mb-2
                    "
                >
                    PAUDC 2026
                </h1>

                {/* ── Desktop: Tagline + CTAs horizontally aligned ── */}
                <div className="hidden md:flex flex-row md:items-center justify-between w-full max-w-[730px] mb-10">
                    <p className="text-xl md:text-[22px] text-[#544434B3] shrink-0">
                        The Sound of Africa&apos;s Resolve
                    </p>
                    <div className="flex flex-row items-center gap-4">
                        <Link
                            to="/register"
                            className="md:w-auto rounded-full border border-[#C8A046] px-6 py-2 text-sm font-bold text-[#544434] transition-colors hover:bg-[#C8A046] hover:text-[#FAF9F6] text-center"
                        >
                            Request An Invite
                        </Link>
                        <Link
                            to="/about"
                            className="md:w-auto rounded-full bg-[#C8A046] px-6 py-2 text-sm font-bold text-[#3B2000] transition-colors hover:bg-[#B08C3E] text-center"
                        >
                            Explore Vision
                        </Link>
                    </div>
                </div>

                {/* ── Mobile: Tagline only ── */}
                <p className="md:hidden text-base text-[#544434B3] mb-4">
                    The Sound of Africa&apos;s Resolve
                </p>

                <div className="mb-8 flex items-end gap-6 md:gap-14">
                    {countdownItems.map((item) => (
                        <div key={item.label} className="flex flex-col items-start">
                            <span
                                style={{ fontFamily: "'Anton', sans-serif" }}
                                className={`text-[2.6rem] leading-none md:text-6xl ${item.label === 'Seconds' ? 'text-[#1B5E3B] md:text-[#1A1C1A]' : 'text-[#1A1C1A]'}`}
                            >
                                {String(item.value).padStart(2, "0")}
                            </span>
                            <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#54443480] md:text-[10px]">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Description ── */}
                <p className="max-w-[260px] text-sm leading-relaxed text-[#1A1C1A60] mb-6">
                    The Pan-African University Debating Championship is the continent&apos;s premier intellectual arena.
                </p>

                {/* ── Mobile: Buttons after description ── */}
                <div className="md:hidden flex flex-col items-start gap-4">
                    <Link
                        to="/register"
                        className="w-[200px] rounded-full border border-[#C8A046] px-6 py-3 text-sm font-bold text-[#544434] transition-colors hover:bg-[#C8A046] hover:text-[#FAF9F6] text-center"
                    >
                        Request An Invite
                    </Link>
                    <Link
                        to="/about"
                        className="w-fit rounded-full bg-[#C8A046] px-12 py-3 text-sm font-bold text-[#3B2000] transition-colors hover:bg-[#B08C3E] text-center"
                    >
                        Explore Vision
                    </Link>
                </div>

            </div>
        </section>
    );
}