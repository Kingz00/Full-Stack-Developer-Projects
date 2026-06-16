import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// LangChain text splitter
async function splitDocument(document) {
    try {

        const response = await fetch(document);
        // check if fetch request was successful
        if (!response.ok) {
            throw new Error("Network response was not ok.");
        }
        const text = await response.text();

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 250,
            chunkOverlap: 50,
        });
        const output = await splitter.createDocuments([text]);
        return output
    } catch (err) {
        console.error('There was an issue with splitting text')
        throw err;
    }
}

export { splitDocument }