import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./create-server.js";

const server = createServer();
await server.connect(new StdioServerTransport());

console.error("SLIIT StudyMate MCP server is ready.");