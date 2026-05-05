// File: src/lib/googleForms.ts
// Service to submit forms to Google Apps Script

const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwB1DIlqsdePiXjKosxvCGOTtG37gxQ4eFgSQ9cmNF3iiLkWAxpK2ecbyP1bbmLZ-_O/exec";

export interface FormSubmission {
  type: "registration" | "contact" | "lms_waitlist";
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

export async function submitForm(data: FormSubmission): Promise<boolean> {
  try {
    // URL-encoded form data is the only POST shape that works reliably
    // with Google Apps Script web apps from a browser without CORS issues.
    // The Apps Script reads it via e.parameter.payload.
    const body = new URLSearchParams();
    body.append("payload", JSON.stringify(data));

    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body,
    });

    // no-cors responses are opaque — we can't read status. Treat reaching
    // this point as success and verify in the Apps Script Executions log.
    return true;
  } catch (error) {
    console.error("Form submission error:", error);
    return false;
  }
}
