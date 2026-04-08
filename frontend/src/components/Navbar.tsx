import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import LOGO_URL from '../assets/paudc.png';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const links = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Team', path: '/team' },
        { name: 'Schedule', path: '/schedule' },
        { name: 'Civic Panel', path: '/speakers' },
        { name: 'FAQ', path: '/faq' },
        { name: "Contact", path: "/contact" },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav className="bg-[#F6F0E1] border-b border-[#022512]/10 fixed w-full z-50 top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <img
                            src={LOGO_URL}
                            alt="PAUDC 2026 Logo"
                            className="h-16 w-auto object-contain"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm transition-colors hover:text-[#1B5E3B] ${isActive(link.path) ? 'text-[#A4372C] font-bold' : 'text-[#022512] font-semibold'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <a href="/login">
                            <Button className="bg-[#F6F0E1] border-[0.5px] border-[#022512] text-[#022512] hover:bg-[#022512] hover:text-[#F6F0E1] transition-colors duration-300 font-bold shadow-sm rounded-xl px-6">
                                LMS Portal
                            </Button>
                        </a>

                        <a href="/register">
                            <Button className="bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-sm rounded-xl px-6">
                                Request an invite
                            </Button>
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
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
                <div className="md:hidden bg-[#F6F0E1] border-t border-[#022512]/10 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
                    <div className="flex flex-col space-y-3">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-3 py-2 rounded-md text-base transition-colors ${isActive(link.path)
                                    ? 'text-[#A4372C] bg-white/50 font-bold'
                                    : 'text-[#022512] font-semibold hover:text-[#1B5E3B] hover:bg-white/50'
                                    }`}
                                onClick={() => setIsOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2 px-3">
                            <a href="/login" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-[#F6F0E1] border-[0.5px] border-[#022512] text-[#022512] hover:bg-[#022512] hover:text-[#F6F0E1] transition-colors duration-300 font-bold shadow-sm rounded-xl mb-2">
                                    LMS Portal
                                </Button>
                            </a>
                            <a href="/register" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-[#C8A046] hover:bg-[#b08c3e] text-[#022512] font-bold shadow-sm rounded-xl">
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
