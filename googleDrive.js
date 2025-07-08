const fs = require('fs');
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function uploadToDrive(filePath) {
  const drive = google.drive({ version: 'v3', auth: await auth.getClient() });
  const fileMetadata = {
    name: filePath.split('/').pop(),
    parents: ['1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A'], // Replace with your folder ID
  };
  const media = {
    mimeType: 'application/zip',
    body: fs.createReadStream(filePath),
  };

  await drive.files.create({ resource: fileMetadata, media, fields: 'id' });
}

module.exports = { uploadToDrive };
