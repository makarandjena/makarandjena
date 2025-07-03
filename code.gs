const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ymOXLTtFg2CLQrhhjXpwreKl_l6YTDPz_ZgmbBu1G5Y';
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/u/1/folders/1AmmgHYHEqoz3Hvb-lbgQNQ6VDkKcXT0c';

function getIdFromUrl(url) {
  return url.match(/[-\w]{25,}/)[0];
}

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index');
}

function processZipFile(fileObj) {
  try {
    const folderId = getIdFromUrl(DRIVE_FOLDER_URL);
    const parentFolder = DriveApp.getFolderById(folderId);
    const blob = Utilities.newBlob(Utilities.base64Decode(fileObj.fileData), fileObj.mimeType, fileObj.fileName);
    const zipFile = parentFolder.createFile(blob);

    const unzipped = Utilities.unzip(blob);
    const extractedFiles = [];
    const results = [];

    const filename = fileObj.fileName;
    const [internId, internName, domainName] = filename.replace('.zip', '').split('--').map(s => s.trim());

    for (const f of unzipped) {
      const savedFile = parentFolder.createFile(f);
      extractedFiles.push(savedFile);
    }

    for (let i = 0; i < extractedFiles.length; i++) {
      const file = extractedFiles[i];
      const mime = file.getMimeType();
      let content = '';
      let supported = true;

      if (mime.includes('text')) {
        content = file.getBlob().getDataAsString();
      } else if (mime === "application/pdf") {
        content = extractTextFromPdf(file);
      } else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        content = extractTextFromDocx(file);
      } else if (mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
        content = extractTextFromExcel(file);
      } else {
        supported = false;
      }

      let evaluation;
      if (supported && content.trim() !== '') {
        evaluation = analyzeWithGemini(file.getName(), content, fileObj.prompt);
        saveToSheet(new Date(), internId, internName, domainName, file.getName(), evaluation, "Success");
      } else {
        evaluation = "Unsupported or empty file type.";
        saveToSheet(new Date(), internId, internName, domainName, file.getName(), evaluation, "Skipped");
      }

      results.push({ filename: file.getName(), evaluation: evaluation });

      Utilities.sleep(1000); // Delay to simulate processing time
    }

    return results;

  } catch (e) {
    saveToSheet(new Date(), "Unknown", "Unknown", "Unknown", "Unknown", e.toString(), "Error");
    throw new Error("Processing failed: " + e.message);
  }
}

function extractTextFromPdf(file) {
  try {
    return file.getBlob().getDataAsString();
  } catch (e) {
    return "[Error extracting PDF content]";
  }
}

function extractTextFromDocx(file) {
  try {
    const converted = Drive.Files.copy({}, file.getId(), { convert: true });
    const doc = DocumentApp.openById(converted.id);
    return doc.getBody().getText();
  } catch (e) {
    return "[Error extracting Word content]";
  }
}

function extractTextFromExcel(file) {
  try {
    const converted = Drive.Files.copy({}, file.getId(), { convert: true });
    const ss = SpreadsheetApp.openById(converted.id);
    let allText = "";
    ss.getSheets().forEach(sheet => {
      const data = sheet.getDataRange().getValues();
      data.forEach(row => {
        allText += row.join(' ') + '\n';
      });
    });
    return allText;
  } catch (e) {
    return "[Error extracting Excel content]";
  }
}

function analyzeWithGemini(filename, content, prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('AIzaSyBZDS98aad6s-Qtn61S_6Xg4_cd1Mv4vy8');
  if (!apiKey) return "API Key missing.";

  const fullPrompt = `
**File:** ${filename}

**Content (first 3000 chars):**
${content.slice(0, 3000)}

**Tasks:**
1. Summarize the document in 3 key points.
2. State if a signature or 'signed by' is found.
3. Estimate plagiarism risk: Likely Original / Possible Match / Copied.
`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [{ parts: [{ text: fullPrompt }] }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(requestBody),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(apiUrl, options);
    const responseData = JSON.parse(response.getContentText());
    return responseData.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini.";
  } catch (e) {
    return "Gemini API error: " + e.message;
  }
}

function saveToSheet(date, internId, internName, domainName, fileName, evaluation, status) {
  const sheet = SpreadsheetApp.openById(getIdFromUrl(SHEET_URL)).getActiveSheet();
  sheet.appendRow([date, internId, internName, domainName, fileName, evaluation, status]);
}
