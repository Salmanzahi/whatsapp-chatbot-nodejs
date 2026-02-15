import fs from "fs";
import path from "path";

/**
 * Local Vector Store using JSON file persistence
 */
export class LocalVectorStore {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = { ids: [], embeddings: [], documents: [], metadatas: [] };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, "utf-8");
        this.data = JSON.parse(content);
      }
    } catch (error) {
      console.log(`[VectorStore] Creating new store: ${this.filePath}`);
      this.data = { ids: [], embeddings: [], documents: [], metadatas: [] };
    }
  }

  save() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  add({ embeddings, documents, metadatas, ids }) {
    for (let i = 0; i < ids.length; i++) {
      this.data.ids.push(ids[i]);
      this.data.embeddings.push(embeddings[i]);
      this.data.documents.push(documents[i]);
      this.data.metadatas.push(metadatas[i] || {});
    }
    this.save();
  }

  query({ queryEmbeddings, nResults = 3 }) {
    const queryEmb = queryEmbeddings[0];
    const scores = [];

    for (let i = 0; i < this.data.embeddings.length; i++) {
      const similarity = cosineSimilarity(queryEmb, this.data.embeddings[i]);
      scores.push({ index: i, score: similarity });
    }

    // Sort by similarity (highest first)
    scores.sort((a, b) => b.score - a.score);
    const topK = scores.slice(0, nResults);

    const results = {
      ids: [topK.map((s) => this.data.ids[s.index])],
      documents: [topK.map((s) => this.data.documents[s.index])],
      metadatas: [topK.map((s) => this.data.metadatas[s.index])],
      distances: [topK.map((s) => 1 - s.score)], // Convert similarity to distance
    };

    return results;
  }

  get(options = {}) {
    const where = options.where;

    if (!where) {
      return {
        ids: this.data.ids,
        documents: this.data.documents,
        metadatas: this.data.metadatas,
      };
    }

    // Simple where filter
    const filtered = { ids: [], documents: [], metadatas: [] };
    for (let i = 0; i < this.data.ids.length; i++) {
      let match = true;
      for (const [key, condition] of Object.entries(where)) {
        if (typeof condition === "object" && condition.$ne !== undefined) {
          if (this.data.metadatas[i][key] === condition.$ne) {
            match = false;
            break;
          }
        } else if (this.data.metadatas[i][key] !== condition) {
          match = false;
          break;
        }
      }
      if (match) {
        filtered.ids.push(this.data.ids[i]);
        filtered.documents.push(this.data.documents[i]);
        filtered.metadatas.push(this.data.metadatas[i]);
      }
    }
    return filtered;
  }

  delete({ ids }) {
    for (const id of ids) {
      const index = this.data.ids.indexOf(id);
      if (index > -1) {
        this.data.ids.splice(index, 1);
        this.data.embeddings.splice(index, 1);
        this.data.documents.splice(index, 1);
        this.data.metadatas.splice(index, 1);
      }
    }
    this.save();
  }

  count() {
    return this.data.ids.length;
  }
}

export function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
