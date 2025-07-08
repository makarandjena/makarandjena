import React, { useState } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';

function App() {
  const [file, setFile] = useState(null);
  const [details, setDetails] = useState({
    internId: '',
    internName: '',
    domainName: '',
  });
  const [analysisResult, setAnalysisResult] = useState('');

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('zipFile', file);
    Object.entries(details).forEach(([key, val]) => formData.append(key, val));

    const res = await axios.post('https://project-evaluation.netlify.app', formData);
    setAnalysisResult(res.data.analysis);
  };

  const saveToSheet = async () => {
    await axios.post('https://project-evaluation.netlify.app/save-to-sheet', {
      ...details,
      analysis: analysisResult,
    });
    alert('Saved to Google Sheet!');
  };

  const printReport = () => {
    const doc = new jsPDF();
    doc.text(`Intern ID: ${details.internId}`, 10, 10);
    doc.text(`Intern Name: ${details.internName}`, 10, 20);
    doc.text(`Domain Name: ${details.domainName}`, 10, 30);
    doc.text(`Evaluation: ${analysisResult}`, 10, 40);
    doc.save('Evaluation_Report.pdf');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Project Evaluation Tool</h2>
      <input type="text" name="internId" placeholder="Intern ID" onChange={handleChange} />
      <input type="text" name="internName" placeholder="Intern Name" onChange={handleChange} />
      <input type="text" name="domainName" placeholder="Domain Name" onChange={handleChange} />
      <br /><br />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleUpload}>Scan & Analyze</button>
      {analysisResult && <p>Analysis Result: <strong>{analysisResult}</strong></p>}
      <button onClick={saveToSheet}>Save details to Google Sheet</button>
      <button onClick={printReport}>Print the Report</button>
    </div>
  );
}

export default App;
