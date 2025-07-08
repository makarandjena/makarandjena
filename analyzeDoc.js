const AdmZip = require('adm-zip');

function analyzeDocumentation(zipPath) {
  const zip = new AdmZip(zipPath);
  const zipEntries = zip.getEntries();

  let docScore = 0;
  zipEntries.forEach(entry => {
    const name = entry.entryName.toLowerCase();
    if (name.includes('readme') || name.endsWith('.md') || name.includes('doc')) {
      const content = zip.readAsText(entry);
      const wordCount = content.split(/\s+/).length;
      if (wordCount > 300) docScore += 3;
      else if (wordCount > 100) docScore += 2;
      else docScore += 1;
    }
  });

  let rating = 'Not Satisfactory';
  if (docScore >= 5) rating = 'Good';
  else if (docScore >= 3) rating = 'Fair';
  else if (docScore >= 2) rating = 'Satisfactory';

  return rating;
}

module.exports = { analyzeDocumentation };
