import { Helmet } from 'react-helmet-async';

export function EventStructuredData() {
    const eventData = {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "Pan-African University Debating Championship 2026",
        "description": "Africa's premier intellectual arena bringing together over 1,000 young people for debate and dialogue",
        "image": "https://www.paudc2026.com/src/assets/paudc.png",
        "startDate": "2026-12-05T09:00:00+01:00",
        "endDate": "2026-12-13T17:00:00+01:00",
        "eventAttendanceMode": "OfflineEventAttendanceMode",
        "eventStatus": "ScheduledEvent",
        "location": {
            "@type": "Place",
            "name": "Veritas University",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Veritas University Campus",
                "addressLocality": "Abuja",
                "addressCountry": "NG"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "PAUDC 2026",
            "url": "https://www.paudc2026.com",
            "sameAs": [
                "https://twitter.com/paudc2026",
                "https://www.instagram.com/paudc2026"
            ]
        },
        "offers": {
            "@type": "Offer",
            "url": "https://www.paudc2026.com/invite",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "validFrom": "2026-04-21"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(eventData)}
            </script>
        </Helmet>
    );
}

export function OrganizationStructuredData() {
    const orgData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "PAUDC 2026",
        "url": "https://www.paudc2026.com",
        "logo": "https://www.paudc2026.com/src/assets/paudc.png",
        "description": "Pan-African University Debating Championship - Africa's premier intellectual arena",
        "sameAs": [
            "https://twitter.com/paudc2026",
            "https://www.instagram.com/paudc2026"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Service",
            "url": "https://www.paudc2026.com/contact"
        }
    };

    return (
        <Helmet>
            <script type="application/ld+json">
                {JSON.stringify(orgData)}
            </script>
        </Helmet>
    );
}
