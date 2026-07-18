import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    Heart,
    Landmark,
    Copy,
    Check,
    Globe2,
    GraduationCap,
    Plane,
    Lightbulb,
    Trophy,
    ShieldCheck,
    Mail,
} from 'lucide-react';

// ── Beneficiary details ──────────────────────────────────────────────
// NOTE: Confirm the beneficiary name with the secretariat before launch.
const BENEFICIARY_NAME = 'Veritas University Endowment Foundation';
const BANK_NAME = 'Stanbic IBTC Bank PLC';
const BANK_SWIFT = 'SBICNGLX';

const ACCOUNTS = [
    { currency: 'NGN', label: 'Nigerian Naira', symbol: '₦', number: '0050660727' },
    { currency: 'USD', label: 'US Dollar', symbol: '$', number: '0050660765' },
    { currency: 'GBP', label: 'Pound Sterling', symbol: '£', number: '0050660734' },
    { currency: 'EUR', label: 'Euro', symbol: '€', number: '0050660741' },
] as const;

// Correspondent routing for inward USD wires
const USD_WIRE = [
    { label: 'Correspondent Bank', value: 'Citibank N.A., 111 Wall Street, New York' },
    { label: 'Correspondent SWIFT', value: 'CITIUS33', mono: true },
    { label: 'ABA / Routing Number', value: '021000089', mono: true },
    { label: 'Correspondent Account No.', value: '36127476', mono: true },
] as const;

const IMPACT = [
    {
        icon: GraduationCap,
        title: 'Delegate Scholarships',
        body: 'Cover registration for talented debaters whose universities cannot fund their participation.',
    },
    {
        icon: Plane,
        title: 'Travel Bursaries',
        body: 'Help teams from across the continent reach Abuja — flights, visas, and ground transport.',
    },
    {
        icon: Lightbulb,
        title: 'The Legacy Lab',
        body: 'Fund the civic innovation programme that turns debate motions into real community projects.',
    },
    {
        icon: Trophy,
        title: 'Tournament Operations',
        body: 'Support adjudication, venues, and the $20,000 prize pool that rewards Africa’s finest speakers.',
    },
] as const;

const STEPS = [
    {
        title: 'Choose your currency',
        body: 'Pick the account that matches your currency — NGN, USD, GBP, or EUR — to avoid conversion fees.',
    },
    {
        title: 'Make the transfer',
        body: 'Use the account details below. For USD wires from outside Nigeria, include the correspondent bank routing.',
    },
    {
        title: 'Tell us it’s coming',
        body: 'Email your name and reference so we can acknowledge your gift and issue a receipt.',
    },
] as const;

/** Formats 0050660727 as 0050 660 727 for readability. */
function formatAccount(value: string): string {
    return `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}`;
}

export default function Donate() {
    const { toast } = useToast();
    const [copied, setCopied] = useState<string | null>(null);

    const handleCopy = async (value: string, label: string) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(value);
            window.setTimeout(() => setCopied((current) => (current === value ? null : current)), 2000);
            toast({ title: 'Copied to clipboard', description: `${label} — ${value}` });
        } catch {
            toast({
                variant: 'destructive',
                title: "Couldn't copy automatically",
                description: 'Please select and copy the details manually.',
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F0E1] text-[#1B5E3B] relative overflow-hidden">
            <SEO
                title="Donate"
                description="Support PAUDC 2026. Your donation funds delegate scholarships, travel bursaries, and the Legacy Lab for Africa's brightest student debaters. Give in NGN, USD, GBP, or EUR."
                canonical="https://www.paudc2026.com/donate"
            />
            <Navbar />

            {/* Decorative Blur Blobs */}
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
                <div className="absolute top-[10%] -right-32 w-[500px] h-[500px] rounded-full bg-[#C8A046] opacity-30 blur-[120px]" />
                <div className="absolute top-[55%] -left-32 w-[600px] h-[600px] rounded-full bg-[#1B5E3B] opacity-20 blur-[150px]" />
            </div>

            {/* ── Hero ── */}
            <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-[#1B5E3B] border-b-4 border-[#C8A046] relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#F6F0E1]">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C8A046]/20 border border-[#C8A046]/40 text-[#F6F0E1] text-xs md:text-sm font-semibold tracking-wide uppercase mb-6">
                        <Heart className="w-4 h-4" /> Support the Championship
                    </span>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 drop-shadow-sm">
                        Join Us in Shaping Tomorrow&apos;s Leaders
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-[#F6F0E1]/90 max-w-3xl mx-auto font-medium">
                        Every gift, no matter the size, sends another young African to the continent&apos;s
                        most prestigious arena for debate and dialogue.
                    </p>
                </div>
            </section>

            {/* ── Why your support matters ── */}
            <section className="py-12 md:py-24 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-14">
                        <Heart className="w-8 h-8 md:w-10 md:h-10 text-[#A4372C]" />
                        <h2 className="text-2xl md:text-4xl font-bold text-[#1B5E3B]">
                            Why Your Support Matters
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {IMPACT.map((item, index) => (
                            <Card
                                key={item.title}
                                className="relative border border-[#1B5E3B]/15 shadow-lg bg-white/80 backdrop-blur-sm hover:border-[#C8A046] hover:-translate-y-1 transition-all"
                            >
                                <CardContent className="p-6 md:p-7">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="p-3 bg-[#1B5E3B]/10 rounded-xl">
                                            <item.icon className="w-6 h-6 md:w-7 md:h-7 text-[#1B5E3B]" />
                                        </div>
                                        <span className="text-4xl font-black text-[#C8A046]/30 leading-none">
                                            {index + 1}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-[#1B5E3B] mb-2">{item.title}</h3>
                                    <p className="text-sm text-[#1B5E3B]/70 leading-relaxed">{item.body}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Account details ── */}
            <section className="py-16 md:py-24 bg-white relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 md:mb-14">
                        <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
                            <Landmark className="w-8 h-8 md:w-10 md:h-10 text-[#C8A046]" />
                            <h2 className="text-2xl md:text-4xl font-black text-[#1B5E3B]">Account Details</h2>
                        </div>
                        <p className="text-base md:text-lg text-[#1B5E3B]/70 max-w-2xl mx-auto">
                            All accounts are held with {BANK_NAME}. Choose the currency you wish to give in.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {ACCOUNTS.map((account) => {
                            const isCopied = copied === account.number;
                            return (
                                <Card
                                    key={account.currency}
                                    className="border border-[#1B5E3B]/10 shadow-xl rounded-2xl overflow-hidden hover:border-[#C8A046] transition-colors"
                                >
                                    <CardContent className="p-0">
                                        {/* Currency header */}
                                        <div className="flex items-center justify-between bg-[#1B5E3B] px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8A046] text-lg font-black text-[#022512]">
                                                    {account.symbol}
                                                </span>
                                                <div className="text-left">
                                                    <p className="text-lg font-black tracking-wide text-[#F6F0E1]">
                                                        {account.currency}
                                                    </p>
                                                    <p className="text-xs text-[#F6F0E1]/70">{account.label}</p>
                                                </div>
                                            </div>
                                            <Landmark className="w-5 h-5 text-[#C8A046]" />
                                        </div>

                                        {/* Body */}
                                        <div className="p-6 space-y-4">
                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                                    Bank
                                                </p>
                                                <p className="text-sm md:text-base font-bold text-[#1B5E3B]">
                                                    {BANK_NAME}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                                    Account Number
                                                </p>
                                                <div className="flex items-center justify-between gap-3 rounded-xl bg-[#F6F0E1]/70 border border-[#1B5E3B]/10 px-4 py-3">
                                                    <span className="font-mono text-lg md:text-xl font-bold tracking-wider text-[#1B5E3B]">
                                                        {formatAccount(account.number)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() =>
                                                            handleCopy(account.number, `${account.currency} account`)
                                                        }
                                                        aria-label={`Copy ${account.currency} account number`}
                                                        className="h-9 px-3 shrink-0 text-[#1B5E3B] hover:bg-[#1B5E3B] hover:text-[#F6F0E1] rounded-lg"
                                                    >
                                                        {isCopied ? (
                                                            <Check className="w-4 h-4" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                        <span className="ml-2 text-xs font-bold">
                                                            {isCopied ? 'Copied' : 'Copy'}
                                                        </span>
                                                    </Button>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                                    Account Name
                                                </p>
                                                <p className="text-sm md:text-base text-[#1B5E3B]/80">
                                                    {BENEFICIARY_NAME}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* ── International USD wire ── */}
                    <Card className="mt-8 md:mt-10 border border-[#C8A046]/40 shadow-xl rounded-2xl overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 bg-[#C8A046] px-6 py-4">
                                <Globe2 className="w-5 h-5 text-[#022512] shrink-0" />
                                <h3 className="text-base md:text-lg font-black uppercase tracking-wide text-[#022512]">
                                    Inward Remittance for USD Payments
                                </h3>
                            </div>

                            <div className="p-6 md:p-8">
                                <p className="text-sm md:text-base text-[#1B5E3B]/70 mb-6">
                                    Sending USD from outside Nigeria? Give your bank the routing details below
                                    <span className="font-semibold text-[#1B5E3B]">
                                        {' '}
                                        in addition to the USD account
                                    </span>{' '}
                                    above.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                            Beneficiary Bank
                                        </p>
                                        <p className="text-sm md:text-base font-bold text-[#1B5E3B]">{BANK_NAME}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                            Beneficiary SWIFT Code
                                        </p>
                                        <p className="font-mono text-sm md:text-base font-bold tracking-wider text-[#1B5E3B]">
                                            {BANK_SWIFT}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                            Beneficiary Account Name
                                        </p>
                                        <p className="text-sm md:text-base text-[#1B5E3B]/80">{BENEFICIARY_NAME}</p>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                            Beneficiary Account Number (USD)
                                        </p>
                                        <p className="font-mono text-sm md:text-base font-bold tracking-wider text-[#1B5E3B]">
                                            {formatAccount('0050660765')}
                                        </p>
                                    </div>

                                    <div className="md:col-span-2 border-t border-[#1B5E3B]/10 pt-5">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#C8A046] mb-4">
                                            Correspondent Bank Routing
                                        </p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                                            {USD_WIRE.map((row) => (
                                                <div key={row.label}>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1B5E3B]/50 mb-1">
                                                        {row.label}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className={`text-sm md:text-base text-[#1B5E3B] ${
                                                                'mono' in row && row.mono
                                                                    ? 'font-mono font-bold tracking-wider'
                                                                    : 'text-[#1B5E3B]/80'
                                                            }`}
                                                        >
                                                            {row.value}
                                                        </p>
                                                        {'mono' in row && row.mono && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopy(row.value, row.label)}
                                                                aria-label={`Copy ${row.label}`}
                                                                className="text-[#1B5E3B]/40 hover:text-[#C8A046] transition-colors"
                                                            >
                                                                {copied === row.value ? (
                                                                    <Check className="w-3.5 h-3.5" />
                                                                ) : (
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* ── How to donate ── */}
            <section className="py-16 md:py-24 relative z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-[#1B5E3B] mb-6">How to Donate</h2>
                            <ol className="space-y-6">
                                {STEPS.map((step, index) => (
                                    <li key={step.title} className="flex gap-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B5E3B] text-sm font-black text-[#F6F0E1]">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-base md:text-lg font-bold text-[#1B5E3B] mb-1">
                                                {step.title}
                                            </p>
                                            <p className="text-sm md:text-base text-[#1B5E3B]/70 leading-relaxed">
                                                {step.body}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <Card className="border border-[#A4372C]/25 shadow-lg bg-[#A4372C]/[0.04]">
                            <CardContent className="p-6 md:p-8">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-[#A4372C]/10 rounded-lg shrink-0">
                                        <ShieldCheck className="w-6 h-6 text-[#A4372C]" />
                                    </div>
                                    <div className="space-y-3 text-sm md:text-base text-[#1B5E3B]/80">
                                        <p className="font-bold text-[#A4372C] text-base md:text-lg">
                                            Before you transfer
                                        </p>
                                        <ul className="space-y-2 list-disc list-inside marker:text-[#C8A046]">
                                            <li>
                                                Confirm the account number matches the currency you are sending —
                                                mismatched transfers may be returned by the bank.
                                            </li>
                                            <li>
                                                Use <strong>PAUDC 2026</strong> as your transfer reference or
                                                narration so we can identify your gift.
                                            </li>
                                            <li>
                                                PAUDC 2026 will never ask you to send funds to a personal account.
                                                These are the only official accounts.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* ── Closing CTA ── */}
            <section className="pb-20 md:pb-28 relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="border border-[#1B5E3B]/10 shadow-2xl rounded-3xl overflow-hidden bg-[#1B5E3B]">
                        <CardContent className="p-8 md:p-12 text-center text-[#F6F0E1]">
                            <h2 className="text-2xl md:text-3xl font-black mb-3">
                                Every gift, no matter the size, makes a difference.
                            </h2>
                            <p className="text-base md:text-lg text-[#F6F0E1]/80 mb-8 max-w-2xl mx-auto">
                                Have questions about giving, corporate sponsorship, or receipts? Our secretariat
                                is happy to help.
                            </p>
                            <Link to="/contact">
                                <Button className="h-14 px-10 bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] text-lg font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                                    <Mail className="w-5 h-5 mr-2" /> Contact the Secretariat
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <Footer />
        </div>
    );
}
