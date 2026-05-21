import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { RepositoryScanner } from "./indexing/repositoryScanner.js";
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Correctly resolve to the project root: .../plugins/repo-intelligence-mcp/dist/ -> .../
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
scanner.scan().then(() => {
    console.error("Repository intelligence indexed.");
});
// Resource handlers
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const docs = scanner.getAllDocs();
    return {
        resources: docs.map(doc => ({
            uri: `repo://${doc.id}`,
            name: doc.title,
            mimeType: "text/markdown",
            description: `Intelligence document: ${doc.title}`
        }))
    };
});
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const id = request.params.uri.replace('repo://', '');
    const doc = scanner.getDoc(id);
    if (!doc)
        throw new Error(`Resource not found: ${id}`);
    return {
        contents: [{
                uri: request.params.uri,
                mimeType: "text/markdown",
                text: doc.content
            }]
    };
});
// ... rest of server implementation ...
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Repository Intelligence MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
