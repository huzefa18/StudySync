const {getEmbedding} = require('../services/embedding');
const {searchQuery} = require('../services/vectorStore');

const findRelevantChunks = async (query) => {

try{
        console.log(`🔍 Searching for query: "${query}"`);
    const queryVector=await getEmbedding(query);

    const results=await searchQuery(queryVector,5);
    console.log(`Found ${results.length} relevant chunks for query: "${query}"`);

    return results;
}
catch(err){
    console.log(`Error during search for query "${query}":`, err);
    throw err;
}



};
module.exports={findRelevantChunks}