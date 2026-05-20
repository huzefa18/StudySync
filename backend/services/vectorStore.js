// services/vectorStore.js

const { ChromaClient } = require('chromadb');
require('dotenv').config();


const chromaClient = new ChromaClient({
    path: 'http://localhost:8000'
});

const COLLECTION_NAME = 'studySync';

const getOrCreateChromaCollection = async () => {
    try {
        const collection = await chromaClient.getCollection({
            name: COLLECTION_NAME
        });
        console.log('📦 Collection found:', COLLECTION_NAME);
        return collection;
    }
    catch (err) {
        console.log('📦 Creating collection:', COLLECTION_NAME);
        
        // USE CHROMA CLIENT, NOT MONGOOSE:
        const newCollection = await chromaClient.createCollection({
            name: COLLECTION_NAME,
            metadata: { description: 'Collection for StudySync app' }
        });

        console.log('✅ Collection created:', COLLECTION_NAME);
        return newCollection;
    }
};

const addChunks = async (entries) => {
    const collection = await getOrCreateChromaCollection();
    
    const ids = entries.map(e => e.id);
    const embeddings = entries.map(e => e.vector);
    const documents = entries.map(e => e.text);
    const metadatas = entries.map(e => e.metadata);

    await collection.add({
        ids: ids,
        embeddings: embeddings,
        documents: documents,
        metadatas: metadatas
    });
    
    console.log('✅ Chunks added to Chroma:', entries.length);
};

const searchQuery = async (queryVector, topK = 5) => {
    const collection = await getOrCreateChromaCollection();
    
    const results = await collection.query({
        queryEmbeddings: [queryVector],
        nResults: topK
    });
    
    console.log('🔍 Search results:', results.ids[0].length, 'found');
    
    return results.ids[0].map((id, i) => ({
        id: id,
        text: results.documents[0][i],
        metadata: results.metadatas[0][i],
        distance: results.distances[0][i]
    }));
};

const deleteDocumentChunks = async (documentId) => {
    const collection = await getOrCreateChromaCollection();
    const all = await collection.get();

    const idsToDelete = [];

    for (let i = 0; i < all.ids.length; i++) {
        if (all.metadatas[i].documentId === documentId) {
            idsToDelete.push(all.ids[i]);
        }
    }
    
    if (idsToDelete.length > 0) {
        await collection.delete({ ids: idsToDelete });
        console.log(`🗑️ Deleted ${idsToDelete.length} chunks for document ${documentId}`);
    }
};

module.exports = { getOrCreateChromaCollection, addChunks, searchQuery, deleteDocumentChunks };