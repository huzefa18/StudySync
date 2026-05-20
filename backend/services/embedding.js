const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

const EMBEDDING_MODEL = 'gemini-embedding-001';

const getEmbedding = async (text) => {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error(`Invalid input: expected string, got ${typeof text}`);
    }

    const result = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
    });

    return result.embeddings[0].values;
  } catch (err) {
    console.error('Error embedding text:', err.message);
    throw err;
  }
};

const getEmbeddings = async (texts) => {
  try {
    const validTexts = texts
      .filter(t => t !== null && t !== undefined)
      .filter(t => typeof t === 'string')
      .filter(t => t.trim().length > 0);

    if (validTexts.length === 0) {
      throw new Error('No valid texts to embed');
    }

    if (validTexts.length !== texts.length) {
      console.warn(`Filtered out ${texts.length - validTexts.length} invalid chunks`);
    }

    const vectors = [];
    for (const text of validTexts) {
      const result = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
      });
      vectors.push(result.embeddings[0].values);
    }

    return vectors;
  } catch (err) {
    console.error('Error embedding multiple texts:', err.message);
    throw err;
  }
};

module.exports = { getEmbedding, getEmbeddings };