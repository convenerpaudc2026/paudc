// File: src/lib/googleForms.ts
// Service to submit forms to Google Apps Script

import { getAPIBaseURL } from './config';

const SUBMIT_TIMEOUT_MS = 15_000;

export interface FormSubmission {
  type: "registration" | "contact" | "lms_waitlist" | "visa";
  email: string;
  name?: string;
  phone?: string;
  institution?: string;
  team?: string;
  subject?: string;
  message?: string;
  registrationType?: string;
  country?: string;
  addressedTo?: string;
  contactEmails?: string;
}

export type FormErrorCode = "offline" | "network" | "timeout" | "unknown";

export class FormError extends Error {
  code: FormErrorCode;

  constructor(code: FormErrorCode, message: string) {
    super(message);
    this.name = "FormError";
    this.code = code;
  }
}

const ERROR_MESSAGES: Record<FormErrorCode, string> = {
  offline:
    "You appear to be offline. Please check your internet connection and try again.",
  network:
    "We couldn't reach our servers. Please check your connection or try again in a moment.",
  timeout:
    "The request took too long to complete. Please try again — if the problem continues, check your connection.",
  unknown:
    "Something went wrong while submitting. Please try again, or contact us if the issue persists.",
};

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export async function submitForm(data: FormSubmission): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw new FormError("offline", ERROR_MESSAGES.offline);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS);

  try {
    // URL-encoded form data is the only POST shape that works reliably
    // with Google Apps Script web apps from a browser without CORS issues.
    // The Apps Script reads it via e.parameter.payload.
    const response = await fetch(`${getAPIBaseURL()}/api/v1/forms/submit`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    if (!response.ok) {
      // A 5xx means our server was reached but the submission wasn't saved
      // (e.g. the Google Sheet script failed), so don't blame the connection.
      throw response.status >= 500
        ? new FormError('unknown', ERROR_MESSAGES.unknown)
        : new FormError('network', ERROR_MESSAGES.network);
    }

    // Reaching this point means the backend confirmed the Apps Script saved
    // the submission (it checks the script's reply, not just the status).
  } catch (error: unknown) {
    if (error instanceof FormError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new FormError("timeout", ERROR_MESSAGES.timeout);
    }
    // fetch() throws TypeError for network failures, blocked requests,
    // DNS failures, and similar "never left the browser" errors.
    if (error instanceof TypeError) {
      throw new FormError("network", ERROR_MESSAGES.network);
    }
    console.error("Form submission error:", error);
    throw new FormError("unknown", ERROR_MESSAGES.unknown);
  } finally {
    clearTimeout(timeoutId);
  }
}
