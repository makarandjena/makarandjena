const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1ymOXLTtFg2CLQrhhjXpwreKl_l6YTDPz_ZgmbBu1G5Y/edit?gid=0#gid=0';
const DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1AmmgHYHEqoz3Hvb-lbgQNQ6VDkKcXT0c?usp=sharing';

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

    for (const f of unzipped) {
      const savedFile = parentFolder.createFile(f);
      extractedFiles.push(savedFile);
    }

    for (const file of extractedFiles) {
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

      if (supported && content.trim() !== '') {
        const evaluation = analyzeWithGemini(file.getName(), content, fileObj.prompt);
        results.push({
          filename: file.getName(),
          evaluation: evaluation
        });
        saveToSheet(file.getName(), evaluation, "Success");
      } else {
        results.push({
          filename: file.getName(),
          evaluation: "Unsupported or empty file type for evaluation."
        });
        saveToSheet(file.getName(), "Skipped: Not supported", "Skipped");
      }
    }

    return results;

  } catch (e) {
    Logger.log("Error: " + e.toString());
    saveToSheet("Unknown", e.toString(), "Error");
    throw new Error("Processing failed: " + e.message);
  }
}

function extractTextFromPdf(file) {
  try {
    const blob = file.getBlob();
    return blob.getDataAsString();
  } catch (e) {
    return "";
  }
}

function extractTextFromDocx(file) {
  try {
    const docFile = DriveApp.getFileById(file.getId());
    const converted = Drive.Files.copy({}, docFile.getId(), {
      convert: true
    });
    const doc = DocumentApp.openById(converted.id);
    return doc.getBody().getText();
  } catch (e) {
    return "[Error extracting Word content]";
  }
}

function extractTextFromExcel(file) {
  try {
    const sheetFile = DriveApp.getFileById(file.getId());
    const converted = Drive.Files.copy({}, sheetFile.getId(), {
      convert: true
    });
    const ss = SpreadsheetApp.openById(converted.id);
    let allText = "";

    const sheets = ss.getSheets();
    for (const s of sheets) {
      const data = s.getDataRange().getValues();
      data.forEach(row => {
        allText += row.join(' ') + '\n';
      });
    }
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
    contents: [{
      parts: [{ text: fullPrompt }]
    }]
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
    return responseData.candidates[0].content.parts[0].text || "No response from Gemini.";
  } catch (e) {
    return "Gemini API error: " + e.message;
  }
}

function saveToSheet(name, evaluation, status) {
  const sheetId = getIdFromUrl(SHEET_URL);
  const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
  sheet.appendRow([new Date(), name, evaluation, status]);
}
