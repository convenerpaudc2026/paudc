import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { BLOG_POSTS, getPostBySlug, formatDate, getCategoryImage } from '@/data/blogPosts';

const CATEGORY_COLORS: Record<string, string> = {
    'Debate Tips': '#1B5E3B',
    'Championship News': '#C8A046',
    'Civic Engagement': '#A4372C',
    'Preparation': '#022512',
};

export default function BlogPost() {
    const { slug } = useParams<{ slug: string }>();
    const post = getPostBySlug(slug ?? '');

    if (!post) return <Navigate to="/blog" replace />;

    const related = BLOG_POSTS
        .filter(p => p.id !== post.id && p.category === post.category)
        .slice(0, 3);

    const catColor = CATEGORY_COLORS[post.category] || '#022512';

    return (
        <div className="min-h-screen bg-white">
            <SEO
                title={post.title}
                description={post.excerpt}
                type="article"
                canonical={`https://www.paudc2026.com/blog/${post.slug}`}
            />
            <Navbar />

            {/* Article hero */}
            <header className="relative pt-28 pb-12 bg-gradient-to-br from-[#022512] to-[#1B5E3B] overflow-hidden">
                {/* Category image as faint backdrop */}
                <img
                    src={post.thumbnail || getCategoryImage(post.category)}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-15"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#022512] via-[#022512]/80 to-transparent" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-20">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-[#F6F0E1]/60 hover:text-[#F6F0E1] text-sm font-semibold mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>

                    <div className="flex items-center gap-3 mb-5">
                        <span
                            className="text-xs font-bold px-3 py-1 rounded-full"
                            style={{ background: `${catColor}35`, color: catColor }}
                        >
                            {post.category}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-[#F6F0E1] leading-tight mb-5">
                        {post.title}
                    </h1>

                    <p className="text-lg text-[#F6F0E1]/70 leading-relaxed mb-8 max-w-2xl">
                        {post.excerpt}
                    </p>

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#F6F0E1]/60">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#C8A046] flex items-center justify-center text-[#022512] font-black text-xs shrink-0">
                                {post.author[0]}
                            </div>
                            <div>
                                <p className="font-semibold text-[#F6F0E1] text-xs">{post.author}</p>
                                <p className="text-[10px] text-[#F6F0E1]/50">{post.authorRole}</p>
                            </div>
                        </div>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" /> {formatDate(post.date)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" /> {post.readTime} min read
                        </span>
                    </div>
                </div>
            </header>

            {/* Article body */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 2xl:px-20 py-12">
                <div
                    className="prose-paudc"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Tags */}
                <div className="mt-10 pt-8 border-t border-[#022512]/10 flex flex-wrap gap-2">
                    {post.tags.map(tag => (
                        <span
                            key={tag}
                            className="flex items-center gap-1.5 text-xs font-medium text-[#022512]/55 bg-[#F6F0E1] border border-[#022512]/12 px-3 py-1 rounded-full"
                        >
                            <Tag className="w-3 h-3" /> {tag}
                        </span>
                    ))}
                </div>

                {/* Author card */}
                <div className="mt-10 bg-[#F6F0E1] rounded-2xl p-6 flex items-start gap-5 border border-[#022512]/8">
                    <div className="w-14 h-14 rounded-full bg-[#022512] flex items-center justify-center text-[#C8A046] font-black text-xl shrink-0">
                        {post.author[0]}
                    </div>
                    <div>
                        <p className="font-black text-[#022512] text-sm">{post.author}</p>
                        <p className="text-xs text-[#022512]/55 mb-2">{post.authorRole}</p>
                        <p className="text-xs text-[#022512]/65 leading-relaxed">
                            Written for the PAUDC 2026 official blog. Views represent those of the author and the championship's academic and civic teams.
                        </p>
                    </div>
                </div>

                {/* Related posts */}
                {related.length > 0 && (
                    <div className="mt-14">
                        <h2 className="text-xl font-extrabold text-[#022512] mb-6">
                            More in {post.category}
                        </h2>
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {related.map(rel => (
                                <Link
                                    key={rel.id}
                                    to={`/blog/${rel.slug}`}
                                    className="group bg-[#F6F0E1] rounded-2xl overflow-hidden border border-[#022512]/8 hover:-translate-y-1 transition-transform duration-300 flex flex-col"
                                >
                                    <div className="h-32 bg-[#022512] relative overflow-hidden">
                                        <img
                                            src={rel.thumbnail || getCategoryImage(rel.category)}
                                            alt={rel.title}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col gap-2">
                                        <h3 className="font-bold text-[#022512] text-sm leading-snug line-clamp-2 group-hover:text-[#1B5E3B] transition-colors">
                                            {rel.title}
                                        </h3>
                                        <p className="text-xs text-[#022512]/50 mt-auto flex items-center gap-1.5">
                                            <Clock className="w-3 h-3" /> {rel.readTime} min read
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to blog CTA */}
                <div className="mt-14 text-center">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 bg-[#022512] hover:bg-[#011508] text-[#F6F0E1] font-bold px-7 py-3.5 rounded-full text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> All Articles
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
}
