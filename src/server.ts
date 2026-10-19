import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "sliit-studymate",
  version: "0.1.0",
});

// Initial test catalogue — not the complete semester module list.
const modules = [
  {
    code: "IT2120",
    name: "Probability and Statistics",
    year: 2,
    semester: 1,
    notesAvailable: false,
  },
];

server.registerTool(
  "list_modules",
  {
    title: "List available study modules",
    description:
      "List modules configured in StudyMate and whether their lecture notes are available. This is not the complete university catalogue.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify({ modules }, null, 2),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("SLIIT StudyMate MCP server is ready.");