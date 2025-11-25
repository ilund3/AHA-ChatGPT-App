import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

// Helper function to load widget HTML (reloaded on each request for live updates)
const loadWidgetHtml = () => {
  try {
    return readFileSync("public/aha-widget.html", "utf8");
  } catch (error) {
    console.error("Error loading widget HTML:", error.message);
    return "<html><body><p>Error loading widget HTML</p></body></html>";
  }
};

// Helper function to get AHA logo URL or data URI
// For ChatGPT connectors, a publicly accessible URL is preferred over data URI
const getAHALogoUrl = (baseUrl = "http://localhost:8787") => {
  try {
    // Try PNG first (official logo)
    if (existsSync("public/AHA Logo.png")) {
      // Return URL instead of data URI - ChatGPT prefers URLs for logos
      return `${baseUrl}/public/AHA%20Logo.png`;
    }
    // Fallback to SVG if PNG doesn't exist
    if (existsSync("public/aha-logo.svg")) {
      return `${baseUrl}/public/aha-logo.svg`;
    }
    console.warn("Could not find AHA logo file");
    return null;
  } catch (error) {
    console.warn("Could not load AHA logo:", error.message);
    return null;
  }
};

// Document storage for AHA guidelines
class AHADocumentStore {
  constructor() {
    this.documents = [];
    this.loadDocuments();
  }

  loadDocuments() {
    // Try to load from guidelines.json file first
    if (existsSync("guidelines.json")) {
      try {
        const fileContent = readFileSync("guidelines.json", "utf8");
        this.documents = JSON.parse(fileContent);
        console.log(`Loaded ${this.documents.length} documents from guidelines.json`);
        return;
      } catch (error) {
        console.error("Error loading guidelines.json:", error.message);
        console.log("Falling back to sample documents...");
      }
    }
    
    // Fallback to sample documents if file doesn't exist or fails to load
    this.initializeSampleDocuments();
  }

  initializeSampleDocuments() {
    // Sample AHA documents - replace with actual AHA guidelines
    this.documents = [
      {
        id: "aha-001",
        title: "2024 AHA/ACC/HFSA Heart Failure Guideline",
        content: "The 2024 AHA/ACC/HFSA Heart Failure Guideline provides comprehensive recommendations for the prevention, diagnosis, and management of heart failure. Key recommendations include: (1) Use of SGLT2 inhibitors in patients with heart failure with reduced ejection fraction (HFrEF) regardless of diabetes status, (2) Angiotensin receptor-neprilysin inhibitor (ARNI) as preferred therapy over ACE inhibitors or ARBs in appropriate patients, (3) Beta-blockers should be initiated and titrated in all patients with HFrEF, (4) Mineralocorticoid receptor antagonists are recommended in patients with HFrEF who remain symptomatic despite optimal therapy.",
        category: "Heart Failure",
        year: 2024,
        source: "AHA/ACC/HFSA",
        keywords: ["heart failure", "HFrEF", "SGLT2", "ARNI", "beta-blockers"]
      },
      {
        id: "aha-002",
        title: "2023 AHA/ACC/ACCP/HRS Atrial Fibrillation Guideline",
        content: "The 2023 AHA/ACC/ACCP/HRS Atrial Fibrillation Guideline recommends: (1) Anticoagulation therapy for stroke prevention in patients with AFib and CHA2DS2-VASc score ≥2 in men or ≥3 in women, (2) Rate control with beta-blockers, calcium channel blockers, or digoxin for symptomatic patients, (3) Rhythm control with antiarrhythmic drugs or catheter ablation for patients with symptomatic AFib, (4) Lifestyle modifications including weight loss, management of sleep apnea, and reduction of alcohol intake.",
        category: "Arrhythmias",
        year: 2023,
        source: "AHA/ACC/ACCP/HRS",
        keywords: ["atrial fibrillation", "AFib", "anticoagulation", "stroke prevention", "CHA2DS2-VASc"]
      },
      {
        id: "aha-003",
        title: "2023 AHA/ACC/ACCP/HRS Supraventricular Tachycardia Guideline",
        content: "Management of supraventricular tachycardia (SVT) includes: (1) Vagal maneuvers as first-line treatment for stable patients, (2) Adenosine for acute termination of SVT, (3) Beta-blockers or calcium channel blockers for long-term management, (4) Catheter ablation for recurrent symptomatic SVT or when medications are ineffective or not tolerated.",
        category: "Arrhythmias",
        year: 2023,
        source: "AHA/ACC/ACCP/HRS",
        keywords: ["SVT", "supraventricular tachycardia", "adenosine", "vagal maneuvers", "catheter ablation"]
      },
      {
        id: "aha-004",
        title: "2023 AHA/ACC/ACCP/HRS Ventricular Arrhythmias and Sudden Cardiac Death Guideline",
        content: "Key recommendations for ventricular arrhythmias: (1) Implantable cardioverter-defibrillator (ICD) therapy for primary prevention in patients with reduced ejection fraction (≤35%) and heart failure, (2) Beta-blockers for all patients with structural heart disease and ventricular arrhythmias, (3) Catheter ablation for recurrent ventricular tachycardia, (4) Genetic testing for inherited arrhythmia syndromes in appropriate patients.",
        category: "Arrhythmias",
        year: 2023,
        source: "AHA/ACC/ACCP/HRS",
        keywords: ["ventricular arrhythmia", "ICD", "sudden cardiac death", "VT", "genetic testing"]
      },
      {
        id: "aha-005",
        title: "2021 AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR Chest Pain Guideline",
        content: "The 2021 Chest Pain Guideline emphasizes: (1) High-sensitivity troponin testing for rapid evaluation of acute chest pain, (2) Risk stratification using validated clinical decision pathways, (3) Coronary CT angiography as an alternative to stress testing in low-to-intermediate risk patients, (4) Focus on patient-centered care and shared decision-making.",
        category: "Chest Pain",
        year: 2021,
        source: "AHA/ACC/ASE/CHEST/SAEM/SCCT/SCMR",
        keywords: ["chest pain", "troponin", "coronary CT", "risk stratification", "acute coronary syndrome"]
      },
      {
        id: "aha-006",
        title: "2023 AHA/ACC/ACCP/HRS Bradycardia and Cardiac Conduction Delay Guideline",
        content: "Management of bradycardia includes: (1) Permanent pacemaker implantation for symptomatic bradycardia or high-grade AV block, (2) Evaluation for reversible causes before pacemaker placement, (3) Dual-chamber pacing preferred over single-chamber when AV conduction is impaired, (4) Cardiac resynchronization therapy (CRT) in patients with heart failure and left bundle branch block.",
        category: "Arrhythmias",
        year: 2023,
        source: "AHA/ACC/ACCP/HRS",
        keywords: ["bradycardia", "pacemaker", "AV block", "conduction delay", "CRT"]
      }
    ];
  }

  // Add a new document to the store
  addDocument(document) {
    const newDoc = {
      id: document.id || `aha-${Date.now()}`,
      title: document.title,
      content: document.content,
      category: document.category || "General",
      year: document.year || new Date().getFullYear(),
      source: document.source || "AHA",
      keywords: document.keywords || []
    };
    this.documents.push(newDoc);
    return newDoc;
  }

  // Simple text-based search (can be enhanced with vector search or full-text search)
  search(query) {
    const queryLower = query.toLowerCase();
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);

    const scoredDocs = this.documents.map(doc => {
      let score = 0;
      const titleLower = doc.title.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const keywordsLower = doc.keywords.map(k => k.toLowerCase());

      // Title matches are weighted higher
      queryTerms.forEach(term => {
        if (titleLower.includes(term)) score += 10;
        if (contentLower.includes(term)) score += 3;
        if (keywordsLower.some(k => k.includes(term))) score += 5;
      });

      // Exact phrase matching
      if (titleLower.includes(queryLower)) score += 15;
      if (contentLower.includes(queryLower)) score += 8;

      return { doc, score };
    });

    // Filter out zero-score documents and sort by score
    return scoredDocs
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.doc);
  }

  // Get document by ID
  getDocumentById(id) {
    return this.documents.find(doc => doc.id === id);
  }

  // Get all documents
  getAllDocuments() {
    return this.documents;
  }
}

// Initialize document store
const documentStore = new AHADocumentStore();

const queryInputSchema = {
  query: z.string().min(1, "Query cannot be empty"),
};

const replyWithResults = (query, results, message) => {
  // Return content for ChatGPT to respond normally
  // The widget will display sources with citation numbers
  return {
    content: [{
      type: "text",
      text: `I found ${results.length} relevant AHA guideline${results.length > 1 ? 's' : ''}. See the app widget for source citations [1-${results.length}].`
    }],
    structuredContent: {
      query: query,
      results: results.map((doc, index) => ({
        title: doc.title,
        content: doc.content,
        source: doc.source,
        year: doc.year,
        category: doc.category,
        id: doc.id,
        citationNumber: index + 1,
        citation: `${doc.source} (${doc.year})`,
        fullCitation: `${doc.title} - ${doc.source} (${doc.year})`
      }))
    },
  };
};

function createAHAServer(baseUrl = "http://localhost:8787") {
  const server = new McpServer({ 
    name: "aha-guidelines-app", 
    version: "0.1.0",
    // Add server-level metadata to suppress text responses
    _meta: {
      "openai/suppressTextResponse": true
    }
  });

  // Load files fresh on each request (allows live updates without restart)
  const ahaHtml = loadWidgetHtml();
  const ahaLogoUrl = getAHALogoUrl(baseUrl);
  
  // Log logo URL for debugging
  if (ahaLogoUrl) {
    console.log(`AHA Logo URL: ${ahaLogoUrl}`);
  } else {
    console.warn("AHA Logo URL not found - using default icon");
  }

  // Register the UI widget resource (for tool output)
  server.registerResource(
    "aha-widget",
    "ui://widget/aha.html",
    {},
    async () => ({
      contents: [
        {
          uri: "ui://widget/aha.html",
          mimeType: "text/html+skybridge",
          text: ahaHtml,
          _meta: { 
            "openai/widgetPrefersBorder": true,
            ...(ahaLogoUrl && { "openai/emblem": ahaLogoUrl })
          },
        },
      ],
    })
  );

  // Register as an app-level resource to appear under the prompt bar
  server.registerResource(
    "aha-app",
    "ui://app/aha.html",
    {
      name: "AHA Guidelines",
      description: "American Heart Association Guidelines - Search evidence-based cardiovascular guidelines and recommendations"
    },
    async () => ({
      contents: [
        {
          uri: "ui://app/aha.html",
          mimeType: "text/html+skybridge",
          text: ahaHtml,
          _meta: { 
            "openai/widgetPrefersBorder": true,
            "openai/app": true,
            "openai/appName": "AHA Guidelines",
            "openai/appDescription": "Search evidence-based cardiovascular guidelines and recommendations",
            ...(ahaLogoUrl && { "openai/emblem": ahaLogoUrl })
          },
        },
      ],
    })
  );

  // Register tool to query AHA guidelines
  server.registerTool(
    "query_aha_guidelines",
    {
      title: "Query AHA Guidelines",
      description: `Searches American Heart Association guidelines, documents, and recommendations. Returns only information from AHA-approved sources.

When this tool is invoked, generate a thoughtful, comprehensive response based on the AHA guidelines found. Your response will appear in the chat as normal. The app widget will display the source citations that correspond to your response. Include inline citations in your response using format [1], [2], etc. to reference the sources shown in the widget.`,
      inputSchema: queryInputSchema,
      _meta: {
        "openai/outputTemplate": "ui://widget/aha.html",
        "openai/toolInvocation/invoking": "Searching AHA guidelines...",
        "openai/toolInvocation/invoked": "Response displayed in widget",
        ...(ahaLogoUrl && { "openai/icon": ahaLogoUrl })
      },
    },
    async (args) => {
      const query = args?.query?.trim() ?? "";
      
      if (!query) {
        return replyWithResults("", [], "Please provide a search query.");
      }

      // Search the document store
      const searchResults = documentStore.search(query);

      if (searchResults.length === 0) {
        return replyWithResults(
          query,
          [],
          `No AHA guidelines found matching "${query}". Please try rephrasing your query or searching for a different topic.`
        );
      }

      // Return top 5 most relevant results
      const topResults = searchResults.slice(0, 5);

      return replyWithResults(
        query,
        topResults,
        `Found ${searchResults.length} relevant AHA guideline${searchResults.length > 1 ? "s" : ""} for "${query}".`
      );
    }
  );

  // Optional: Tool to add new documents (for admin use)
  server.registerTool(
    "add_aha_document",
    {
      title: "Add AHA Document",
      description: "Adds a new AHA guideline or document to the knowledge base. Use this to expand the available guidelines.",
      inputSchema: {
        title: z.string().min(1),
        content: z.string().min(1),
        category: z.string().optional(),
        year: z.number().int().min(1900).max(2100).optional(),
        source: z.string().optional(),
        keywords: z.array(z.string()).optional(),
      },
      _meta: {
        "openai/toolInvocation/invoking": "Adding AHA document...",
        "openai/toolInvocation/invoked": "Document added successfully",
      },
    },
    async (args) => {
      const newDoc = documentStore.addDocument({
        title: args.title,
        content: args.content,
        category: args.category,
        year: args.year,
        source: args.source,
        keywords: args.keywords || [],
      });

      return {
        content: [
          {
            type: "text",
            text: `Successfully added AHA document: "${newDoc.title}" (ID: ${newDoc.id})`,
          },
        ],
      };
    }
  );

  return server;
}

const port = Number(process.env.PORT ?? 8787);
const MCP_PATH = "/mcp";

const httpServer = createServer(async (req, res) => {
  if (!req.url) {
    res.writeHead(400).end("Missing URL");
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "OPTIONS" && url.pathname === MCP_PATH) {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "content-type, mcp-session-id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "text/plain" }).end("AHA Guidelines MCP server");
    return;
  }

  // Serve static files from public directory
  if (req.method === "GET" && url.pathname.startsWith("/public/")) {
    try {
      // Decode URL-encoded path (handles spaces like %20)
      const decodedPath = decodeURIComponent(url.pathname.slice(1)); // Remove leading slash and decode
      if (existsSync(decodedPath)) {
        const fileContent = readFileSync(decodedPath);
        const ext = url.pathname.split(".").pop().toLowerCase();
        const contentType = {
          svg: "image/svg+xml",
          png: "image/png",
          jpg: "image/jpeg",
          jpeg: "image/jpeg",
          webp: "image/webp",
          html: "text/html",
          css: "text/css",
          js: "application/javascript",
        }[ext] || "application/octet-stream";
        
        res.writeHead(200, { 
          "content-type": contentType,
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        });
        res.end(fileContent);
        return;
      }
    } catch (error) {
      console.error("Error serving static file:", error);
    }
    res.writeHead(404).end("Not Found");
    return;
  }

  const MCP_METHODS = new Set(["POST", "GET", "DELETE"]);

  if (url.pathname === MCP_PATH && req.method && MCP_METHODS.has(req.method)) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");

    // Determine base URL from request
    const protocol = req.headers['x-forwarded-proto'] || (url.protocol === 'https:' ? 'https' : 'http');
    const host = req.headers.host || url.host || 'localhost:8787';
    const baseUrl = `${protocol}://${host}`;
    
    const server = createAHAServer(baseUrl);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode
      enableJsonResponse: true,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res);
    } catch (error) {
      console.error("Error handling MCP request:", error);
      if (!res.headersSent) {
        res.writeHead(500).end("Internal server error");
      }
    }

    return;
  }

  res.writeHead(404).end("Not Found");
});

httpServer.listen(port, () => {
  console.log(
    `AHA Guidelines MCP server listening on http://localhost:${port}${MCP_PATH}`
  );
  console.log(`Document store initialized with ${documentStore.getAllDocuments().length} documents`);
});

