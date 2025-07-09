const { google } = require('googleapis');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { analysis } = JSON.parse(event.body);

  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const SHEET_ID = '145qozjhpfOUM77tfv49b2gN-lBvmi6CqMvKv6eRDLMs';

  try {
    const values = analysis.map(row => [
      row.internId,
      row.internName,
      row.domain,
      row.fileName,
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
      auth: await auth.getClient(),
    });

    return {
      statusCode: 200,
      body: 'Saved to Google Sheet',
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: `Failed to save: ${err.message}`,
    };
  }
};
