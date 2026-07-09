const Document = require('../models/Document');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const extractTextFromPDF = require('../../services/pdfParser');
const { indexDcoument } = require('../../services/indexer');
const { deleteDocumentChunks } = require('../../services/vectorStore');


const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: documents,
      count: documents.length
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: err.message
    });
  }
};

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate PDF only
    if (req.file.mimetype !== 'application/pdf') {
      await fsPromises.unlink(req.file.path).catch(() => {});
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed'
      });
    }

    const document = await Document.create({
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });

    console.log(`📄 ${document.fileName} uploaded, starting extraction`);

    // Fire-and-forget extraction (non-blocking response)
    extractTextFromPDF(req.file.path)
      .then(async (text) => {
        await Document.findByIdAndUpdate(document._id, {
          extractedText: text,
          processed: true
        });
        console.log(`✅ Text extracted for: ${document.fileName}`);
        const updatedDoc = await Document.findById(document._id);
        await indexDcoument(updatedDoc);
        console.log(`📚 Document indexed: ${document.fileName}`);
      })
      .catch(async (err) => {
        console.error(` Extraction failed for ${document._id}:`, err.message);
        await Document.findByIdAndUpdate(document._id, {
          processed: false,
          extractionError: err.message
        });
      });

    res.status(201).json({
      success: true,
      data: document,
      message: 'File uploaded successfully, processing in background'
    });

  } catch (err) {
    console.error('Upload error:', err);
    // Cleanup file if DB save failed
    if (req.file?.path) {
      await fsPromises.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({
      success: false,
      message: 'Error uploading file',
      error: err.message
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Delete PDF file
    const filePath = path.resolve(document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await deleteDocumentChunks(req.params.id);
    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: err.message
    });
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };