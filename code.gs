// ======= CONFIG =======
const FOLDER_ID = "1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A";
const SHEET_ID = "145qozjhpfOUM77tfv49b2gN-lBvmi6CqMvKv6eRDLMs";  // Optional, not used in this base version

// ======= DO GET =======
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ======= INCLUDE HTML PARTIALS IF NEEDED =======
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ======= UPLOAD AND EXTRACT ZIP =======
function uploadAndExtractZip(base64Zip, filename) {
  try {
    const blob = Utilities.newBlob(Utilities.base64Decode(base64Zip), 'application/zip', filename);
    const folder = DriveApp.getFolderById(FOLDER_ID);
    const zipFiles = Utilities.unzip(blob);

    let fileNames = [];
    zipFiles.forEach(fileBlob => {
      const createdFile = folder.createFile(fileBlob);
      fileNames.push(createdFile.getName());
    });

    return {
      success: true,
      message: "ZIP extracted successfully.",
      files: fileNames
    };
  } catch (error) {
    return {
      success: false,
      message: "Error: " + error.message
    };
  }
}
