import { Link } from 'react-router-dom';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                            <img
                                src="https://app.codigma.io/api/uploads/2026/03/11/asset-74a2489a-0372-424b-ad0d-8c870eb566e4.png"
                                alt="PAUDC 2026 Logo"
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <div className="text-lg font-bold text-white">PAUDC 2026</div>
                        <div className="text-sm text-gray-400">Veritas University</div>
                        <p className="text-sm text-gray-400 mt-4">
                            The Republic of Reason: Building Africa's Future Through Debate
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/about" className="text-sm hover:text-[#C84B46] transition-colors">
                                    About PAUDC
                                </Link>
                            </li>
                            <li>
                                <Link to="/schedule" className="text-sm hover:text-[#C84B46] transition-colors">
                                    Event Schedule
                                </Link>
                            </li>
                            {/* <li>
                                <Link to="/resources" className="text-sm hover:text-[#C84B46] transition-colors">
                                    Resources
                                </Link>
                            </li> */}
                            <li>
                                <Link to="/faq" className="text-sm hover:text-[#C84B46] transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center space-x-2 text-sm">
                                <Mail className="h-4 w-4" />
                                <span>paudc2026@veritas.edu.ng</span>
                            </li>
                            <li className="flex items-center space-x-2 text-sm">
                                <Phone className="h-4 w-4" />
                                <span>+234 901 199 6325</span>
                            </li>
                            <li className="flex items-start space-x-2 text-sm">
                                <MapPin className="h-4 w-4 mt-1" />
                                <span>Veritas University, Bwari, Abuja, Nigeria</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white text-sm font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="https://www.facebook.com/people/Abuja-PAUDC-2026/61587158114165/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C84B46] transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="https://www.instagram.com/abujapaudc/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C84B46] transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                </div>

                <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                    <p className="text-sm text-gray-400">
                        © 2026 PAUDC. Hosted by Veritas University, Abuja. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}