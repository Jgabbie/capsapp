import mongoose from 'mongoose';

const KnowledgeChunkSchema = new mongoose.Schema(
    {
        text: { type: String, required: true },
        embedding: { type: [Number], required: true },
        source: { type: String, default: 'unknown' },
        page: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// 🔥 Using the exact collection name from your web app so they share data
const KnowledgeChunk = mongoose.model('knowledge_chunks', KnowledgeChunkSchema);

export default KnowledgeChunk;