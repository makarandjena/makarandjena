const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { analyzeDocumentation } = require('./analyzeDoc');
const { uploadToDrive } = require('https://drive.google.com/drive/u/0/folders/1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A');
const { appendToSheet } = require('https://docs.google.com/spreadsheets/d/145qozjhpfOUM77tfv49b2gN-lBvmi6CqMvKv6eRDLMs/edit?gid=0#gid=0');

const app = express();

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '_' + file.originalname),
});
const upload = multer({ storage });

app.post('/scan', upload.single('zipFile'), async (req, res) => {
  const { internId, internName, domainName } = req.body;
  const filePath = req.file.path;

  try {
    const analysis = await analyzeDocumentation(filePath);
    await uploadToDrive(filePath);

    res.json({
      internId,
      internName,
      domainName,
      analysis,
    });

    fs.unlinkSync(filePath); // Clean up
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to process ZIP file');
  }
});

app.post('/save-to-sheet', async (req, res) => {
  try {
    const { internId, internName, domainName, analysis } = req.body;
    await appendToSheet([internId, internName, domainName, analysis]);
    res.send('Saved to Google Sheets');
  } catch (e) {
    console.error(e);
    res.status(500).send('Error saving to sheet');
  }
});

app.listen(PORT, () => console.log(`Server running on https://project-evaluation.netlify.app/`));
