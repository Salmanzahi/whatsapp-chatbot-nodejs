/**
 * RAG System - Retrieval-Augmented Generation
 * Uses local JSON file for vector storage with OpenRouter embeddings
 * (ChromaDB JS requires a server, so we use a simpler local approach)
 */
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { OpenRouterClient, MODELS } from "./openRouterClient.js";
import {
  LocalVectorStore,
  cosineSimilarity,
} from "../vector_db/localVectorStore.js";

// Configuration
const ROLLING_WINDOW_THRESHOLD = 10;
const ROLLING_WINDOW_MODE = false;
const INCLUDE_DOCS_RAG = true;
const INCLUDE_CONVS_RAG = true;

// /**
//  * Local Vector Store using JSON file persistence
//  */
// class LocalVectorStore {
//   constructor(filePath) {
//     this.filePath = filePath;
//     this.data = { ids: [], embeddings: [], documents: [], metadatas: [] };
//     this.load();
//   }

//   load() {
//     try {
//       if (fs.existsSync(this.filePath)) {
//         const content = fs.readFileSync(this.filePath, "utf-8");
//         this.data = JSON.parse(content);
//       }
//     } catch (error) {
//       console.log(`[VectorStore] Creating new store: ${this.filePath}`);
//       this.data = { ids: [], embeddings: [], documents: [], metadatas: [] };
//     }
//   }

//   save() {
//     const dir = path.dirname(this.filePath);
//     if (!fs.existsSync(dir)) {
//       fs.mkdirSync(dir, { recursive: true });
//     }
//     fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
//   }

//   add({ embeddings, documents, metadatas, ids }) {
//     for (let i = 0; i < ids.length; i++) {
//       this.data.ids.push(ids[i]);
//       this.data.embeddings.push(embeddings[i]);
//       this.data.documents.push(documents[i]);
//       this.data.metadatas.push(metadatas[i] || {});
//     }
//     this.save();
//   }

//   query({ queryEmbeddings, nResults = 3 }) {
//     const queryEmb = queryEmbeddings[0];
//     const scores = [];

//     for (let i = 0; i < this.data.embeddings.length; i++) {
//       const similarity = cosineSimilarity(queryEmb, this.data.embeddings[i]);
//       scores.push({ index: i, score: similarity });
//     }

//     // Sort by similarity (highest first)
//     scores.sort((a, b) => b.score - a.score);
//     const topK = scores.slice(0, nResults);

//     const results = {
//       ids: [topK.map((s) => this.data.ids[s.index])],
//       documents: [topK.map((s) => this.data.documents[s.index])],
//       metadatas: [topK.map((s) => this.data.metadatas[s.index])],
//       distances: [topK.map((s) => 1 - s.score)], // Convert similarity to distance
//     };

//     return results;
//   }

//   get(options = {}) {
//     const where = options.where;

//     if (!where) {
//       return {
//         ids: this.data.ids,
//         documents: this.data.documents,
//         metadatas: this.data.metadatas,
//       };
//     }

//     // Simple where filter
//     const filtered = { ids: [], documents: [], metadatas: [] };
//     for (let i = 0; i < this.data.ids.length; i++) {
//       let match = true;
//       for (const [key, condition] of Object.entries(where)) {
//         if (typeof condition === "object" && condition.$ne !== undefined) {
//           if (this.data.metadatas[i][key] === condition.$ne) {
//             match = false;
//             break;
//           }
//         } else if (this.data.metadatas[i][key] !== condition) {
//           match = false;
//           break;
//         }
//       }
//       if (match) {
//         filtered.ids.push(this.data.ids[i]);
//         filtered.documents.push(this.data.documents[i]);
//         filtered.metadatas.push(this.data.metadatas[i]);
//       }
//     }
//     return filtered;
//   }

//   delete({ ids }) {
//     for (const id of ids) {
//       const index = this.data.ids.indexOf(id);
//       if (index > -1) {
//         this.data.ids.splice(index, 1);
//         this.data.embeddings.splice(index, 1);
//         this.data.documents.splice(index, 1);
//         this.data.metadatas.splice(index, 1);
//       }
//     }
//     this.save();
//   }

//   count() {
//     return this.data.ids.length;
//   }
// }

/**
 * RAG System using local vector storage
 * and semantic search over documents and past conversations
 */
export class RAGSystem {
  constructor(persistDirectory = "../vector_db/localVectorStore.js") {
    this.persistDirectory = persistDirectory;
    this.documentsCollection = null;
    this.conversationsCollection = null;
    this.aiClient = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Create persist directory if needed
    if (!fs.existsSync(this.persistDirectory)) {
      fs.mkdirSync(this.persistDirectory, { recursive: true });
    }
    // Initialize local vector stores
    this.documentsCollection = new LocalVectorStore(
      path.join(this.persistDirectory, "documents.json"),
    );
    this.conversationsCollection = new LocalVectorStore(
      path.join(this.persistDirectory, "conversations.json"),
    );

    // Initialize OpenRouter client for embeddings
    this.aiClient = new OpenRouterClient();
    console.log("✓ RAG System initialized with local vector storage");
    console.log(`  📁 Storage: ${this.persistDirectory}`);

    this.initialized = true;
  }

  async addDocument(text, metadata = null, docId = null) {
    await this.initialize();

    if (!docId) {
      docId = uuidv4();
    }

    const embedding = await this.aiClient.embedding(text);

    this.documentsCollection.add({
      embeddings: [embedding],
      documents: [text],
      metadatas: [metadata || {}],
      ids: [docId],
    });

    return docId;
  }

  async addConversation(
    userMsg,
    aiMsg,
    sessionId,
    metadata = null,
    modelSelected = MODELS[1],
    maxTokens = 1000,
    rollingWindow = false,
  ) {
    await this.initialize();

    const convId = uuidv4();
    const combinedText = `User: ${userMsg}\nAssistant: ${aiMsg}`;
    const embedding = await this.aiClient.embedding(combinedText);

    const allConvoCount = this.conversationsCollection.count();
    if (rollingWindow && allConvoCount >= ROLLING_WINDOW_THRESHOLD) {
      console.log(
        `🔄 Rolling window triggered: ${allConvoCount} conversations found`,
      );

      try {
        const allConvos = this.conversationsCollection.get({
          where: { type: { $ne: "summary" } },
        });

        const numToSummarize = Math.min(
          Math.floor(ROLLING_WINDOW_THRESHOLD / 2),
          allConvos.ids.length,
        );
        const convoIds = allConvos.ids.slice(0, numToSummarize);
        const convoDocs = allConvos.documents.slice(0, numToSummarize);

        const conversationsText = convoDocs
          .map((doc, i) => `Conversation ${i + 1}:\n${doc}`)
          .join("\n\n");

        const summaryPrompt = `Please create a concise summary of the following conversations:\n\n${conversationsText}\n\nProvide a comprehensive but concise summary.`;
        const [summary] = await this.aiClient.chat(
          summaryPrompt,
          modelSelected,
          maxTokens,
        );
        console.log(`✓ Generated summary of ${numToSummarize} conversations`);

        this.conversationsCollection.delete({ ids: convoIds });
        console.log(`✓ Deleted ${numToSummarize} old conversations`);

        const summaryId = uuidv4();
        const summaryEmbedding = await this.aiClient.embedding(summary);

        this.conversationsCollection.add({
          embeddings: [summaryEmbedding],
          documents: [`SUMMARY: ${summary}`],
          metadatas: [
            {
              session_id: sessionId,
              type: "summary",
              isSummary: true,
              summarized_count: numToSummarize,
              timestamp: new Date().toISOString(),
              ...(metadata || {}),
            },
          ],
          ids: [summaryId],
        });
        console.log(`✓ Stored summary (ID: ${summaryId})`);
      } catch (error) {
        console.log(`⚠ Rolling window summarization failed: ${error.message}`);
      }
    }

    this.conversationsCollection.add({
      embeddings: [embedding],
      documents: [combinedText],
      metadatas: [
        {
          session_id: sessionId,
          type: "conversation",
          user_message: userMsg,
          ai_message: aiMsg,
          isSummary: false,
          ...(metadata || {}),
        },
      ],
      ids: [convId],
    });

    return convId;
  }

  async searchDocuments(query, nResults = 3) {
    await this.initialize();

    if (this.documentsCollection.count() === 0) {
      return [];
    }

    const queryEmbedding = await this.aiClient.embedding(query);
    const results = this.documentsCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    });

    const formattedResults = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        formattedResults.push({
          text: results.documents[0][i],
          metadata: results.metadatas ? results.metadatas[0][i] : {},
          distance: results.distances ? results.distances[0][i] : null,
        });
      }
    }

    console.log(
      `[DEBUG] searchDocuments (k = ${nResults}):`,
      formattedResults.length,
      "results",
    );
    return formattedResults;
  }

  async searchConversations(query, nResults = 3) {
    await this.initialize();

    if (this.conversationsCollection.count() === 0) {
      return [];
    }

    const queryEmbedding = await this.aiClient.embedding(query);
    const results = this.conversationsCollection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: nResults,
    });

    const formattedResults = [];
    if (results.documents && results.documents[0]) {
      for (let i = 0; i < results.documents[0].length; i++) {
        formattedResults.push({
          text: results.documents[0][i],
          metadata: results.metadatas ? results.metadatas[0][i] : {},
          distance: results.distances ? results.distances[0][i] : null,
        });
      }
    }

    console.log(
      `[DEBUG] searchConversations (k = ${nResults}):`,
      formattedResults.length,
      "results",
    );
    return formattedResults;
  }

  async getContextForQuery(query, includeDocs = true, includeConvs = true) {
    await this.initialize();

    const contextParts = [];

    if (includeDocs) {
      const docResults = await this.searchDocuments(query, 2);
      if (docResults.length > 0) {
        contextParts.push("=== Relevant Knowledge ===");
        docResults.forEach((result, i) => {
          contextParts.push(`${i + 1}. ${result.text}`);
        });
      }
    }

    if (includeConvs) {
      const convResults = await this.searchConversations(query, 2);
      if (convResults.length > 0) {
        contextParts.push("\n=== Relevant Past Conversations ===");
        convResults.forEach((result, i) => {
          contextParts.push(`${i + 1}. ${result.text}`);
        });
      }
    }

    return contextParts.length > 0 ? contextParts.join("\n") : "";
  }

  async clearAllData() {
    await this.initialize();

    // Reset collections
    this.documentsCollection = new LocalVectorStore(
      path.join(this.persistDirectory, "documents.json"),
    );
    this.conversationsCollection = new LocalVectorStore(
      path.join(this.persistDirectory, "conversations.json"),
    );
  }
}

export { INCLUDE_DOCS_RAG, INCLUDE_CONVS_RAG, ROLLING_WINDOW_MODE };
export default RAGSystem;
