# ResearchOS — Modern Research Workspace (Phase 1 MVP)

> **ResearchOS** is a production-quality, commercial-grade SaaS workspace for researchers, academics, and quantitative teams. It provides a cohesive environment to organize research projects, catalog scientific literature, author markdown synthesis notes, curate collections, search across research assets, and track activity audit trails.

---

## ⚡ Quick Start

### 1. Requirements
- Node.js `v20+` or `v24+`
- pnpm `v10+` or `v11+`

### 2. Setup & Database Initialization
```bash
# Install dependencies
pnpm install

# Push Prisma schema to SQLite
pnpm prisma:push

# Populate database with realistic biomedical & quantum research datasets
pnpm prisma:seed
```

### 3. Run Application
```bash
# Development server (http://localhost:3000)
pnpm dev

# Or Optimized Production Build & Server
pnpm build
pnpm start
```

---

## 🔑 Preloaded Test Credentials

You can sign in with one click from the Login page or use:

| User | Email | Password | Role / Affiliation |
|---|---|---|---|
| **Dr. Sarah Lin** | `demo@researchos.io` | `Password123!` | Principal Investigator (Stanford Bio-X) |
| **Dr. Elena Rostova** | `dr.elena@researchos.io` | `Password123!` | Senior Researcher (MIT Quantum Center) |

---

## 🏛️ Architecture Overview

```
                      +---------------------------------------+
                      |         Next.js 15 (App Router)       |
                      |   React 19, Tailwind CSS, Lucide      |
                      +-------------------+-------------------+
                                          |
                                          | REST API & JWT Bearer / Cookie
                                          v
                      +---------------------------------------+
                      |       Standardized Route Handlers     |
                      |       (/api/* with Zod Validation)    |
                      +-------------------+-------------------+
                                          |
                        +-----------------+-----------------+
                        |                 |                 |
                        v                 v                 v
               +----------------+ +----------------+ +----------------+
               |  Auth Service  | | Domain Services| |  Zod Validator |
               | (JWT / Bcrypt) | | (Projects etc) | |    Schemas     |
               +----------------+ +-------+--------+ +----------------+
                                          |
                                          v
                               +--------------------+
                               | Prisma ORM Client  |
                               +----------+---------+
                                          |
                                          v
                               +--------------------+
                               | Normalized SQLite  |
                               | (file:./dev.db)    |
                               +--------------------+
```

---

## 🗄️ Database Models (Normalized Schema)

- `User`: Accounts, credentials, roles, institutional affiliation, department.
- `Project`: Workspaces, status (`ACTIVE`, `ARCHIVED`, `COMPLETED`), colors, icons, visibility.
- `Document`: Uploaded publications, file paths, file sizes, mime types, authors, journal, year, DOI, abstract.
- `Collection`: Thematic binders grouping documents across or within projects.
- `Note`: Rich markdown research notes, code blocks, pinned flags, links to projects and documents.
- `Tag`: Taxonomy labels with color tokens.
- `DocumentTag`, `NoteTag`, `ProjectTag`: Relational join tables.
- `Activity`: Immutable chronological audit logs of user actions.

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` — Create researcher account with validation.
- `POST /api/auth/login` — Sign in and issue HTTP-only secure cookie & JWT token.
- `POST /api/auth/logout` — Invalidate session cookie.
- `GET /api/auth/me` — Inspect active user session.

### Projects
- `GET /api/projects` — Filter by status, query search, retrieve counts.
- `POST /api/projects` — Create project workspace with color, visibility, and tags.
- `GET /api/projects/:id` — Retrieve full project details, literature, and notes.
- `PATCH /api/projects/:id` — Update project metadata, archive/restore, tag associations.
- `DELETE /api/projects/:id` — Remove project workspace.
- `GET /api/projects/:id/stats` — Aggregate project storage and document counts.

### Documents
- `GET /api/documents` — Search, filter by project, collection, or tag, sort by date/size.
- `POST /api/documents` — Multipart/form-data upload storing files into `/uploads` with metadata.
- `GET /api/documents/:id` — Detailed metadata, abstract, and linked notes.
- `PATCH /api/documents/:id` — Rename, reassign project/collection, edit bibliographic data.
- `DELETE /api/documents/:id` — Delete document record and file.
- `GET /api/documents/:id/download` — Stream file download.

### Notes
- `GET /api/notes` — Search notes, filter by project or document.
- `POST /api/notes` — Create markdown note with project/document links.
- `GET /api/notes/:id` — Fetch single note.
- `PATCH /api/notes/:id` — Update content, title, pin status.
- `DELETE /api/notes/:id` — Remove note.

### Collections & Tags
- `GET /api/collections` — List collections with document counters.
- `POST /api/collections` — Create binder.
- `PATCH /api/collections/:id` — Rename or re-color collection.
- `DELETE /api/collections/:id` — Delete collection.
- `GET /api/tags` — Fetch taxonomy tags.
- `POST /api/tags` — Create tag with color.
- `DELETE /api/tags/:id` — Remove tag.

### Unified Search & Analytics
- `GET /api/search` — Multi-entity search across projects, documents, notes, collections.
- `GET /api/analytics` — 7-day velocity charts, storage usage, project distributions.
- `GET /api/activity` — Chronological audit trail.

---

## 🔮 Phase 2 AI Readiness Architecture

Phase 1 strictly omits AI features (no LLMs, RAG, vector databases, or chatbots). However, extension points are already cleanly established:
1. `src/lib/services/aiExtensionHooks.ts`: Typed interfaces (`DocumentAnalysisResult`, `SemanticSearchResult`, `hookTriggerDocumentEmbedding`, `hookRetrieveRAGContext`).
2. `Document` model: Contains `summary` (nullable string) and `embeddingStatus` (`NONE`, `PENDING`, `INDEXED`).
3. Project detail workspace: Features a dedicated Phase 2 AI Layer reserved tab for future RAG assistants and vector search.

---

## 🧪 Testing

```bash
# Backend unit & service test
node scripts/test-backend.mjs

# End-to-end HTTP integration test
node scripts/test-e2e.mjs
```
