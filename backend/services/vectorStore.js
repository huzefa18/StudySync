const { ChromaClient } = require('chromadb');
require('dotenv').config();

let chromaPath = process.env.CHROMADB_URL || process.env.CHROMA_URL || 'http://localhost:8000';
if (chromaPath && !chromaPath.startsWith('http://') && !chromaPath.startsWith('https://')) {
    chromaPath = `https://${chromaPath}`;
}

let clientConfig = {};
try {
    const url = new URL(chromaPath);
    clientConfig = {
        host: url.hostname,
        port: url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80),
        ssl: url.protocol === 'https:'
    };
} catch (e) {
    clientConfig = { path: chromaPath };
}

const chromaClient = new ChromaClient(clientConfig);


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