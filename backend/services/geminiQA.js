require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const generateAnswer = async (question, chunks, history = []) => {
  try {
    const context = chunks
      .map((chunk, i) => `[Source ${i + 1} from "${chunk.metadata.documentName}"]: ${chunk.text}`)
      .join('\n\n-----\n\n');

    const historyText = history.length > 0
      ? history.map(m => `${m.role === 'user' ? 'Student' : 'StudySync'}: ${m.text}`).join('\n')
      : '';

    const prompt = `You are StudySync, a helpful and precise study assistant. Answer the student's question using ONLY the context provided from their uploaded documents.

If the context does not have enough information, say: "I don't have enough information in your uploaded documents to answer this."

Be concise. Use bullet points for lists. Cite which source you used.
${historyText ? `\nPREVIOUS CONVERSATION:\n${historyText}\n` : ''}
DOCUMENT CONTEXT:
${context}

STUDENT QUESTION: ${question}

YOUR ANSWER:`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt
    });

    const text =
      response?.text ||
      response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I was unable to generate a response. Please try again.';

    return text;
  } catch (err) {
    console.error('Gemini error:', err);
    throw err;
  }
};

module.exports = { generateAnswer };