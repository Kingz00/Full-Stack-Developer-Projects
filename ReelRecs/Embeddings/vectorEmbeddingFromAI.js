import { openai } from "../config.js";

async function vectorEmbeddingFromAI(query) {
    try {
        // Create an embedding vector representing the query
        const embedding = await openai.embeddings.create({
            model: "text-embedding-ada-002",
            input: query,
        });

        return embedding
    } catch (err) {
        console.error("vectorEmbeddingFromAI ERROR:" + err)
        throw err;
    }
}

export { vectorEmbeddingFromAI }