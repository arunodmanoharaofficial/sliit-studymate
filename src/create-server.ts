import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const noteSchema = z.object({
  moduleCode: z.string(),
  lectureId: z.string(),
  lectureTitle: z.string(),
  page: z.number().int().positive(),
  text: z.string(),
});

const notesSchema = z.array(noteSchema);

async function loadNotes() {
  const file = await readFile(
    new URL("../data/notes.json", import.meta.url),
    "utf8",
  );

  return notesSchema.parse(JSON.parse(file));
}

function reply(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

function notesError(error: unknown) {
  console.error("Could not load notes:", error);

  return {
    ...reply({
      error: "Notes could not be loaded. Check the server's notes file.",
    }),
    isError: true,
  };
}

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function createServer() {
  const server = new McpServer({
    name: "sliit-studymate",
    version: "0.2.0",
  });

  server.registerTool(
    "list_modules",
    {
      title: "List study modules",
      description:
        "List configured StudyMate modules. This is not the complete SLIIT catalogue.",
      inputSchema: {},
      annotations: readOnlyAnnotations,
    },
    async () => {
      try {
        const notes = await loadNotes();

        return reply({
          modules: [
            {
              code: "IT2120",
              name: "Probability and Statistics",
              year: 2,
              semester: 1,
              notesAvailable: notes.some(
                (note) => note.moduleCode === "IT2120",
              ),
              materialType: "Self-authored sample notes, not official lectures",
            },
          ],
        });
      } catch (error) {
        return notesError(error);
      }
    },
  );

  server.registerTool(
    "list_lectures",
    {
      title: "List lectures for a module",
      description:
        "List available note documents for a module. Current documents are self-authored samples, not official SLIIT lectures.",
      inputSchema: {
        moduleCode: z.string().trim().min(1).max(30),
      },
      annotations: readOnlyAnnotations,
    },
    async ({ moduleCode }) => {
      try {
        const notes = await loadNotes();
        const matching = notes.filter(
          (note) => note.moduleCode === moduleCode.toUpperCase(),
        );

        const lectures = [
          ...new Map(
            matching.map((note) => [
              note.lectureId,
              {
                lectureId: note.lectureId,
                lectureTitle: note.lectureTitle,
              },
            ]),
          ).values(),
        ];

        return reply({
          moduleCode: moduleCode.toUpperCase(),
          lectures,
        });
      } catch (error) {
        return notesError(error);
      }
    },
  );

  server.registerTool(
    "search_notes",
    {
      title: "Search study notes",
      description:
        "Search sample notes using English keywords. Returns matching text with document title and page. Cite these sources; if no results are found, say so. These are not official SLIIT lectures.",
      inputSchema: {
        moduleCode: z.string().trim().min(1).max(30),
        query: z.string().trim().min(1).max(300),
      },
      annotations: readOnlyAnnotations,
    },
    async ({ moduleCode, query }) => {
      try {
        const notes = await loadNotes();

        const terms = [
          ...new Set(query.toLowerCase().match(/[a-z0-9]+/g) ?? []),
        ];

        const results = notes
          .filter(
            (note) => note.moduleCode === moduleCode.toUpperCase(),
          )
          .map((note) => {
            const searchable =
              `${note.lectureTitle} ${note.text}`.toLowerCase();

            const score = terms.filter(
              (term) => searchable.includes(term),
            ).length;

            return { ...note, score };
          })
          .filter((note) => note.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        return reply({
          materialType: "Self-authored sample notes",
          query,
          results,
          message:
            results.length === 0
              ? "No matching notes found. Try English topic keywords."
              : "Use the returned lecture title and page when citing.",
        });
      } catch (error) {
        return notesError(error);
      }
    },
  );

  return server;
}