import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: npm run extract:pdf -- uploads/test.pdf");
  process.exit(1);
}

const bytes = new Uint8Array(await readFile(inputPath));

const loadingTask = getDocument({
  data: bytes,
});

try {
  const pdf = await loadingTask.promise;

  const pages: Array<{ page: number; text: string }> = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const text = content.items
      .map((item) => {
        if (!("str" in item)) return "";

        return item.str + (item.hasEOL ? "\n" : " ");
      })
      .join("")
      .trim();

    pages.push({
      page: pageNumber,
      text,
    });

    page.cleanup();
  }

  const outputDirectory = new URL("../data/", import.meta.url);

  const outputFile = new URL(
    "../data/extracted-preview.json",
    import.meta.url,
  );

  await mkdir(outputDirectory, { recursive: true });

  await writeFile(
    outputFile,
    JSON.stringify(pages, null, 2),
    "utf8",
  );

  const emptyPages = pages.filter((page) => !page.text).length;

  console.log(`Total pages: ${pages.length}`);
  console.log(`Pages without extracted text: ${emptyPages}`);
  console.log("Saved: data/extracted-preview.json");
  console.log("\nFirst page preview:");
  console.log(pages[0]?.text.slice(0, 500) || "(No text found)");
} finally {
  await loadingTask.destroy();
}