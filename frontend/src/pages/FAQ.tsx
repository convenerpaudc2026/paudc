import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function FAQ() {
    const allFaqs = [
        {
            id: 1,
            category: 'general',
            question: 'What is PAUDC 2026?',
            answer: 'The Pan-African Universities Debate Championship (PAUDC) 2026 is Africa\'s most prestigious debate tournament, bringing together students from across the continent.',
            is_published: true,
            order_index: 1,
        },
        {
            id: 2,
            category: 'general',
            question: 'What is the British Parliamentary format?',
            answer: 'British Parliamentary (BP) is a debate format with four teams of two speakers each. Teams are divided into Opening Government, Opening Opposition, Closing Government, and Closing Opposition.',
            is_published: true,
            order_index: 2,
        },
        {
            id: 3,
            category: 'general',
            question: 'How much does registration cost?',
            answer: 'Registration is $200 USD per speaker and judge. For observers and staff attaches, the cost is $350 USD. These fees cover all tournament activities, accommodation, and meals.',
            is_published: true,
            order_index: 3,
        },
        {
            id: 4,
            category: 'general',
            question: 'Can I participate as a judge?',
            answer: 'Yes! We welcome experienced adjudicators and are training new judges. You can select the "Adjudicator" role during registration.',
            is_published: true,
            order_index: 4,
        },
        {
            id: 5,
            category: 'logistics',
            question: 'Where will PAUDC 2026 take place?',
            answer: 'The championship will be hosted at Veritas University in Abuja, Nigeria.',
            is_published: true,
            order_index: 5,
        },
        {
            id: 6,
            category: 'general',
            question: 'What is the Legacy Lab?',
            answer: 'The Legacy Lab is a youth-led innovation space that transforms debate ideas into actionable projects.',
            is_published: true,
            order_index: 6,
        },
        {
            id: 7,
            category: 'participation',
            question: 'What is the tournament structure?',
            answer: 'The tournament consists of 9 preliminary rounds using a power-pairing system, followed by elimination rounds (Octo-finals to Grand Final).',
            is_published: true,
            order_index: 7,
        }
    ];

    const [filteredFaqs, setFilteredFaqs] = useState(allFaqs);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        let filtered = allFaqs;

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(faq => faq.category === selectedCategory);
        }

        if (searchQuery.trim() !== '') {
            filtered = filtered.filter(faq =>
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredFaqs(filtered);
    }, [searchQuery, selectedCategory]);

    const categories = [
        { id: 'all', label: 'All Questions' },
        { id: 'general', label: 'General' },
        { id: 'participation', label: 'Participation' },
        { id: 'logistics', label: 'Logistics & Travel' }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="FAQ"
                description="Frequently Asked Questions about PAUDC 2026. Find answers about registration, British Parliamentary format, logistics, accommodation, and more."
                canonical="https://www.paudc2026.com/faq"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-br from-[#185E3B] to-[#124a2e]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-base md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-6 md:mb-8">
                        Find answers to common questions about PAUDC 2026
                    </p>

                    <div className="max-w-2xl mx-auto relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search for questions..."
                            className="w-full pl-12 py-6 text-lg rounded-full text-gray-900 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Categories */}
                    <div className="flex flex-wrap justify-center gap-4 mb-12">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-2 rounded-full font-medium transition-colors ${selectedCategory === cat.id
                                    ? 'bg-[#C84B46] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="text-center py-12">
                        {filteredFaqs.length === 0 && (
                            <p className="text-gray-500 text-lg">No questions found matching your search.</p>
                        )}
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                        {filteredFaqs.map((faq) => (
                            <AccordionItem key={faq.id} value={`item-${faq.id}`} className="bg-white border rounded-lg px-6">
                                <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-[#C84B46]">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-gray-700 pt-2 pb-4">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 md:py-20 bg-[#F6F6F6]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">
                        Still Have Questions?
                    </h2>
                    <p className="text-sm md:text-lg text-gray-700 mb-6 md:mb-8">
                        Can't find the answer you're looking for? Our support team is here to help.
                    </p>
                    <Button
                        size="lg"
                        className="bg-[#C84B46] hover:bg-[#A83D39] text-white text-sm md:text-base font-semibold"
                        onClick={() => window.location.href = '/contact'}
                    >
                        Contact Us
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}