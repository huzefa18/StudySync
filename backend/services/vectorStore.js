const { ChromaClient } = require('chromadb');
require('dotenv').config();

const chromaClient = new ChromaClient({
    path: process.env.CHROMADB_URL || process.env.CHROMA_URL || 'http://localhost:8000'
});

const COLLECTION_NAME = 'studySync';

const noOpEmbeddingFn = {
    generate: async (texts) => texts.map(() => [])
};

const getOrCreateChromaCollection = async () => {
    return await chromaClient.getOrCreateCollection({
        name: COLLECTION_NAME,
        embeddingFunction: noOpEmbeddingFn,
        metadata: { description: 'StudySync vector store' }
    });
};

const addChunks = async (entries) => {
    const collection = await getOrCreateChromaCollection();
    await collection.add({
        ids: entries.map(e => e.id),
        embeddings: entries.map(e => e.vector),
        documents: entries.map(e => e.text),
        metadatas: entries.map(e => e.metadata)
    });
    console.log(`✅ Chunks added to Chroma: ${entries.length}`);
};

const searchQuery = async (queryVector, topK = 5, documentId = null) => {
    const collection = await getOrCreateChromaCollection();
    const queryOptions = {
        queryEmbeddings: [queryVector],
        nResults: topK
    };
    if (documentId) {
        queryOptions.where = { documentId: documentId.toString() };
    }
    const results = await collection.query(queryOptions);
    console.log(`🔍 Search results: ${results.ids[0].length} found`);
    return results.ids[0].map((id, i) => ({
        id,
        text: results.documents[0][i],
        metadata: results.metadatas[0][i],
        distance: results.distances[0][i]
    }));
};

const deleteDocumentChunks = async (documentId) => {
    const collection = await getOrCreateChromaCollection();
    const all = await collection.get();
    const idsToDelete = all.ids.filter((_, i) => all.metadatas[i].documentId === documentId.toString());
    if (idsToDelete.length > 0) {
        await collection.delete({ ids: idsToDelete });
        console.log(`🗑️ Deleted ${idsToDelete.length} chunks for document ${documentId}`);
    }
};

module.exports = { getOrCreateChromaCollection, addChunks, searchQuery, deleteDocumentChunks };