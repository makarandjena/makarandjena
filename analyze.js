const AdmZip = require('adm-zip');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { google } = require('googleapis');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const boundary = event.headers['content-type'].split('boundary=')[1];
  const body = Buffer.from(event.body, 'base64');

  // Simulated zip handling - you’d use 'busboy' or another parser in practice.
  const zipPath = path.join(os.tmpdir(), `upload-${Date.now()}.zip`);
  fs.writeFileSync(zipPath, body);

  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  const analysis = zipEntries.map(entry => {
    const fileName = entry.entryName;
    const internId = fileName.match(/\\d{4}/)?.[0] || 'N/A';
    const internName = fileName.split('_')[0] || 'Unknown';
    const domain = fileName.includes('AI') ? 'AI' : 'General';

    return { fileName, internId, internName, domain };
  });

  return {
    statusCode: 200,
    body: JSON.stringify(analysis),
  };
};
