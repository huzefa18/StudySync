require('dotenv').config();

const {GoogleGenAI} = require('@google/genai');

const ai=new GoogleGenAI({
    apiKey:process.env.GOOGLE_API_KEY,
});

const generateAnswer=async(question,chunks)=>{

    try{
        const context=chunks.map((chunk,i)=>
        
            `[source ${i+1} from ${chunk.metadata.documentName}]:${chunk.text}`

        ).join('\n\n ----- \n\n');

        const prompt=`You are StudySync, a helpful study assistant. Answer the student's question using ONLY the provided context from their uploaded documents.

If the context doesn't contain enough information, say: "I don't have enough information in your uploaded documents to answer this. Try uploading more relevant materials."

Be concise but thorough. Use bullet points for clarity. Cite which source you're using.

CONTEXT:
${context}

STUDENT QUESTION: ${question}

YOUR ANSWER:`;
        console.log('🤖 Asking Gemini...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
            });
        console.log('✅ Received answer from Gemini');
        return response.text;
    }
    catch(err)
    {
        console.error('Error generating answer with Gemini:', err);
        throw err;
    }
}
module.exports={generateAnswer}