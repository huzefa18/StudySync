const fs = require('fs');
const path = require('path');

const extractTextFromPDF = async (filePath) => {
  try {
    const fullPath = path.resolve(filePath);  
    const fileBuffer = fs.readFileSync(fullPath);
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(fileBuffer) });
    const pdf = await loadingTask.promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      fullText += textContent.items.map((item) => item.str).join(' ') + '\n';
    }

    return fullText;
  } catch (err) {
    console.error('PDF extraction failed:', err.message);
    throw new Error('Could not extract text from PDF');
  }
};

module.exports = extractTextFromPDF;