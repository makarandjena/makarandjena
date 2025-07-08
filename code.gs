const SHEET_NAME = 'Sheet1'; // Change if needed

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index');
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = JSON.parse(e.postData.contents);

  const { internId, internName, domainName, analysis } = data;

  sheet.appendRow([internId, internName, domainName, analysis, new Date()]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'Success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
