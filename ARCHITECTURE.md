# AHA ChatGPT App Architecture

## System Design: Two-Tool Architecture

The app uses a **two-tool architecture** that separates data retrieval from response formatting. This ensures that the AI only uses information from the MCP server's catalog and provides a clear separation of concerns.

### Tool 1: `get_aha_guidelines` - Data Retrieval

**Purpose**: Pure data retrieval from the MCP server's document store.

**What it does**:
- Searches the AHA guidelines database stored in the MCP server
- Returns structured, raw data in JSON format
- Does NOT format responses or add prompting questions
- Does NOT use any external knowledge or training data

**Returns**:
```json
{
  "query": "heart failure",
  "found": true,
  "totalResults": 3,
  "returnedResults": 3,
  "results": [
    {
      "id": "aha-001",
      "title": "2024 AHA/ACC/HFSA Heart Failure Guideline",
      "content": "...",
      "source": "AHA/ACC/HFSA",
      "year": 2024,
      "category": "Heart Failure",
      "keywords": [...],
      "citation": "AHA/ACC/HFSA (2024)",
      "fullCitation": "..."
    }
  ]
}
```

**Key Constraints**:
- This is the EXCLUSIVE data source for AHA information
- The AI MUST ONLY use information returned by this tool
- If no results are found, the AI should NOT provide general knowledge

### Tool 2: `format_aha_response` - Response Formatting

**Purpose**: Formats the retrieved data into a user-facing response with prompting questions.

**What it does**:
- Takes the structured data from `get_aha_guidelines`
- Formats it into readable text with proper citations
- Adds contextual prompting questions based on the query
- Returns the final formatted response ready for the user

**Input**:
- `query`: The original user query
- `guidelinesData`: JSON string from `get_aha_guidelines` output

**Returns**:
- Formatted text response with:
  - Guideline content
  - Source citations
  - Contextual prompting questions

### Workflow

1. **User asks a question** about AHA guidelines
2. **AI calls `get_aha_guidelines`** to retrieve data from MCP server
3. **AI receives structured data** (only from MCP server, no other sources)
4. **AI calls `format_aha_response`** with the retrieved data
5. **AI receives formatted response** with prompting questions
6. **AI presents the formatted response** to the user

### Benefits of This Architecture

1. **Clear Data Source**: The AI can only use data from `get_aha_guidelines` - no ambiguity
2. **Separation of Concerns**: Data retrieval is separate from response formatting
3. **Enforceable Constraints**: Tool descriptions explicitly state that only MCP server data should be used
4. **Maintainability**: Easy to modify formatting logic without affecting data retrieval
5. **Testability**: Each tool can be tested independently

### Tool Descriptions

The tool descriptions are carefully crafted to:
- Explicitly state that `get_aha_guidelines` is the ONLY data source
- Instruct the AI to NOT use general knowledge when answering AHA questions
- Guide the AI to use `format_aha_response` after retrieving data
- Ensure responses are based exclusively on MCP server content

### Example Usage Flow

```
User: "What are the recommendations for heart failure?"

1. AI calls: get_aha_guidelines({ query: "heart failure" })
   → Returns: { found: true, results: [...] }

2. AI calls: format_aha_response({ 
     query: "heart failure", 
     guidelinesData: "{...}" 
   })
   → Returns: "The 2024 AHA/ACC/HFSA Heart Failure Guideline... 
               [formatted content with citations and prompting questions]"

3. AI presents formatted response to user
```

This architecture ensures that all AHA information comes exclusively from the MCP server's catalog, with no reliance on the AI's training data or general knowledge.

