// Meta Pixel helpers. The base code (public/meta-pixel.js, loaded from
// index.html) defines window.fbq and fires PageView on every route change.

type Fbq = (command: 'track', event: string, params?: Record<string, unknown>) => void;

declare global {
    interface Window {
        fbq?: Fbq;
    }
}

const UTM_STORAGE_KEY = 'paudc_utm';
const MAX_UTM_KEYS = 10;
const MAX_UTM_VALUE_LENGTH = 200;

type UtmParams = Record<string, string>;

function readUtmFromSearch(search: string): UtmParams {
    const utm: UtmParams = {};
    for (const [rawKey, value] of new URLSearchParams(search)) {
        const key = rawKey.toLowerCase();
        if (key.startsWith('utm_') && value && Object.keys(utm).length < MAX_UTM_KEYS) {
            utm[key] = value.slice(0, MAX_UTM_VALUE_LENGTH);
        }
    }
    return utm;
}

/**
 * Remember the utm_ tags from the link the visitor arrived on, for the rest of
 * the visit. Ad clicks land on whatever page the ad points at; this keeps the
 * tags available when the visitor later reaches /invite via the site's own
 * links, which don't carry the query string.
 */
export function captureUtmParams(): void {
    const utm = readUtmFromSearch(window.location.search);
    if (Object.keys(utm).length === 0) return;
    try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch {
        // Storage blocked (private mode, site data disabled): fall back to the URL only.
    }
}

/** UTM tags on the current URL, or else the ones captured on arrival. */
export function getUtmParams(): UtmParams {
    const current = readUtmFromSearch(window.location.search);
    if (Object.keys(current).length > 0) return current;
    try {
        const stored: unknown = JSON.parse(sessionStorage.getItem(UTM_STORAGE_KEY) ?? '{}');
        if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
            return Object.fromEntries(
                Object.entries(stored).filter(([, v]) => typeof v === 'string'),
            ) as UtmParams;
        }
    } catch {
        // Unreadable or blocked storage: no stored tags.
    }
    return {};
}

/** Send a standard Meta Pixel event. Never throws: tracking must not break the page. */
export function trackMetaEvent(event: string, params?: Record<string, unknown>): void {
    try {
        window.fbq?.('track', event, params);
    } catch {
        // Pixel missing or blocked (e.g. by an ad blocker).
    }
}
