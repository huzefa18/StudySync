const Chunk = require('../src/models/Chunk');

const getOrCreateChromaCollection = async () => {
    return true; // No-op, not needed for MongoDB storage
};

const addChunks = async (entries) => {
    try {
        const chunks = entries.map(e => ({
            documentId: e.metadata.documentId,
            text: e.text,
            vector: e.vector,
            chunkIndex: e.metadata.chunkIndex
        }));
        await Chunk.insertMany(chunks);
        console.log(`✅ Chunks added to MongoDB: ${chunks.length}`);
    } catch (err) {
        console.error('Error adding chunks to MongoDB:', err);
        throw err;
    }
};

const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

const searchQuery = async (queryVector, topK = 5, documentId = null) => {
    try {
        const filter = {};
        if (documentId) {
            filter.documentId = documentId;
        }
        
        const chunks = await Chunk.find(filter);
        
        const scoredChunks = chunks.map(chunk => {
            const sim = cosineSimilarity(queryVector, chunk.vector);
            return {
                id: chunk._id.toString(),
                text: chunk.text,
                metadata: {
                    documentId: chunk.documentId,
                    chunkIndex: chunk.chunkIndex
                },
                distance: 1 - sim // Cosine distance (1 - similarity)
            };
        });
        
        // Sort by distance ascending (closest first)
        scoredChunks.sort((a, b) => a.distance - b.distance);
        
        return scoredChunks.slice(0, topK);
    } catch (err) {
        console.error('Error searching chunks in MongoDB:', err);
        throw err;
    }
};

const deleteDocumentChunks = async (documentId) => {
    try {
        await Chunk.deleteMany({ documentId });
        console.log(`🗑️ Deleted chunks for document ${documentId} from MongoDB`);
    } catch (err) {
        console.error('Error deleting chunks from MongoDB:', err);
        throw err;
    }
};

module.exports = { getOrCreateChromaCollection, addChunks, searchQuery, deleteDocumentChunks };