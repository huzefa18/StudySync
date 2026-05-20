const { GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai');
require('dotenv').config();
const embeddings= new GoogleGenerativeAIEmbeddings({
    model:'gemini-embedding-001',
    apikey: process.env.GOOGLE_API_KEY
})

const getEmbedding=async(text)=>{
    try{
        if (!text || typeof text !== 'string') 
            {
                 throw new Error(`Invalid input: expected string, got ${typeof text}`);
            }
        const result=await embeddings.embedQuery(text);
        return result;
    }
    catch(err)
    {
        console.log('eror embedding text',err);
        throw err;
    }
}
const getEmbeddings=(texts)=>
{
    try{
         const validTexts = texts
      .filter(t => t !== null && t !== undefined)           // Remove null/undefined
      .filter(t => typeof t === 'string')                    // Must be string
      .filter(t => t.trim().length > 0);                     // Must not be empty
    
    if (validTexts.length === 0) {
      throw new Error('No valid texts to embed');
    }
    
    if (validTexts.length !== texts.length) {
      console.warn(`⚠️ Filtered out ${texts.length - validTexts.length} invalid chunks`);
    }
        const vecctors=embeddings.embedDocuments(texts);
        return vecctors;
    }
    catch(err)
    {
        console.log('error embedding mutlitple texts',err);
        throw err;
    }
}
// Temporary test (remove before production)
// const test = async () => {
//   const vector = await getEmbedding("The mitochondria is the powerhouse of the cell");
//   console.log("Vector length:", vector.length);  // Should be 768
//   console.log("First 5 numbers:", vector.slice(0, 5));
//   console.log("Last 5 numbers:", vector.slice(-5));
// };

// Only run if called directly
if (require.main === module) {
  test();
}
module.exports={getEmbedding,getEmbeddings,embeddings}