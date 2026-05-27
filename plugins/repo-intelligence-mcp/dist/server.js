import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListToolsRequestSchema, CallToolRequestSchema, ListPromptsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { RepositoryScanner } from "./indexing/repositoryScanner.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve to project root: plugins/repo-intelligence-mcp/dist/ -> .. -> .. -> root
const rootDir = path.resolve(__dirname, '..', '..', '..');
const scanner = new RepositoryScanner(rootDir);
const server = new Server({
    name: "repo-intelligence-mcp",
    version: "1.0.0",
}, {
    capabilities: {
        resources: {},
        tools: {},
        prompts: {},
    },
});
// Scan for intelligence files on startup
await scanner.scan();
console.error("Repository intelligence indexed.");
// ── Tools ──────────────────────────────────────────────────────────
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "search_intelligence",
            description: "Full-text search across all repository intelligence documents. Matches against document title, content, and tags.",
            inputSchema: {
                type: "object",
                properties: {
                    query: {
                        type: "string",
                        description: "Search term to find in intelligence document titles, content, or tags",
                    },
                },
                required: ["query"],
            },
        },
        {
            name: "get_repo_context",
            description: "Get a repository overview: number of intelligence documents, their titles and tags, and the root directory being scanned.",
            inputSchema: {
                type: "object",
                properties: {},
            },
        },
    ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    if (name === "search_intelligence") {
        const query = String(args?.query || "").toLowerCase();
        const docs = scanner.getAllDocs();
        const results = docs.filter((doc) => doc.title.toLowerCase().includes(query) ||
            doc.content.toLowerCase().includes(query) ||
            doc.tags.some((t) => t.toLowerCase().includes(query)));
        if (results.length === 0) {
            return { content: [{ type: "text", text: "No matching documents found." }] };
        }
        return {
            content: results.map((doc) => ({
                type: "text",
                text: `# ${doc.title}\n${doc.content}\n---\nTags: ${doc.tags.join(", ")}`,
            })),
        };
    }
    if (name === "get_repo_context") {
        const docs = scanner.getAllDocs();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify({
                        rootDir,
                        documentCount: docs.length,
                        documents: docs.map((d) => ({
                            id: d.id,
                            title: d.title,
                            tags: d.tags,
                        })),
                    }, null, 2),
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${name}`);
});
// ── Prompts ────────────────────────────────────────────────────────
server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [] }));
// ── Resources ──────────────────────────────────────────────────────
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const docs = scanner.getAllDocs();
    return {
        resources: docs.map((doc) => ({
            uri: `repo://${doc.id}`,
            name: doc.title,
            mimeType: "text/markdown",
            description: `Intelligence document: ${doc.title}`,
        })),
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const id = request.params.uri.replace("repo://", "");
    const doc = scanner.getDoc(id);
    if (!doc)
        throw new Error(`Resource not found: ${id}`);
    return {
        contents: [
            {
                uri: request.params.uri,
                mimeType: "text/markdown",
                text: doc.content,
            },
        ],
    };
});
// ── Main ───────────────────────────────────────────────────────────
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Repository Intelligence MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
