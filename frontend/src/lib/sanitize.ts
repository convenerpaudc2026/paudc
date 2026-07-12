import DOMPurify from 'dompurify';

export const sanitizeRichHtml = (html: string): string => DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    FORBID_ATTR: ['style'],
});
