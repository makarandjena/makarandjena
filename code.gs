var folderId = '1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A'; // Replace with your Google Drive Folder ID
var geminiApiKey = 'AIzaSyDemXqxd-FSgbT8kOfa4Y5c4_eyMjfodCY'; // Replace with your Gemini API Key
var sheetName = 'Project Evaluation New App';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function uploadZipFile(formObject) {
  var blob = formObject.zipFile;
  var file = DriveApp.getFolderById(folderId).createFile(blob);
  var unzippedFiles = Utilities.unzip(blob);
  var details = {
    internId: '',
    internName: '',
    domain: '',
    docQuality: '',
    extractedFiles: []
  };

  var subfolder = DriveApp.getFolderById(folderId).createFolder(blob.getName().replace('.zip', ''));
  var combinedText = '';

  unzippedFiles.forEach(function(file) {
    var uploadedFile = subfolder.createFile(file);
    details.extractedFiles.push(uploadedFile.getName());

    if (file.getContentType().includes('text')) {
      var content = file.getDataAsString();
      combinedText += content + '\n';
    }
  });

  var analysis = callGeminiAPI(combinedText);
  details.internId = analysis.internId || '';
  details.internName = analysis.internName || '';
  details.domain = analysis.domain || '';
  details.docQuality = analysis.docQuality || 'Unknown';

  return details;
}

function callGeminiAPI(content) {
  var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + geminiApiKey;
  var payload = {
    contents: [{
      parts: [{
        text: "Analyze the following documentation text and return a JSON object with the following structure:\n\n{\n  \"internId\": \"\",\n  \"internName\": \"\",\n  \"domain\": \"\",\n  \"docQuality\": \"Not Satisfactory / Satisfactory / Fair / Good / Excellent\"\n}\n\nText:\n" + content
      }]
    }]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var result = JSON.parse(response.getContentText());

  try {
    var geminiText = result.candidates[0].content.parts[0].text;
    return JSON.parse(geminiText);
  } catch (e) {
    return {
      internId: '',
      internName: '',
      domain: '',
      docQuality: 'Unable to evaluate'
    };
  }
}

function saveToSheet(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(sheetName);
    sheet.appendRow(["Intern ID", "Name", "Domain Name"]);
  }
  sheet.appendRow([data.internId, data.internName, data.domain]);
  return true;
}
