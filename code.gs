// Backend Script (Apps Script)

var folderId = '1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A'; // Replace with your Google Drive folder ID
var sheetName = 'Project Evaluation New App'; // Your Google Sheet name

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
  
  // Create a subfolder for the extracted contents
  var subfolder = DriveApp.getFolderById(folderId).createFolder(blob.getName().replace('.zip', ''));

  unzippedFiles.forEach(function(file) {
    var uploadedFile = subfolder.createFile(file);
    details.extractedFiles.push(uploadedFile.getName());

    if (file.getContentType().includes('text')) {
      var content = file.getDataAsString();

      // Extracting values assuming a specific format
      var idMatch = content.match(/Intern ID[:\-]?\s*(\w+)/i);
      var nameMatch = content.match(/Name[:\-]?\s*(.+)/i);
      var domainMatch = content.match(/Domain[:\-]?\s*(.+)/i);

      if (idMatch) details.internId = idMatch[1];
      if (nameMatch) details.internName = nameMatch[1];
      if (domainMatch) details.domain = domainMatch[1];

      // Evaluate document quality (naive heuristic example)
      var wordCount = content.split(/\s+/).length;
      if (wordCount < 200) {
        details.docQuality = "Not Satisfactory";
      } else if (wordCount < 400) {
        details.docQuality = "Satisfactory";
      } else if (wordCount < 600) {
        details.docQuality = "Fair";
      } else if (wordCount < 800) {
        details.docQuality = "Good";
      } else {
        details.docQuality = "Excellent";
      }
    }
  });

  return details;
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
