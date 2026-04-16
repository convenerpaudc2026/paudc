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
}

export async function submitForm(data: FormSubmission): Promise<boolean> {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Form submission response status:", response.status);
    console.log("Form submission response:", response);

    // With no-cors mode, we can't read the response body
    // But we can assume success if the fetch completes without error
    return true;
  } catch (error) {
    console.error("Form submission error:", error);
    return false;
  }
}
