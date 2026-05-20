const fs = require('fs').promises;
const path = require('path');
const { pdf } = require('pdf-to-img');

const processPDF = async (filePath, documentId) => {
  try {
    const fullPath = path.resolve(filePath);
    
    // Create image directory
    const imageDir = path.join('uploads', 'images', documentId.toString());
    await fs.mkdir(imageDir, { recursive: true });
    
    // Convert PDF to images (pure JS, no system deps)
    const document = await pdf(fullPath, { scale: 1.5 });
    
    const pages = [];
    let fullText = '';
    let pageNum = 1;
    
    for await (const image of document) {
      // Save image
      const imagePath = path.join(imageDir, `page-${pageNum}.png`);
      await fs.writeFile(imagePath, image);
      
      // For text, we still need pdfjs-dist
      pages.push({
        pageNumber: pageNum,
        text: '', // Will fill separately
        hasDiagram: false,
        imagePath
      });
      
      pageNum++;
    }
    
    // Now extract text with pdfjs-dist
    const fileBuffer = await fs.readFile(fullPath);
    const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfDoc = await getDocument({ data: new Uint8Array(fileBuffer) }).promise;
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      
      fullText += pageText + '\n\n';
      
      if (pages[i - 1]) {
        pages[i - 1].text = pageText;
        const wordCount = pageText.trim().split(/\s+/).filter(w => w.length > 0).length;
        pages[i - 1].hasDiagram = wordCount < 100;
      }
    }
    
    return {
      fullText,
      pages,
      hasDiagrams: pages.some(p => p.hasDiagram)
    };
    
  } catch (err) {
    console.error('PDF processing failed:', err.message);
    console.error('Stack:', err.stack);
    throw err;
  }
};

module.exports = processPDF;