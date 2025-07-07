// ======= CONFIGURATION =======
const DRIVE_FOLDER_ID = "1dCoA9a4Hvo0pi3KWz9nAH04wy3zJ343A";
const SHEET_ID = "145qozjhpfOUM77tfv49b2gN-lBvmi6CqMvKv6eRDLMs";  // Not used directly in this version

// ======= RENDER FRONTEND =======
function doGet() {
  return HtmlService.createHtmlOutputFromFile("index")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ======= HANDLE ZIP UPLOAD & EXTRACTION =======
function uploadAndExtractZip(base64Zip, filename) {
  try {
    const zipBlob = Utilities.newBlob(Utilities.base64Decode(base64Zip), "application/zip", filename);
    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    const extractedFiles = Utilities.unzip(zipBlob);

    const fileNames = [];

    extractedFiles.forEach(blob => {
      const createdFile = folder.createFile(blob);
      fileNames.push(createdFile.getName());
    });

    return {
      success: true,
      message: "ZIP file extracted successfully!",
      files: fileNames
    };
  } catch (err) {
    return {
      success: false,
      message: "Extraction failed: " + err.message
    };
  }
}
