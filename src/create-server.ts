import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function createServer() {
  const server = new McpServer({
    name: "sliit-studymate",
    version: "0.1.0",
  });

  // Initial test catalogue, not the complete university catalogue.
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
        "List modules configured in StudyMate and whether lecture notes are available. This is not the complete university catalogue.",
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

  return server;
}