// ── PAUDC 2026 — Visa Invitation Letter requests ───────────────────────
//
// Destination for visa requests submitted at /visa. The backend forwards
// them as a POST with a single form field `payload` = JSON of the
// PublicFormSubmission (type = "visa"). Relevant keys:
//   name, email, phone, country (nationality), institution, team (role),
//   message (passport number + arrival/departure + notes, packed by the
//   frontend), type.
//
// Deploy: bind this script to a Google Sheet (Extensions → Apps Script),
// then Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
// Put the /exec URL in Render as VISA_APPS_SCRIPT_URL.

const CONFIG = {
  SPREADSHEET_ID: '',            // '' if the script is bound to the sheet
  SHEET_NAME: 'Visa Requests',
  ADMIN_EMAIL: '',               // notified on each request ('' = skip)
  SEND_APPLICANT_CONFIRMATION: true,
};

// [sheet header, payload key]
const COLUMNS = [
  ['Full name', 'name'],
  ['Email', 'email'],
  ['Phone / WhatsApp', 'phone'],
  ['Nationality', 'country'],
  ['Institution', 'institution'],
  ['Role at PAUDC 2026', 'team'],
  ['Passport & travel details', 'message'],
];

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.payload) {
      return json_({ success: false, error: 'missing payload' });
    }
    const data = JSON.parse(e.parameter.payload);

    const sheet = getSheet_();
    ensureHeader_(sheet);
    sheet.appendRow([new Date()].concat(COLUMNS.map(function (c) {
      const v = data[c[1]];
      return v === undefined || v === null ? '' : v;
    })));

    if (CONFIG.ADMIN_EMAIL) {
      MailApp.sendEmail(
        CONFIG.ADMIN_EMAIL,
        'New visa letter request: ' + (data.name || ''),
        'Nationality: ' + (data.country || '') + '\nEmail: ' + (data.email || '') +
        '\nPhone: ' + (data.phone || '') + '\n\n' + (data.message || ''));
    }
    if (CONFIG.SEND_APPLICANT_CONFIRMATION && data.email) sendConfirmation_(data);

    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Visa request intake is live.');
}

function getSheet_() {
  const ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(['Timestamp'].concat(COLUMNS.map(function (c) { return c[0]; })));
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function sendConfirmation_(data) {
  const body =
    'Dear ' + (data.name || 'Applicant') + ',\n\n' +
    'We have received your request for a PAUDC 2026 visa invitation letter. ' +
    'Your signed invitation letter will be emailed to you, typically within ' +
    '5–7 working days.\n\n' +
    'Please note that an invitation letter supports — but does not guarantee — ' +
    'the issuance of a visa. All decisions rest with the relevant embassy or ' +
    'consulate.\n\n— PAUDC 2026 Secretariat';
  MailApp.sendEmail(data.email, 'PAUDC 2026 — visa letter request received', body);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
