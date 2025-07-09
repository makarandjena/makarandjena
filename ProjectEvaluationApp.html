import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ProjectEvaluationApp() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);

    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      body: form,
    });

    const data = await res.json();
    setAnalysis(data);
    setLoading(false);
  };

  const handleSaveToSheet = async () => {
    await fetch('/.netlify/functions/save-to-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis }),
    });
  };

  const handlePrint = () => window.print();

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Project Evaluation</h1>
      <input type="file" accept=".zip" onChange={handleFileChange} className="mb-4" />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </Button>

      {analysis && (
        <div className="mt-6 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Analysis</h2>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleSaveToSheet}>Save to Google Sheet</Button>
            <Button onClick={handlePrint}>Print</Button>
          </div>
        </div>
      )}
    </div>
  );
}
