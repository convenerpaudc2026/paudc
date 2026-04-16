import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import LOGO_URL from '../assets/paudc.png';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide navbar when scrolling down, show when scrolling up
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Leaving the contents exactly as requested
    const links: Array<{ name: string; path: string }> = [
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

    return (
        // Transparent background only on dashboard, hide on scroll
        <nav className={`w-full fixed z-50 top-0 transition-all duration-300 ${isDashboard ? 'bg-transparent' : 'bg-white'} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
                {/* Reduced vertical space from h-24 to h-16 */}
                <div className="flex justify-between items-center h-16">

                    {/* Logo - Left aligned like the design, scaled down slightly to fit */}
                    <Link to="/" className="flex items-center">
                        <img
                            src={LOGO_URL}
                            alt="PAUDC 2026 Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation - Spaced out and typography softened to match design */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <div className="flex space-x-8 mr-4">
                            {links.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm transition-colors duration-200 ${isActive(link.path)
                                        ? 'text-[#022512] font-bold'
                                        : 'text-[#022512]/60 font-medium hover:text-[#022512]'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Existing Buttons retained, height adjusted to h-9 for slimmer navbar */}
                        <div className="flex items-center space-x-4">
                            <a href="/lms">
                                <Button className="bg-transparent border border-[#022512]/20 text-[#022512] hover:bg-[#022512] hover:text-white transition-colors duration-300 font-semibold shadow-none rounded-full px-5 h-9 text-sm">
                                    LMS Portal
                                </Button>
                            </a>

                            <a href="/register">
                                <Button className="bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-none rounded-full px-5 h-9 text-sm">
                                    Request an invite
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[#022512] hover:text-[#1B5E3B] focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                // Changed mobile menu background to white
                <div className="lg:hidden bg-white px-6 pt-4 pb-8 space-y-2 shadow-xl absolute w-full border-t border-[#022512]/5">
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
                        <div className="pt-4 flex flex-col space-y-3">
                            <a href="/lms" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-transparent border border-[#022512]/20 text-[#022512] hover:bg-[#022512] hover:text-white transition-colors duration-300 font-semibold shadow-none rounded-full h-11">
                                    LMS Portal
                                </Button>
                            </a>
                            <a href="/register" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-none rounded-full h-11">
                                    Request an Invite
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}