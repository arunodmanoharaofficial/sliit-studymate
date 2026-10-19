import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "studymate-test-client",
  version: "0.1.0",
});

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["--import", "tsx", "src/server.ts"],
});

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
  assert.ok(Array.isArray(data.modules), "Expected a modules array");

  console.log("Returned modules:");
  console.log(JSON.stringify(data.modules, null, 2));
  console.log("\nPASS: list_modules tool works.");
} finally {
  await client.close();
}