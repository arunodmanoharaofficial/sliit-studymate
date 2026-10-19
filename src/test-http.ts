import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const client = new Client({
  name: "studymate-http-test",
  version: "0.1.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://127.0.0.1:3000/mcp"),
);

try {
  await client.connect(transport);

  const { tools } = await client.listTools();

  assert.ok(
    tools.some((tool) => tool.name === "list_modules"),
    "list_modules tool was not found",
  );

  const result = await client.callTool({
    name: "list_modules",
    arguments: {},
  });

  assert.ok(!result.isError, "Tool returned an error");

  const content = result.content as Array<{
    type: string;
    text?: string;
  }>;

  const text = content.find((item) => item.type === "text")?.text;
  assert.ok(text, "Tool returned no text");

  const data = JSON.parse(text);

  assert.ok(Array.isArray(data.modules), "Expected modules array");
  assert.ok(
    data.modules.some(
      (module: { code: string }) => module.code === "IT2120",
    ),
    "Expected IT2120 module",
  );

  console.log(JSON.stringify(data, null, 2));
  console.log("\nPASS: MCP tool works over HTTP.");
} finally {
  await client.close();
}