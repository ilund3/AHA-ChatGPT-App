# AHA ChatGPT App

A ChatGPT app for the American Heart Association that provides access to AHA guidelines, documents, and recommendations. All responses are based solely on documents stored in the server, ensuring accuracy and compliance with AHA standards.

## Features

- **Document Storage**: Stores AHA guidelines and documents in a searchable database
- **Query Tool**: Search and retrieve relevant AHA guidelines based on user queries
- **Web Component**: Clean, modern UI for displaying search results
- **MCP Server**: Model Context Protocol server that exposes the app to ChatGPT

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the MCP server:**
   ```bash
   npm start
   ```
   
   The server will start on `http://localhost:8787/mcp`

3. **Test with MCP Inspector (optional):**
   ```bash
   npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
   ```

4. **Expose to public internet (for ChatGPT access):**
   
   Use ngrok or similar tool:
   ```bash
   ngrok http 8787
   ```
   
   Copy the HTTPS URL (e.g., `https://<subdomain>.ngrok.app/mcp`)

## Adding to ChatGPT

1. Enable developer mode in ChatGPT: **Settings → Apps & Connectors → Advanced settings**
2. Click **Create** to add a connector
3. Paste your MCP server URL (e.g., `https://<subdomain>.ngrok.app/mcp`)
4. Name it "AHA Guidelines" and provide a description
5. Click **Create**

**Note:** The app is configured to appear under the prompt bar as a native ChatGPT app (using `ui://app/` resource). After connecting, you should see "AHA Guidelines" appear as an app option that you can open directly, not just as a tool that gets triggered automatically.

## Adding Documents

The server comes with sample AHA documents. To add your own documents:

1. **Programmatically**: Use the `add_aha_document` tool through ChatGPT or MCP Inspector
2. **Code**: Edit `server.js` and add documents to the `initializeSampleDocuments()` method in the `AHADocumentStore` class

### Example: Adding a document via code

```javascript
documentStore.addDocument({
  title: "2024 AHA/ACC Hypertension Guideline",
  content: "Key recommendations for hypertension management...",
  category: "Hypertension",
  year: 2024,
  source: "AHA/ACC",
  keywords: ["hypertension", "blood pressure", "antihypertensive"]
});
```

## Document Storage

The current implementation uses an in-memory document store with simple text-based search. For production use, consider:

- **Vector Database**: Use embeddings and vector search (e.g., Pinecone, Weaviate, or Chroma)
- **Full-Text Search**: Implement Elasticsearch or similar
- **Database**: Store documents in PostgreSQL, MongoDB, or similar
- **File System**: Load documents from JSON/CSV files

## Project Structure

```
AHA-ChatGPT-App/
├── public/
│   ├── aha-widget.html    # Web component UI
│   └── aha-logo.svg       # AHA logo/emblem for widget
├── server.js              # MCP server with document storage
├── guidelines.json        # AHA guidelines data (optional, uses sample if missing)
├── package.json           # Dependencies
└── README.md             # This file
```

## Usage

Once connected to ChatGPT, users can query AHA guidelines:

- "What are the recommendations for heart failure management?"
- "Tell me about atrial fibrillation guidelines"
- "What does AHA say about bradycardia treatment?"

All responses will be based solely on documents in the server's knowledge base.

## Development

### Updating the Widget After Making Changes

The server automatically reloads widget files (HTML, logo, etc.) on each request, so you typically **don't need to restart** for widget changes:

**No Restart Required For:**
- ✅ Changes to `public/aha-widget.html` (widget UI/styling)
- ✅ Changes to `public/aha-logo.svg` (logo/emblem)
- ✅ Changes to `guidelines.json` (document data)

These changes will be picked up automatically on the next request to ChatGPT.

**Restart Required For:**
- 🔄 Changes to `server.js` (server logic, tool configuration)
- 🔄 Adding new dependencies in `package.json`

**To Restart the Server:**
```bash
# If running normally, stop and restart:
npm start

# Or use watch mode for auto-restart on server.js changes:
npm run dev
```

**Refreshing in ChatGPT:**
After making changes:
1. If you changed widget HTML/logo: Just trigger the tool again in ChatGPT (it will use the updated files)
2. If you changed server.js: Restart the server, then ChatGPT should pick up changes on the next tool call
3. If the widget seems cached: Try closing and reopening the ChatGPT chat or refreshing the page

### Development Commands

- **Watch mode**: `npm run dev` (auto-restarts on `server.js` changes, requires Node.js with --watch flag support)
- **Normal mode**: `npm start` (manual restart needed)
- **Port**: Set `PORT` environment variable to change the server port (default: 8787)

## Notes

- The server is stateless and creates a new MCP server instance for each request
- Documents are stored in memory and will be lost on server restart
- For production, implement persistent storage and consider authentication
- The search algorithm is basic; enhance with vector embeddings for better results




