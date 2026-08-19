// Submission service for the PAUDC 2026 Legacy Lab application form.
// Posts the structured application to the backend, which forwards it to the
// Legacy Lab Google Apps Script destination (a separate sheet from the
// general contact/registration forms).

import { getAPIBaseURL } from './config';
import { FormError, type FormErrorCode } from './googleForms';

const SUBMIT_TIMEOUT_MS = 20_000;

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
            throw new FormError('network', ERROR_MESSAGES.network);
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
