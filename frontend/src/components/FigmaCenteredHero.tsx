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

                {/* ── Logo (mobile only) ── */}
                <div className="mb-6 md:hidden">
                    <img src={emblemSrc} alt="PAUDC 2026 Logo" className="h-14 w-auto object-contain" />
                </div>

                {/* ── Meta pills — stack vertically on mobile ── */}
                <div className="mb-5 flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-3 py-1.5 w-fit">
                        <MapPin className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            Abuja, Nigeria
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-[#DAC2AE40] bg-white/70 px-3 py-1.5 w-fit">
                        <Calendar className="h-3 w-3 text-[#C8A046] shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#1A1C1A]">
                            December 5-12, 2026
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
                {/* Mobile: -8px letter-spacing | Desktop: -10px letter-spacing */}
                <h1
                    style={{
                        fontFamily: "'Anton', sans-serif",
                        lineHeight: 1,
                        fontWeight: 400,
                    }}
                    className="
                        text-left uppercase text-[#1A1C1A]
                        text-[clamp(5rem,22vw,180px)]
                        [letter-spacing:-8px]
                        md:[letter-spacing:-10px]
                        md:text-[clamp(6rem,18vw,180px)]
                        max-w-[820px]
                        mb-2
                    "
                >
                    PAUDC 2026
                </h1>

                {/* ── Tagline ── */}
                <p className="text-base text-[#544434B3] mb-6 md:mb-4">
                    The Sound of Africa&apos;s Resolve
                </p>

                {/* ── Countdown ── */}
                <div className="mb-8 flex items-end gap-6 md:gap-14">
                    {countdownItems.map((item) => (
                        <div key={item.label} className="flex flex-col items-start">
                            <span
                                style={{ fontFamily: "'Anton', sans-serif" }}
                                className="text-[2.6rem] leading-none text-[#1A1C1A] md:text-6xl"
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
                <p className="max-w-[260px] text-sm leading-relaxed text-[#1A1C1A60] mb-10">
                    The Pan-African University Debating Championship is the continent&apos;s premier intellectual arena.
                </p>

                {/* ── CTAs — stacked on mobile, inline on desktop ── */}
                <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-3">
                    <Link
                        to="/register"
                        className="rounded-full border border-[#1A1C1A] px-5 py-3 md:py-2 text-sm font-bold text-[#1A1C1A] transition-colors hover:bg-[#1A1C1A] hover:text-[#FAF9F6] text-center"
                    >
                        Request An Invite
                    </Link>
                    <Link
                        to="/about"
                        className="rounded-full bg-[#C8A046] px-5 py-3 md:py-2 text-sm font-bold text-[#3B2000] transition-colors hover:bg-[#B08C3E] text-center"
                    >
                        Explore Vision
                    </Link>
                </div>

            </div>
        </section>
    );
}