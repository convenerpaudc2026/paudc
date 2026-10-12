// Submission service for the PAUDC 2026 Legacy Lab application form.
// Posts the structured application to the backend, which forwards it to the
// Legacy Lab Google Apps Script destination (a separate sheet from the
// general contact/registration forms).

import { getAPIBaseURL } from './config';
import { FormError, type FormErrorCode } from './googleForms';

// Generous: covers a Render cold start, a ~1.7 MB attachment upload on a slow
// connection, and the backend's own wait on Apps Script.
const SUBMIT_TIMEOUT_MS = 60_000;

const ERROR_MESSAGES: Record<FormErrorCode, string> = {
    offline:
        'You appear to be offline. Please check your internet connection and try again.',
    network:
        "We couldn't reach our servers. Please check your connection or try again in a moment.",
    timeout:
        'The request took too long to complete. Please try again — if the problem continues, check your connection.',
    unknown:
        'Something went wrong while submitting. Please try again, or contact us if the issue persists.',
};

export interface LegacyLabAttachment {
    filename: string;
    mimeType: string;
    /** base64-encoded file contents (no data: prefix). */
    dataBase64: string;
}

export interface LegacyLabApplication {
    // Section 1 — Applicant information
    fullName: string;
    email: string;
    phone: string;
    country: string;
    city: string;
    institution: string;
    courseOfStudy?: string;
    levelOfStudy: string;
    applicantType: 'Individual' | 'Team';

    // Section 2 — Team information (only when applicantType === 'Team')
    teamName?: string;
    teamLead?: string;
    teamMembers?: string;
    teamInstitutions?: string;

    // Section 3 — Eligibility and availability
    studentStatus: string;
    availableIncubation: string;
    availableShowcase: string;
    understandNoGuarantee: boolean;

    // Section 4 — Project idea
    projectTitle: string;
    thematicArea: string;
    ideaOneSentence: string;
    problem: string;
    affected: string;
    solution: string;
    whyItMatters: string;
    alreadyStarted: string;
    progressSoFar?: string;

    // Section 5 — Pilot and support needed
    pilotDescription: string;
    pilotLocation: string;
    supportNeeded: string[];
    supportOther?: string;
    pilotBudget: string;

    // Section 6 — Impact and motivation
    changeHoped: string;
    beneficiaryReach: string;
    personalMotivation: string;

    // Section 7 — Supporting material (optional)
    links?: string;
    attachment?: LegacyLabAttachment;

    // Section 8 — Declarations
    declarationAccurate: boolean;
    declarationOriginal: boolean;
    declarationConsent: boolean;
    declarationParticipate: boolean;
}

// Turns a non-2xx backend response into an applicant-facing explanation,
// rather than reporting every failure as "couldn't reach our servers".
async function describeFailure(response: Response): Promise<FormError> {
    if (response.status === 429) {
        const minutes = Math.ceil(Number(response.headers.get('Retry-After')) / 60);
        const wait = minutes > 0 ? `about ${minutes} minute${minutes === 1 ? '' : 's'}` : 'a few minutes';
        return new FormError('network', `Too many submission attempts from your network. Please wait ${wait} and try again — your answers are still here.`);
    }
    if (response.status === 413) {
        return new FormError('unknown', 'Your application is too large to send, usually because of the attached file. Please attach a smaller file or share a link instead.');
    }
    if (response.status === 422) {
        // FastAPI validation errors: detail[].loc = ['body', '<field>', ...]
        const body = await response.json().catch(() => null);
        const field = body?.detail?.[0]?.loc?.[1];
        return new FormError('unknown', `One of your answers wasn't accepted${typeof field === 'string' ? ` (${field})` : ''}. Please review your answers and try again.`);
    }
    return new FormError('network', 'Our application service is temporarily unavailable. Please try again in a few minutes — your answers are still here.');
}

export async function submitLegacyLabApplication(
    data: LegacyLabApplication,
): Promise<void> {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new FormError('offline', ERROR_MESSAGES.offline);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

    try {
        const response = await fetch(`${getAPIBaseURL()}/api/v1/forms/legacy-lab`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            signal: controller.signal,
        });
        if (!response.ok) {
            throw await describeFailure(response);
        }
    } catch (error: unknown) {
        if (error instanceof FormError) {
            throw error;
        }
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new FormError('timeout', ERROR_MESSAGES.timeout);
        }
        if (error instanceof TypeError) {
            throw new FormError('network', ERROR_MESSAGES.network);
        }
        console.error('Legacy Lab submission error:', error);
        throw new FormError('unknown', ERROR_MESSAGES.unknown);
    } finally {
        clearTimeout(timeoutId);
    }
}
