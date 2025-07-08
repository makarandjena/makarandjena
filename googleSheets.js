const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '145qozjhpfOUM77tfv49b2gN-lBvmi6CqMvKv6eRDLMs'; // Replace with your Google Sheet ID

async function appendToSheet(values) {
  const sheets = google.sheets({ version: 'v4', auth: await auth.getClient() });

  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:D',
    valueInputOption: 'RAW',
    requestBody: { values: [values] },
  });
}

module.exports = { appendToSheet };
