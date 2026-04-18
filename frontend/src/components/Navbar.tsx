import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import LOGO_URL from '../assets/paudc.png';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Determine if we've scrolled past the top
            setIsScrolled(currentScrollY > 20);

            // Hide navbar when scrolling down (past 100px), show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
                setIsOpen(false); // Close mobile menu if open while scrolling down
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const links = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Team', path: '/team' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Civic Panel', path: '/speakers' },
        { name: 'FAQ', path: '/faq' },
        { name: "Contact", path: "/contact" },
    ];

    const isActive = (path: string): boolean => location.pathname === path;
    const isDashboard = location.pathname === '/';

    // Navbar becomes solid white if: not on dashboard, scrolled down, or mobile menu is open
    const isSolidBackground = !isDashboard || isScrolled || isOpen;

    return (
        <nav
            className={`
                w-full fixed z-50 top-0 left-0 transition-all duration-300 ease-in-out
                ${isVisible ? 'translate-y-0' : '-translate-y-full'}
                ${isSolidBackground ? 'bg-white shadow-md py-0' : 'bg-transparent py-2 md:py-4'}
            `}
        >
            <div className="max-w-7xl mx-auto px-5 md:px-10 lg:px-14">
                <div className="flex justify-between items-center h-16">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex items-center shrink-0 z-50" onClick={() => setIsOpen(false)}>
                        <img
                            src={LOGO_URL}
                            alt="PAUDC 2026 Logo"
                            className="h-12 md:h-14 lg:h-16 w-auto object-contain transition-all duration-300"
                        />
                    </Link>

                    {/* ── Desktop Navigation ── */}
                    <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
                        <div className="flex space-x-4 xl:space-x-8 mr-2 xl:mr-4">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-[13px] xl:text-sm transition-colors duration-200 whitespace-nowrap ${isActive(link.path)
                                            ? 'text-[#022512] font-bold'
                                            : 'text-[#022512]/60 font-medium hover:text-[#022512]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center space-x-3 xl:space-x-4 shrink-0">
                            <a href="/lms">
                                <Button className="bg-transparent border border-[#022512]/20 text-[#022512] hover:bg-[#022512] hover:text-white transition-colors duration-300 font-semibold shadow-none rounded-full px-4 xl:px-5 h-9 text-xs xl:text-sm">
                                    LMS Portal
                                </Button>
                            </a>
                            <a href="/invite">
                                <Button className="bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-none rounded-full px-4 xl:px-5 h-9 text-xs xl:text-sm">
                                    Request an invite
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* ── Mobile Menu Toggle Button ── */}
                    <div className="lg:hidden flex items-center z-50">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 -mr-2 text-[#022512] hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile Navigation Dropdown ── */}
            <div
                className={`
                    lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out origin-top
                    ${isOpen ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'}
                `}
            >
                <div className="px-6 py-6 space-y-2">
                    <div className="flex flex-col space-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block text-base transition-colors ${isActive(link.path)
                                        ? 'text-[#022512] font-bold'
                                        : 'text-[#022512]/70 font-medium hover:text-[#022512]'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="pt-6 mt-2 border-t border-gray-100 flex flex-col space-y-3">
                            <a href="/lms" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-transparent border border-[#022512]/20 text-[#022512] hover:bg-[#022512] hover:text-white transition-colors duration-300 font-semibold shadow-none rounded-full h-12">
                                    LMS Portal
                                </Button>
                            </a>
                            <a href="/invite" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-none rounded-full h-12">
                                    Request an Invite
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}