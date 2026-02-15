/**
 * Chatbot Service - Facade for RAG + AI
 * Converted from Python RAGChatbot class and app.py logic
 * Handles all AI modes without needing a bridge
 */
import { v4 as uuidv4 } from "uuid";
import { OpenRouterClient, MODELS } from "./openRouterClient.js";
import {
  RAGSystem,
  INCLUDE_DOCS_RAG,
  INCLUDE_CONVS_RAG,
  ROLLING_WINDOW_MODE,
} from "./ragSystem.js";

// Configuration
const MAX_TOKENS = 5000;

/**
 * RAG-powered chatbot with conversation memory
 * Combines OpenRouter AI and vector search
 */
export class ChatbotService {
  constructor() {
    this.aiClient = null;
    this.rag = null;
    this.sessionId = uuidv4();
    this.conversationHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize the chatbot service
   */
  async initialize() {
    if (this.initialized) return;

    console.log("Initializing Chatbot Service...");

    // Initialize OpenRouter client
    this.aiClient = new OpenRouterClient();

    // Initialize RAG system
    this.rag = new RAGSystem();
    await this.rag.initialize();

    this.initialized = true;
    console.log("✓ Chatbot Service ready!\n");
  }

  /**
   * Add a document to the knowledge base
   * @param {string} text - Document text
   * @param {object} metadata - Optional metadata
   * @returns {Promise<string>} - Document ID
   */
  async addKnowledge(text, metadata = null) {
    await this.initialize();

    const docId = await this.rag.addDocument(text, metadata);
    console.log(`✓ Added document to knowledge base (ID: ${docId})`);
    return docId;
  }

  /**
   * Send a message and get AI response with RAG
   * @param {string} userMessage - User's message
   * @param {string} model - AI model to use
   * @param {boolean} useRag - Whether to use RAG context
   * @param {number} maxTokens - Maximum response length
   * @returns {Promise<string>} - AI's response
   */
  async chat(userMessage, model, useRag = true, maxTokens = MAX_TOKENS) {
    await this.initialize();

    let enhancedMessage = userMessage;

    // Build the prompt with RAG context
    if (useRag) {
      const context = await this.rag.getContextForQuery(
        userMessage,
        INCLUDE_DOCS_RAG,
        INCLUDE_CONVS_RAG
      );

      if (context) {
        enhancedMessage = `Context from knowledge base and past conversations:
${context}
User's question: ${userMessage}
Please answer based on the context provided above, and your general knowledge.`;
      }
    }

    // Get AI response
    const [aiResponse] = await this.aiClient.chat(
      enhancedMessage,
      model,
      maxTokens
    );

    // Store in conversation history
    this.conversationHistory.push({
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString(),
    });
    this.conversationHistory.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date().toISOString(),
    });

    // Save to RAG system (for future semantic search)
    await this.rag.addConversation(
      userMessage,
      aiResponse,
      this.sessionId,
      { model: model },
      model,
      maxTokens,
      ROLLING_WINDOW_MODE
    );

    return aiResponse;
  }

  /**
   * Get current session conversation history
   */
  getSessionHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear all stored conversation data
   * @returns {Promise<string>} - Status message
   */
  async clearConversation() {
    await this.initialize();

    try {
      const count = await this.rag.conversationsCollection.count();
      if (count === 0) {
        return "Conversation history is already empty.";
      }

      // Fetch all IDs to delete them
      const results = await this.rag.conversationsCollection.get();
      const ids = results.ids || [];

      if (ids.length > 0) {
        await this.rag.conversationsCollection.delete({ ids: ids });
        return `Successfully cleared ${ids.length} records from conversation history.`;
      }

      return "No records found to delete.";
    } catch (error) {
      console.error("Error in clearConversation:", error);
      return `Failed to clear conversation history: ${error.message}`;
    }
  }

  /**
   * Start a new conversation session
   */
  newSession() {
    this.sessionId = uuidv4();
    this.conversationHistory = [];
    console.log(`\n✓ Started new session: ${this.sessionId}\n`);
  }

  /**
   * Search the knowledge base
   * @param {string} query - Search query
   * @returns {Promise<Array>} - Search results
   */
  async searchKnowledge(query) {
    await this.initialize();
    return await this.rag.searchDocuments(query, 5);
  }

  /**
   * List all documents in the knowledge base
   * @returns {Promise<object>} - All documents
   */
  async listKnowledge() {
    await this.initialize();
    return await this.rag.documentsCollection.get();
  }

  /**
   * Delete a document from the knowledge base
   * @param {string} docId - Document ID
   * @returns {Promise<string>} - Deleted doc ID
   */
  async deleteKnowledge(docId) {
    await this.initialize();
    await this.rag.documentsCollection.delete({ ids: [docId] });
    console.log(`✓ Deleted document from knowledge base (ID: ${docId})`);
    return docId;
  }

  /**
   * Process request based on mode selection
   * This replaces the app.py gateway logic
   * @param {string} inputUser - User input
   * @param {number} modeSelection - Mode (1-6)
   * @returns {Promise<object>} - Response object
   */
  async processRequest(inputUser, modeSelection) {
    await this.initialize();

    try {
      const selectedModel = MODELS[1]; // deepseek-chat

      switch (modeSelection) {
        case 1: {
          // Standard chat (no RAG)
          const response = await this.chat(
            inputUser,
            selectedModel,
            false,
            MAX_TOKENS
          );
          return { message: response };
        }

        case 2: {
          // RAG-enabled chat
          const response = await this.chat(
            inputUser,
            selectedModel,
            true,
            MAX_TOKENS
          );
          return { message: response };
        }

        case 3: {
          // Add knowledge
          let knowledgeText = inputUser;
          let metadata = { source: "user_input" };

          // Try to parse as JSON (from WhatsApp bot with metadata)
          try {
            const payload = JSON.parse(inputUser);
            knowledgeText = payload.text || inputUser;
            metadata = payload.metadata || { source: "user_input" };

            if (!metadata.source) {
              metadata.source = "user_input";
            }
          } catch (e) {
            // Plain text input (backward compatibility)
          }

          const docId = await this.addKnowledge(knowledgeText, metadata);
          return {
            message: "✅ Knowledge successfully added to database!",
            doc_id: docId,
            text: knowledgeText,
            metadata: metadata,
          };
        }

        case 4: {
          // List knowledge
          const listKnowledge = await this.listKnowledge();
          const filtered = {
            ids: listKnowledge.ids || [],
            documents: listKnowledge.documents || [],
            metadatas: listKnowledge.metadatas || [],
          };
          return {
            message: `id: ${JSON.stringify(
              filtered.ids
            )}\ndocuments: ${JSON.stringify(
              filtered.documents
            )}\nmetadatas: ${JSON.stringify(filtered.metadatas)}`,
          };
        }

        case 5: {
          // Delete knowledge by document ID
          await this.deleteKnowledge(inputUser);
          return {
            message: `Successfully deleted knowledge with ID: ${inputUser}`,
          };
        }

        case 6: {
          // Clear conversation
          const result = await this.clearConversation();
          return { message: result };
        }

        default:
          return {
            message:
              "Invalid mode selection. Use 1 for AI, 2 for RAG-enabled AI, or 3 to add knowledge.",
          };
      }
    } catch (error) {
      // Return detailed error information
      const errorDetails = {
        error: true,
        error_type: error.name || "Error",
        error_message: error.message,
        traceback: error.stack,
      };
      console.error("[CHATBOT ERROR]", errorDetails);
      return errorDetails;
    }
  }
}

// Singleton instance
let chatbotInstance = null;

/**
 * Get or create the chatbot service instance
 * @returns {ChatbotService}
 */
export function getChatbotService() {
  if (!chatbotInstance) {
    chatbotInstance = new ChatbotService();
  }
  return chatbotInstance;
}

export { MODELS, MAX_TOKENS };
export default ChatbotService;
