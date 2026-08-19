// ── PAUDC 2026 Legacy Lab — application intake ─────────────────────────
//
// Destination for applications submitted at /legacy-lab/apply. The backend
// endpoint POST /api/v1/forms/legacy-lab forwards them as a POST with a
// single form field `payload` = JSON of the LegacyLabApplication. Keys are
// camelCase; `supportNeeded` is an array; `attachment` is
// {filename, mimeType, dataBase64}; declarations are booleans. Optional
// empty fields are omitted (backend uses exclude_none), so tolerate missing
// keys.
//
// Deploy: bind this script to a Google Sheet (Extensions → Apps Script),
// then Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
// Put the /exec URL in Render as LEGACY_LAB_APPS_SCRIPT_URL.

const CONFIG = {
  SPREADSHEET_ID: '',            // '' if the script is bound to the sheet
  SHEET_NAME: 'Applications',
  ATTACHMENTS_FOLDER_ID: '',     // Drive folder ID for uploads ('' = My Drive root)
  ADMIN_EMAIL: '',               // notified on each application ('' = skip)
  SEND_APPLICANT_CONFIRMATION: true,
};

// Column order for the sheet (also the header row, after Timestamp).
const FIELDS = [
  'fullName','email','phone','country','city','institution','courseOfStudy',
  'levelOfStudy','applicantType','teamName','teamLead','teamMembers',
  'teamInstitutions','studentStatus','availableIncubation','availableShowcase',
  'understandNoGuarantee','projectTitle','thematicArea','ideaOneSentence',
  'problem','affected','solution','whyItMatters','alreadyStarted','progressSoFar',
  'pilotDescription','pilotLocation','supportNeeded','supportOther','pilotBudget',
  'changeHoped','beneficiaryReach','personalMotivation','links',
  'declarationAccurate','declarationOriginal','declarationConsent',
  'declarationParticipate',
];

function doPost(e) {
  try {
    if (!e || !e.parameter || !e.parameter.payload) {
      return json_({ success: false, error: 'missing payload' });
    }
    const data = JSON.parse(e.parameter.payload);

    let attachmentLink = '';
    if (data.attachment && data.attachment.dataBase64) {
      attachmentLink = saveAttachment_(data.attachment);
    }

    const sheet = getSheet_();
    ensureHeader_(sheet);
    const row = [new Date()]
      .concat(FIELDS.map(function (key) { return formatValue_(data[key]); }))
      .concat([attachmentLink]);
    sheet.appendRow(row);

    if (CONFIG.ADMIN_EMAIL) notifyAdmin_(data, attachmentLink);
    if (CONFIG.SEND_APPLICANT_CONFIRMATION && data.email) sendConfirmation_(data);

    return json_({ success: true });
  } catch (err) {
    return json_({ success: false, error: String(err) });
  }
}

function doGet() {
  return ContentService.createTextOutput('Legacy Lab intake is live.');
}

function getSheet_() {
  const ss = CONFIG.SPREADSHEET_ID
    ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CONFIG.SHEET_NAME) || ss.insertSheet(CONFIG.SHEET_NAME);
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(['timestamp'].concat(FIELDS).concat(['attachment']));
  sheet.getRange(1, 1, 1, sheet.getLastColumn()).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function formatValue_(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.join(', ');
  return v;
}

function saveAttachment_(att) {
  const bytes = Utilities.base64Decode(att.dataBase64);
  const blob = Utilities.newBlob(bytes, att.mimeType || 'application/octet-stream',
                                 att.filename || 'attachment');
  const folder = CONFIG.ATTACHMENTS_FOLDER_ID
    ? DriveApp.getFolderById(CONFIG.ATTACHMENTS_FOLDER_ID)
    : DriveApp.getRootFolder();
  return folder.createFile(blob).getUrl();
}

function notifyAdmin_(data, attachmentLink) {
  const lines = [
    'Applicant: ' + (data.fullName || ''),
    'Email: ' + (data.email || ''),
    'Country: ' + (data.country || '') + ' · ' + (data.institution || ''),
    'Theme: ' + (data.thematicArea || ''),
    'Type: ' + (data.applicantType || ''),
    attachmentLink ? 'Attachment: ' + attachmentLink : '',
    '', 'Open the spreadsheet for the full submission.',
  ].filter(String);
  MailApp.sendEmail(CONFIG.ADMIN_EMAIL,
    'New Legacy Lab application: ' + (data.projectTitle || '(untitled)'),
    lines.join('\n'));
}

function sendConfirmation_(data) {
  const body =
    'Thank you for applying to the PAUDC 2026 Legacy Lab. Your application has ' +
    'been received successfully.\n\n' +
    'The PAUDC Legacy Lab team will review all submissions after the application ' +
    'deadline. Shortlisted applicants may be contacted for follow-up questions or ' +
    'interviews. Please monitor the email address and phone number you provided.\n\n' +
    'We appreciate your interest in transforming ideas into practical impact across Africa.\n\n' +
    '— PAUDC 2026 Legacy Lab';
  MailApp.sendEmail(data.email, 'PAUDC 2026 Legacy Lab — application received', body);
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
