# How to Add AHA Guidelines

There are **three ways** to add guidelines to your app:

## Method 1: Edit the JSON File (Easiest - Recommended)

1. Open `guidelines.json` in your editor
2. Add a new document following this format:

```json
{
  "id": "aha-007",
  "title": "2024 AHA/ACC Hypertension Guideline",
  "content": "Full text of the guideline recommendations and content goes here. Be as detailed as possible since this is what users will search through.",
  "category": "Hypertension",
  "year": 2024,
  "source": "AHA/ACC",
  "keywords": ["hypertension", "blood pressure", "antihypertensive", "ACE inhibitor"]
}
```

3. Save the file
4. Restart your server (`npm start`)

**Tips:**
- Use descriptive `keywords` - these help with search accuracy
- Put the full guideline text in `content` - more text = better search results
- Use unique `id` values (e.g., "aha-007", "aha-008")
- `category` helps organize documents (e.g., "Heart Failure", "Arrhythmias", "Hypertension")

## Method 2: Use the Add Document Tool

Once your app is connected to ChatGPT, you can ask ChatGPT to add documents:

"Add a new AHA document with title '2024 Hypertension Guidelines', content '[paste content]', category 'Hypertension', year 2024"

The `add_aha_document` tool will add it to the in-memory store. **Note:** Documents added this way are lost when you restart the server unless you also save them to `guidelines.json`.

## Method 3: Edit server.js Directly

You can add documents directly in the `initializeSampleDocuments()` method in `server.js`, but this is less convenient than using the JSON file.

## Document Structure

Each document needs:
- **id**: Unique identifier (string)
- **title**: Document title (string)
- **content**: Full text content that will be searched (string) - **this is the most important field**
- **category**: Category for organization (string, optional)
- **year**: Publication year (number, optional)
- **source**: Source organization (string, optional)
- **keywords**: Array of search terms (array of strings, optional but recommended)

## Best Practices

1. **Content is key**: Put as much detail as possible in the `content` field - this is what gets searched
2. **Good keywords**: Add relevant medical terms, abbreviations, and synonyms
3. **Organize by category**: Use consistent categories (e.g., "Heart Failure", "Arrhythmias", "Hypertension")
4. **Keep it updated**: Regularly update `guidelines.json` with new AHA publications
5. **Backup your data**: Keep a backup of `guidelines.json` since it contains all your documents

## Example: Adding a Complete Guideline

```json
{
  "id": "aha-007",
  "title": "2024 AHA/ACC/AMA Hypertension Management Guideline",
  "content": "The 2024 AHA/ACC/AMA Hypertension Guideline provides updated recommendations for the prevention, detection, evaluation, and management of high blood pressure in adults. Key recommendations include: (1) Blood pressure should be measured using validated devices with proper technique, (2) Lifestyle modifications including DASH diet, sodium reduction, and regular physical activity are recommended for all patients, (3) Pharmacologic therapy should be initiated for stage 1 hypertension (130-139/80-89 mmHg) with cardiovascular disease or high risk, (4) ACE inhibitors, ARBs, calcium channel blockers, and thiazide diuretics are all acceptable first-line agents, (5) Target blood pressure is less than 130/80 mmHg for most adults, (6) Combination therapy is often needed to achieve blood pressure goals.",
  "category": "Hypertension",
  "year": 2024,
  "source": "AHA/ACC/AMA",
  "keywords": [
    "hypertension",
    "high blood pressure",
    "HTN",
    "blood pressure",
    "antihypertensive",
    "ACE inhibitor",
    "ARB",
    "calcium channel blocker",
    "thiazide",
    "DASH diet",
    "sodium",
    "BP target"
  ]
}
```

## Loading Large Documents

If you have very long documents (like full PDFs converted to text), you can:
1. Split them into multiple entries by topic/section
2. Keep them as one large entry (the search will still work)
3. Consider using a vector database for better performance with large documents


