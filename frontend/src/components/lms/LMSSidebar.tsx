import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, BookOpen,
    LogOut, ChevronRight, Menu, X, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import LOGO_URL from '@/assets/paudc.png';

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/lms/courses' },
];

const ADMIN_NAV_ITEM = { icon: ShieldCheck, label: 'Admin', path: '/lms/admin' };

function SidebarContent({ onClose }: { onClose?: () => void }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <div className="flex flex-col h-full bg-[#022512] text-[#F6F0E1]">
            {/* Logo */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <img src={LOGO_URL} alt="PAUDC" className="h-9 w-auto object-contain" />
                    <div>
                        <p className="font-black text-sm leading-tight">PAUDC 2026</p>
                        <p className="text-xs text-[#C8A046] font-semibold">LMS Portal</p>
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 md:hidden">
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                    ? 'bg-[#1B5E3B] text-[#F6F0E1]'
                                    : 'text-[#F6F0E1]/65 hover:bg-white/8 hover:text-[#F6F0E1]'
                                }`}
                        >
                            <Icon className="w-[18px] h-[18px] shrink-0" />
                            {label}
                            {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                        </Link>
                    );
                })}

                {user?.role === 'admin' && (() => {
                    const { icon: Icon, label, path } = ADMIN_NAV_ITEM;
                    const active = location.pathname === path || location.pathname.startsWith(path + '/');
                    return (
                        <Link
                            key={path}
                            to={path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                                ? 'bg-[#C8A046] text-[#022512]'
                                : 'text-[#C8A046]/85 hover:bg-[#C8A046]/15 hover:text-[#C8A046]'
                                }`}
                        >
                            <Icon className="w-[18px] h-[18px] shrink-0" />
                            {label}
                            {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                        </Link>
                    );
                })()}
            </nav>

            {/* User + Logout */}
            <div className="px-3 pb-4 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                    <div className="w-8 h-8 rounded-full bg-[#C8A046] flex items-center justify-center text-[#022512] font-black text-xs shrink-0">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-tight">
                            {user?.name || 'Participant'}
                        </p>
                        <p className="text-xs text-[#C8A046] capitalize">{user?.role || 'user'}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#F6F0E1]/60 hover:bg-white/8 hover:text-[#F6F0E1] transition-all"
                >
                    <LogOut className="w-[18px] h-[18px] shrink-0" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

export default function LMSSidebar() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="hidden md:flex flex-col w-60 min-h-screen shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#022512] flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <img src={LOGO_URL} alt="PAUDC" className="h-8 w-auto" />
                    <span className="text-[#F6F0E1] font-black text-sm">LMS Portal</span>
                </div>
                <button
                    onClick={() => setOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/10 text-[#F6F0E1]"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile drawer */}
            {open && (
                <div className="md:hidden fixed inset-0 z-50 flex">
                    <div className="w-64 h-full">
                        <SidebarContent onClose={() => setOpen(false)} />
                    </div>
                    {/* Backdrop */}
                    <div
                        className="flex-1 bg-black/50"
                        onClick={() => setOpen(false)}
                    />
                </div>
            )}
        </>
    );
}
