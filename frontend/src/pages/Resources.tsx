import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Video, Download, GraduationCap, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Resources() {
    const resourceCategories = [
        {
            title: 'Training & Learning',
            icon: <GraduationCap className="h-6 w-6 text-[#C84B46]" />,
            description: 'Access our comprehensive Learning Management System.',
            items: [
                { name: 'Judge Training Portal', link: '/login', type: 'LMS' },
                { name: 'Speaker Training Portal', link: '/login', type: 'LMS' },
            ]
        },
        {
            title: 'Debate Resources',
            icon: <BookOpen className="h-6 w-6 text-[#185E3B]" />,
            description: 'Essential materials for debaters and judges.',
            items: [
                { name: 'Official Judging Ballot Template', link: '#', type: 'PDF' },
                { name: 'Tournament Schedule Template', link: '#', type: 'XLSX' },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO
                title="Resources"
                description="PAUDC 2026 resources and training materials. Access the learning management system, debate guides, templates, and preparation materials."
                canonical="https://www.paudc2026.com/resources"
            />
            <Navbar />

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white pt-24 md:pt-32 pb-12 md:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">Resources & Training</h1>
                    <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Everything you need to prepare for PAUDC 2026, from comprehensive LMS courses to downloadable materials.
                    </p>
                </div>
            </section>

            <section className="py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {resourceCategories.map((category, idx) => (
                        <Card key={idx} className="border-2 border-gray-100 shadow-md">
                            <CardHeader className="flex flex-row items-center gap-3 md:gap-4 pb-2">
                                <div className="p-2 md:p-3 bg-gray-50 rounded-lg">
                                    {category.icon}
                                </div>
                                <div>
                                    <CardTitle className="text-lg md:text-2xl font-bold text-gray-900">{category.title}</CardTitle>
                                    <CardDescription className="text-sm md:text-base text-gray-600">{category.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4 md:pt-6 space-y-3 md:space-y-4">
                                {category.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-2 md:gap-3">
                                            {item.type === 'PDF' && <FileText className="h-4 w-4 md:h-5 md:w-5 text-red-500" />}
                                            {item.type === 'XLSX' && <FileText className="h-4 w-4 md:h-5 md:w-5 text-green-600" />}
                                            {item.type === 'LMS' && <Video className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />}
                                            <span className="font-semibold text-sm md:text-base text-gray-800">{item.name}</span>
                                        </div>

                                        {item.type === 'LMS' ? (
                                            <Button variant="outline" size="sm" asChild className="border-[#C84B46] text-[#C84B46] hover:bg-[#C84B46] hover:text-white">
                                                <Link to={item.link}>Access Course <ExternalLink className="ml-2 h-4 w-4" /></Link>
                                            </Button>
                                        ) : (
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                                                <Download className="h-4 w-4 mr-2" /> Download
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
}