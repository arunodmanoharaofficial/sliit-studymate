\# SLIIT StudyMate



An independent study assistant for SLIIT students, built with

TypeScript and Model Context Protocol (MCP).



Not affiliated with or endorsed by SLIIT.



\## Current features



\- List configured modules.

\- List available note documents for a module.

\- Search notes using English keywords.

\- Return matching text with document titles and page numbers.



The current demo includes IT2120 and self-authored sample notes.

It is not the complete SLIIT module catalogue.



\## Requirements



\- Node.js and npm (tested locally with Node.js 24)

\- Git



\## Setup — Windows PowerShell



```powershell

git clone https://github.com/arunodmanoharaofficial/sliit-studymate.git

cd sliit-studymate

npm ci

New-Item -ItemType Directory -Force data

Copy-Item examples/notes.sample.json data/notes.json

```



The copy command initializes demo data. Do not overwrite an existing

notes file if you have added your own content.



\## Check and test



```powershell

npm run typecheck

npm test

```



`npm test` starts a local stdio server and checks the `list\_modules` tool.



\## Run the HTTP server



```powershell

npm run dev:http

```



Local endpoints:



\- Health: http://127.0.0.1:3000/health

\- MCP: http://127.0.0.1:3000/mcp



With the server running, open another terminal in the project folder:



```powershell

npm run test:http

```



This checks MCP initialization and the module tool over HTTP.



\## Test with ChatGPT



For temporary development access, install cloudflared and run:



```powershell

cloudflared tunnel --url http://127.0.0.1:3000

```



Use the generated HTTPS URL with `/mcp` appended when adding

a custom MCP server in ChatGPT.



Keep both the HTTP server and tunnel running. Restarting the

Quick Tunnel may change its URL.



The demo currently uses no authentication. Only expose sample

or intentionally public content.



\## Available tools



| Tool | Purpose |

| --- | --- |

| list\_modules | List configured modules |

| list\_lectures | List note documents for a module |

| search\_notes | Search notes by English keywords |



Example prompts:



\- List the available modules.

\- List the lectures for IT2120.

\- Search IT2120 notes for "even die" and cite the title and page.

\- Search IT2120 notes for "photosynthesis".



The last query should return no matching notes with the sample data.



\## Data



Local notes are stored in `data/notes.json`.



Each entry contains:



\- moduleCode

\- lectureId

\- lectureTitle

\- page

\- text



`data/`, `uploads/`, PDFs and environment files are excluded from Git.

The repository includes only self-authored sample notes under `examples/`.



Git ignore rules do not restrict access through the running server.

All notes loaded by this demo can be returned through its tools.



\## Current limitations



\- Basic keyword matching, not semantic search.

\- No PDF importing or OCR.

\- No user accounts or access control.

\- Search returns at most five matching entries.

\- The temporary tunnel requires the local computer to remain online.

\- This is a development prototype, not a production student service.

