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


const retry = async (fn, retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const errName = err.name || '';
            const errMsg = err.message || '';
            const isTransient = errName.includes('RateLimit') || 
                                errName.includes('LimitExceeded') ||
                                errMsg.includes('502') || 
                                errMsg.includes('503') || 
                                errMsg.includes('429') ||
                                errMsg.includes('fetch');
            if (isTransient && i < retries - 1) {
                console.warn(`⚠️ Chroma transient issue (attempt ${i + 1}/${retries}): ${errName || errMsg}. Retrying in ${delay}ms...`);
                await new Promise(res => setTimeout(res, delay));
                continue;
            }
            throw err;
        }
    }
};

const COLLECTION_NAME = 'studySync';

const noOpEmbeddingFn = {
    generate: async (texts) => texts.map(() => [])
};

const getOrCreateChromaCollection = async () => {
    return await retry(async () => {
        return await chromaClient.getOrCreateCollection({
            name: COLLECTION_NAME,
            embeddingFunction: noOpEmbeddingFn,
            metadata: { description: 'StudySync vector store' }
        });
    });
};

const addChunks = async (entries) => {
    await retry(async () => {
        const collection = await getOrCreateChromaCollection();
        await collection.add({
            ids: entries.map(e => e.id),
            embeddings: entries.map(e => e.vector),
            documents: entries.map(e => e.text),
            metadatas: entries.map(e => e.metadata)
        });
        console.log(`✅ Chunks added to Chroma: ${entries.length}`);
    });
};

const searchQuery = async (queryVector, topK = 5, documentId = null) => {
    return await retry(async () => {
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
    });
};

const deleteDocumentChunks = async (documentId) => {
    await retry(async () => {
        const collection = await getOrCreateChromaCollection();
        const all = await collection.get();
        if (!all || !all.ids || all.ids.length === 0) return;
        
        const idsToDelete = all.ids.filter((_, i) => {
            const meta = all.metadatas ? all.metadatas[i] : null;
            return meta && meta.documentId && meta.documentId.toString() === documentId.toString();
        });
        
        if (idsToDelete.length > 0) {
            await collection.delete({ ids: idsToDelete });
            console.log(`🗑️ Deleted ${idsToDelete.length} chunks for document ${documentId}`);
        }
    });
};

module.exports = { getOrCreateChromaCollection, addChunks, searchQuery, deleteDocumentChunks };