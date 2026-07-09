const { getEmbedding } = require('../services/embedding');
const { searchQuery } = require('../services/vectorStore');

const findRelevantChunks = async (query, topK = 5, documentId = null) => {
  try {
    console.log(`🔍 Searching for query: "${query}"${documentId ? ` in doc ${documentId}` : ''}`);
    const queryVector = await getEmbedding(query);
    const results = await searchQuery(queryVector, topK, documentId);
    console.log(`Found ${results.length} relevant chunks for query: "${query}"`);
    return results;
  } catch (err) {
    console.log(`Error during search for query "${query}":`, err);
    throw err;
  }
};

module.exports = { findRelevantChunks };