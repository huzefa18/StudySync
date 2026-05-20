const { Metadata } = require('pdf-parse');
const {chunkText}=require('./chunker');
const {getEmbeddings}=require('./embedding');
const{addChunks}=require('./vectorStore');

const indexDcoument=async(document)=>{

    try {const chunks=chunkText(document.extractedText);
    console.log(`Document ${document.fileName} split into ${chunks.length} chunks`);

    const vectors=await getEmbeddings(chunks);
    console.log(`Embeddings generated for ${chunks.length} chunks of document ${document.fileName}`);

    const entries=chunks.map((chunk,i)=>
    ({
        id:`${document._id}_chunk${i}`,
        text:chunk,
        vector:vectors[i],
        metadata:{
            documentId:document._id.toString(),
            documentName:document.fileName,
            chunkIndex:i,
            chunkLength:chunk.length
        }

    }));
    
    await addChunks(entries);
    console.log(`Document ${document.fileName} indexed with ${entries.length} chunks in vector store`);
    return entries.length;
}
catch(err)
{
    console.error(`Error indexing document ${document.fileName}:`, err);
    throw err;
};
};
module.exports={indexDcoument}