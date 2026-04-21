import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: string;
    canonical?: string;
}

export function SEO({
    title,
    description,
    image = '/src/assets/paudc.png',
    url,
    type = 'website',
    canonical
}: SEOProps) {
    const fullTitle = `${title} | PAUDC 2026`;
    const canonicalUrl = canonical || url || window.location.href;

    return (
        <Helmet>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={canonicalUrl} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
}
