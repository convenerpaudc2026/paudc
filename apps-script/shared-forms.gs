/**
 * PAUDC 2026 — shared form intake (registration, contact, LMS waitlist; visa
 * when VISA_APPS_SCRIPT_URL is not set on Render). Render env var:
 * GOOGLE_APPS_SCRIPT_URL.
 *
 * Reference copy of the live script. Config values are blank here: keep the
 * values from the live script when you paste. See README.md for deploying.
 *
 * 2026-11-27 hardening, after a sheet change silently dropped registrations:
 *  - The tab is found by name OR by its numeric gid, so renaming it no longer
 *    breaks intake. If it was deleted, it is recreated with the header row.
 *  - If saving fails anyway, the full submission is emailed to ADMIN_EMAIL so
 *    nothing is lost, and the script still answers success:false. The backend
 *    now checks that flag and shows the applicant an error instead of
 *    "Registration Submitted".
 */

// ============ CONFIGURATION ============
const SHEET_ID = "";        // keep the live value
const SHEET_NAME = "Sheet1";
// The tab's numeric ID: the number after "#gid=" in the sheet URL while the
// tab is open. Unlike the name, it survives renames. A new spreadsheet's first
// tab is 0.
const SHEET_GID = 0;
const ADMIN_EMAIL = "";     // keep the live value

const HEADERS = [
  "Timestamp", "Form Type", "Registration Type", "Primary Email", "Contact Emails",
  "Name", "Phone", "Institution", "Country", "Team/Role", "Message",
  "Addressed To", "Status", "Invite Status",
];

// 🟢 Central label map — single source of truth for form types.
//    Add a new type here and both emails pick it up (no more silent
//    fall-through to "LMS Waitlist").
const TYPE_LABELS = {
  registration: "Registration",
  contact: "Contact",
  lms_waitlist: "LMS Waitlist",
  visa: "Visa Letter Request",
};

// ============ MAIN FUNCTION ============
function doPost(e) {
  let data = null; // declared outside try so the catch can back it up

  try {
    // Handle BOTH raw JSON and URL-encoded payload formats
    if (e.postData && e.postData.type === "application/json") {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.payload) {
      data = JSON.parse(e.parameter.payload);
    } else if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      return _jsonResponse(false, "No recognizable data received");
    }

    if (!data.email || !data.type) {
      return _jsonResponse(false, "Missing required fields: email and type are mandatory");
    }

    addToSheet(data);
    sendUserConfirmationEmail(data);
    sendAdminNotificationEmail(data);

    return _jsonResponse(true, "Form submitted successfully");
  } catch (error) {
    console.error("doPost error:", error);
    sendFailureBackupEmail(error, data, e);
    return _jsonResponse(false, "Server error: " + error.toString());
  }
}

function doGet(e) {
  return _jsonResponse(true, "PAUDC 2026 backend is live. Use POST to submit forms.");
}

// ============ HELPER: JSON RESPONSE ============
function _jsonResponse(success, message) {
  return ContentService
    .createTextOutput(JSON.stringify({ success: success, message: message }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============ FIND THE TAB ============
function getSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME)
    || ss.getSheets().find(function (s) { return s.getSheetId() === SHEET_GID; });

  if (!sheet) {
    // The tab was deleted: recreate it so submissions keep landing somewhere known.
    console.warn('Tab "' + SHEET_NAME + '" (gid ' + SHEET_GID + ') not found; recreating it.');
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

// ============ ADD TO SHEET ============
// Column order:
// A: Timestamp | B: Form Type | C: Registration Type | D: Primary Email
// E: Contact Emails | F: Name | G: Phone | H: Institution
// I: Country | J: Team/Role | K: Message | L: Addressed To
// M: Status | N: Invite Status
//
// 🟢 Visa notes: nationality -> I (Country), role -> J (Team/Role),
//    embassy -> L (Addressed To), and passport/DOB/travel details arrive
//    packed in K (Message). No schema change needed.
function addToSheet(data) {
  const sheet = getSheet_();

  const row = [
    new Date(),                            // A — Timestamp
    data.type || "",                       // B — Form Type
    data.registrationType || "",           // C — Registration Type
    data.email || "",                      // D — Primary Email
    data.contactEmails || "",              // E — All Contact Emails
    data.name || "",                       // F — Name / Institution Name
    data.phone || "",                      // G — Phone
    data.institution || "",                // H — Institution
    data.country || "",                    // I — Country / Nationality
    data.team || data.subject || "",       // J — Team / Role / Subject
    data.message || "",                    // K — Message / Comments / Visa details
    data.addressedTo || "",                // L — Addressed To / Embassy
    "received",                            // M — Status
    "",                                    // N — Invite Status (manual)
  ];

  sheet.appendRow(row);
}

// ============ BACKUP WHEN SAVING FAILS ============
function sendFailureBackupEmail(error, data, e) {
  const raw = data
    ? JSON.stringify(data, null, 2)
    : (e && e.parameter && e.parameter.payload) || (e && e.postData && e.postData.contents) || "(no data received)";

  let body = "A website form submission could NOT be saved to the sheet, so it is copied below.\n";
  body += "Please add it to the sheet by hand, then fix the cause.\n\n";
  body += "Error: " + error + "\n\n";
  body += "Submission:\n" + raw + "\n\n";
  body += "Sheet: https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit";

  try {
    GmailApp.sendEmail(ADMIN_EMAIL, "[PAUDC 2026] ACTION NEEDED: submission not saved to sheet", body);
  } catch (mailErr) {
    console.error("Failed to send backup email:", mailErr);
  }
}

// ============ USER CONFIRMATION EMAIL ============
function sendUserConfirmationEmail(data) {
  const subject = "Thank you for your submission – PAUDC 2026";

  let body = `Dear ${data.name || "Participant"},\n\n`;
  body += "Thank you for your submission to PAUDC 2026.\n\n";

  if (data.type === "registration") {
    const regLabel = data.registrationType === "institution" ? "institution" : "individual";
    body += `We have received your ${regLabel} registration.\n`;
    body += "Our team will review your submission and get back to you shortly.\n\n";
  } else if (data.type === "contact") {
    body += "We have received your message and will respond as soon as possible.\n\n";
  } else if (data.type === "lms_waitlist") {
    body += "You have been added to the LMS waitlist. We will notify you when the Learning Management System goes live in June 2026.\n\n";
  } else if (data.type === "visa") {
    // 🟢 Visa invitation-letter acknowledgement
    body += "We have received your request for a visa invitation letter.\n";
    body += "Our secretariat will prepare an official invitation letter and email it to you, typically within 5–7 working days.\n\n";
    body += "Please note: an invitation letter supports your visa application but does not guarantee issuance of a visa — all decisions rest with the relevant embassy or consulate.\n\n";
  }

  body += "Best regards,\nPAUDC 2026 Team";

  try {
    GmailApp.sendEmail(data.email, subject, body);
  } catch (err) {
    console.error("Failed to send user email:", err);
  }
}

// ============ ADMIN NOTIFICATION EMAIL ============
function sendAdminNotificationEmail(data) {
  // 🟢 Look up the label; unknown types read as "Submission" instead of
  //    being silently mislabelled as "LMS Waitlist".
  const typeLabel = TYPE_LABELS[data.type] || "Submission";

  const subject = `[PAUDC 2026] New ${typeLabel} Submission`;

  let body = "A new form submission has been received:\n\n";
  body += `Timestamp:           ${new Date()}\n`;
  body += `Form Type:           ${data.type || "—"}\n`;
  body += `Registration Type:   ${data.registrationType || "—"}\n\n`;
  body += "--- SUBMISSION DETAILS ---\n";
  body += `Primary Email:       ${data.email || "—"}\n`;
  if (data.contactEmails)  body += `All Contact Emails:  ${data.contactEmails}\n`;
  if (data.name)           body += `Name:                ${data.name}\n`;
  if (data.phone)          body += `Phone:               ${data.phone}\n`;
  if (data.institution)    body += `Institution:         ${data.institution}\n`;
  if (data.country)        body += `${data.type === "visa" ? "Nationality:         " : "Country:             "}${data.country}\n`;
  if (data.team)           body += `${data.type === "visa" ? "Role:                " : "Team / Role:         "}${data.team}\n`;
  if (data.subject)        body += `Subject:             ${data.subject}\n`;
  // 🟢 For visa, "Addressed To" is the embassy/consulate.
  if (data.addressedTo)    body += `${data.type === "visa" ? "Embassy / Consulate:\n" : "Addressed To:\n"}${data.addressedTo}\n`;
  if (data.message)        body += `\n${data.type === "visa" ? "Passport & Travel Details:" : "Message / Comments:"}\n${data.message}\n`;

  body += `\nView sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`;

  try {
    GmailApp.sendEmail(ADMIN_EMAIL, subject, body);
  } catch (err) {
    console.error("Failed to send admin email:", err);
  }
}
